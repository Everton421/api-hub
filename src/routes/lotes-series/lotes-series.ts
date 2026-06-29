import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectLotesSeries } from '../../models/lotes-series/select.ts';
import { InsertLotesSeries } from '../../models/lotes-series/insert.ts';
import { UpdateLotesSeries } from '../../models/lotes-series/update.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const lotesSeriesResponseSchema = z.object({
    codigo: z.number(),
    produto: z.number(),
    lote: z.string().nullable(),
    serie: z.string().nullable(),
    data_cadastro: z.string(),
    data_recadastro: z.string()
});

const lotesSeriesBodySchema = z.object({
    codigo: z.number().optional(),
    produto: z.number(),
    lote: z.string().optional().nullable(),
    serie: z.string().optional().nullable()
});

const lotesSeriesUpdateBodySchema = z.object({
    codigo: z.number(),
    produto: z.number().optional(),
    lote: z.string().optional().nullable(),
    serie: z.string().optional().nullable()
});

const lotesSeriesBulkBodySchema = z.array(z.object({
    codigo: z.number().optional(),
    produto: z.number(),
    lote: z.string().optional().nullable(),
    serie: z.string().optional().nullable()
}));

const lotesSeriesRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/lotes-series/search', {
        schema: {
            tags: ['lotes-series'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                produto: z.coerce.number().optional(),
                serie: z.string().optional()
            }),
            response: {
                200: z.array(lotesSeriesResponseSchema),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectLotesSeries();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { codigo, produto, serie } = request.query;

        try {
            let result;
            if (codigo) {
                result = await select.findByCode(dbName, codigo);
            } else if (produto) {
                result = await select.findByProduct(dbName, produto);
            } else if (serie) {
                result = await select.findBySerie(dbName, serie);
            } else {
                result = await select.findAll(dbName);
            }
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching lotes-series:', e);
            return reply.status(400).send({ success: false, message: 'Error searching lotes-series' });
        }
    });

    server.post('/lotes-series', {
        schema: {
            tags: ['lotes-series'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: lotesSeriesBodySchema,
            response: {
                201: lotesSeriesResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }
        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, produto, lote, serie } = request.body;

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const insert = new InsertLotesSeries();
            const result = await insert.insert(dbName, {
                ...(codigo !== undefined ? { codigo } : {}),
                produto,
                lote,
                serie,
                data_cadastro,
                data_recadastro
            });
            const item = {
                codigo: result.insertId,
                produto,
                lote: lote ?? null,
                serie: serie ?? null,
                data_cadastro,
                data_recadastro
            };
            await publishMessage(empresa, 'lotesseriel.inserido', item, source);
            return reply.status(201).send(item);
        } catch (e) {
            console.error('Error inserting lotes-series:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting lotes-series' });
        }
    });

    server.put('/lotes-series', {
        schema: {
            tags: ['lotes-series'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: lotesSeriesUpdateBodySchema,
            response: {
                200: lotesSeriesResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }
        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, produto, lote, serie } = request.body;

        try {
            const select = new SelectLotesSeries();
            const existing = await select.findByCode(dbName, codigo);
            if (existing.length === 0) {
                return reply.status(400).send({ success: false, message: 'Record not found' });
            }

            const update = new UpdateLotesSeries();
            const data_recadastro = dateService.obterDataHoraAtual();
            const updateData: any = { codigo, data_recadastro };
            if (produto !== undefined) updateData.produto = produto;
            if (lote !== undefined) updateData.lote = lote;
            if (serie !== undefined) updateData.serie = serie;

            await update.update(dbName, updateData);

            const [updated] = await select.findByCode(dbName, codigo);
            await publishMessage(empresa, 'lotesseriel.atualizado', updated, source);
            return reply.status(200).send(updated);
        } catch (e) {
            console.error('Error updating lotes-series:', e);
            return reply.status(400).send({ success: false, message: 'Error updating lotes-series' });
        }
    });

    server.post('/bulk/lotes-series', {
        schema: {
            tags: ['lotes-series'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: lotesSeriesBulkBodySchema,
            response: {
                200: z.object({
                    success: z.boolean(),
                    itens: z.array(z.object({
                        codigo: z.number(),
                        acao: z.string()
                    }))
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
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

        const itens: { codigo: number; acao: string }[] = [];

        try {
            const insertModel = new InsertLotesSeries();
            const updateModel = new UpdateLotesSeries();
            const select = new SelectLotesSeries();

            for (const item of dados) {
                if (item.codigo) {
                    const existing = await select.findByCode(dbName, item.codigo);
                    if (existing.length > 0) {
                        const data_recadastro = dateService.obterDataHoraAtual();
                        const updateData: any = { codigo: item.codigo, data_recadastro };
                        if (item.produto !== undefined) updateData.produto = item.produto;
                        if (item.lote !== undefined) updateData.lote = item.lote;
                        if (item.serie !== undefined) updateData.serie = item.serie;

                        await updateModel.update(dbName, updateData);

                        const [updated] = await select.findByCode(dbName, item.codigo);
                        await publishMessage(empresa, 'lotesseriel.atualizado', updated, source);
                        itens.push({ codigo: item.codigo, acao: 'atualizado' });
                    } else {
                        const data_cadastro = dateService.obterDataAtual();
                        const data_recadastro = dateService.obterDataHoraAtual();
                        const result = await insertModel.insert(dbName, {
                            codigo: item.codigo,
                            produto: item.produto,
                            lote: item.lote,
                            serie: item.serie,
                            data_cadastro,
                            data_recadastro
                        });
                        const inserted = {
                            codigo: result.insertId,
                            produto: item.produto,
                            lote: item.lote ?? null,
                            serie: item.serie ?? null,
                            data_cadastro,
                            data_recadastro
                        };
                        await publishMessage(empresa, 'lotesseriel.inserido', inserted, source);
                        itens.push({ codigo: result.insertId, acao: 'inserido' });
                    }
                } else {
                    const data_cadastro = dateService.obterDataAtual();
                    const data_recadastro = dateService.obterDataHoraAtual();
                    const result = await insertModel.insert(dbName, {
                        produto: item.produto,
                        lote: item.lote,
                        serie: item.serie,
                        data_cadastro,
                        data_recadastro
                    });
                    const inserted = {
                        codigo: result.insertId,
                        produto: item.produto,
                        lote: item.lote ?? null,
                        serie: item.serie ?? null,
                        data_cadastro,
                        data_recadastro
                    };
                    await publishMessage(empresa, 'lotesseriel.inserido', inserted, source);
                    itens.push({ codigo: result.insertId, acao: 'inserido' });
                }
            }

            return reply.status(200).send({ success: true, itens });
        } catch (e) {
            console.error('Error processing bulk lotes-series:', e);
            return reply.status(400).send({ success: false, message: 'Error processing bulk lotes-series' });
        }
    });
};

export { lotesSeriesRoute };
export default lotesSeriesRoute;
