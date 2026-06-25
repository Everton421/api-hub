import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { conn } from '../../database/databaseConfig.ts';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectLotesSeries } from '../../models/lotes-series/select.ts';
import { InsertLotesSeries } from '../../models/lotes-series/insert.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const lotesSeriesResponseSchema = z.object({
    codigo: z.number(),
    produto: z.number(),
    lote: z.string().nullable(),
    serie: z.string().nullable()
});

const lotesSeriesBodySchema = z.object({
    produto: z.number(),
    lote: z.string().optional().nullable(),
    serie: z.string().optional().nullable()
});

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
        const decodedToken = DecodedToken(String(request.headers.token));
        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }
        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { produto, lote, serie } = request.body;

        try {
            const insert = new InsertLotesSeries();
            const result = await insert.insert(dbName, { produto, lote, serie });
            const item = { codigo: result.insertId, produto, lote: lote ?? null, serie: serie ?? null };
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
            body: z.object({
                codigo: z.number(),
                produto: z.number().optional(),
                lote: z.string().optional().nullable(),
                serie: z.string().optional().nullable()
            }),
            response: {
                200: lotesSeriesResponseSchema,
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
        const { codigo, produto, lote, serie } = request.body;

        try {
            const select = new SelectLotesSeries();
            const existing = await select.findByCode(dbName, codigo);
            if (existing.length === 0) {
                return reply.status(400).send({ success: false, message: 'Record not found' });
            }

            const fields: string[] = [];
            const values: any[] = [];
            if (produto !== undefined) { fields.push('produto = ?'); values.push(produto); }
            if (lote !== undefined) { fields.push('lote = ?'); values.push(lote); }
            if (serie !== undefined) { fields.push('serie = ?'); values.push(serie); }

            if (fields.length === 0) {
                return reply.status(400).send({ success: false, message: 'No fields to update' });
            }

            values.push(codigo);
            const sql = `UPDATE ${dbName}.lotes_series SET ${fields.join(', ')} WHERE codigo = ?`;
            await conn.query(sql, values);

            const [updated] = await select.findByCode(dbName, codigo);
            await publishMessage(empresa, 'lotesseriel.atualizado', updated, source);
            return reply.status(200).send(updated);
        } catch (e) {
            console.error('Error updating lotes-series:', e);
            return reply.status(400).send({ success: false, message: 'Error updating lotes-series' });
        }
    });
};

export { lotesSeriesRoute };
export default lotesSeriesRoute;
