import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectLoteSerieSetor } from '../../models/lote-serie-setor/select.ts';
import { InsertLoteSerieSetor } from '../../models/lote-serie-setor/insert.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const loteSerieSetorResponseSchema = z.object({
    setor: z.number(),
    produto: z.number(),
    lote_serie: z.number(),
    estoque: z.number(),
    lote:z.string().nullable(),
    serie:z.string().nullable(),
});

const loteSerieSetorBodySchema = z.object({
    setor: z.number(),
    produto: z.number(),
    lote_serie: z.number(),
    estoque: z.number()
});

const loteSerieSetorBulkBodySchema = z.array(z.object({
    setor: z.number(),
    produto: z.number(),
    lote_serie: z.number(),
    estoque: z.number()
}));

const loteSerieSetorRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/lote-serie-setor/search', {
        schema: {
            tags: ['lote-serie-setor'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                setor: z.coerce.number().optional(),
                produto: z.coerce.number().optional(),
                lote_serie: z.coerce.number().optional(),
                serie: z.coerce.string().optional(),
                situacao_estoque: z.enum(['positivo', 'negativo', 'zerado', 'todos']).optional()
            }),
            response: {
                200: z.array(loteSerieSetorResponseSchema),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectLoteSerieSetor();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { setor, produto, lote_serie,  situacao_estoque, serie } = request.query;

        try {
            const result = await select.findByFilters(dbName, {
                setor,
                produto,
                serie,
                lote_serie,
                estoqueFilter: situacao_estoque
            });
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching lote-serie-setor:', e);
            return reply.status(400).send({ success: false, message: 'Error searching lote-serie-setor' });
        }
    });

    server.put('/lote-serie-setor', {
        schema: {
            tags: ['lote-serie-setor'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: loteSerieSetorBodySchema,
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }
        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { setor, produto, lote_serie, estoque } = request.body;

        try {
            const insert = new InsertLoteSerieSetor();
            await insert.insertOrUpdate(dbName, { setor, produto, lote_serie, estoque });
            const select = new SelectLoteSerieSetor();
            const [updated] = await select.findBySectorAndLoteSerie(dbName, setor, lote_serie);
            await publishMessage(empresa, 'loteseriesetor.atualizado', updated, source);
            return reply.status(200).send({ success: true, message: 'Stock updated successfully' });
        } catch (e) {
            console.error('Error updating lote-serie-setor:', e);
            return reply.status(400).send({ success: false, message: 'Error updating lote-serie-setor' });
        }
    });

    server.put('/bulk/lote-serie-setor', {
        schema: {
            tags: ['lote-serie-setor'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: loteSerieSetorBulkBodySchema,
            response: {
                200: z.object({
                    success: z.boolean(),
                    itens: z.array(z.object({
                        lote_serie: z.number()
                    }))
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }
        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const dados = request.body;

        if (!Array.isArray(dados) || dados.length === 0) {
            return reply.status(400).send({ success: false, message: 'Array of items is required' });
        }

        const updatedItens: { lote_serie: number }[] = [];

        try {
            const insert = new InsertLoteSerieSetor();
            for (const item of dados) {
                if (!item.setor || !item.produto || !item.lote_serie || item.estoque === undefined) {
                    return reply.status(400).send({ success: false, message: 'setor, produto, lote_serie and estoque are required for each item' });
                }
                await insert.insertOrUpdate(dbName, item);
                await publishMessage(empresa, 'loteseriesetor.atualizado', item, source);
                updatedItens.push({ lote_serie: item.lote_serie });
            }

            return reply.status(200).send({ success: true, itens: updatedItens });
        } catch (e) {
            console.error('Error updating lote-serie-setor bulk:', e);
            return reply.status(400).send({ success: false, message: 'Error updating lote-serie-setor bulk' });
        }
    });
};

export { loteSerieSetorRoute };
export default loteSerieSetorRoute;
