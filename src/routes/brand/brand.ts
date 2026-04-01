import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectBrand } from '../../models/brand/select.ts';
import { InsertBrand } from '../../models/brand/insert.ts';
import { UpdateBrand } from '../../models/brand/update.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const getBrandsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/offline/brands', {
        schema: {
            tags: ['brands'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                data_recadastro: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    id: z.number(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
                    descricao: z.string(),
                    ativo: z.string()
                })),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                500: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectBrand();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit } = request.query;

        try {
            const result = await select.findAll(dbName, limit, data_recadastro);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching brands:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching brands' });
        }
    });

    server.get('/offline/brands/search', {
        schema: {
            tags: ['brands'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                descricao: z.string().optional(),
                id: z.coerce.number().optional(),
                ativo: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    id: z.number(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
                    descricao: z.string(),
                    ativo: z.string()
                })),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectBrand();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
            const result = await select.findByParams(dbName, request.query);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching brands:', e);
            return reply.status(400).send({ success: false, message: 'Error searching brands' });
        }
    });

    server.post('/offline/brands', {
        schema: {
            tags: ['brands'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                id: z.number(),
                descricao: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: z.object({
                    codigo: z.number(),
                    id: z.number(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
                    descricao: z.string(),
                    ativo: z.string()
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
        const { id, descricao, ativo } = request.body;

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const insert = new InsertBrand();

        try {
            const result = await insert.insert(dbName, { id, descricao, ativo, data_cadastro, data_recadastro });
            const item = { codigo: result.insertId, id, descricao, ativo, data_cadastro, data_recadastro };
            await publishMessage(empresa, 'brand.inserted', item, source);
            return reply.status(200).send(item);
        } catch (e) {
            console.error('Error inserting brand:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting brand' });
        }
    });

    server.put('/offline/brands', {
        schema: {
            tags: ['brands'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.number(),
                descricao: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: z.object({
                    codigo: z.number(),
                    id: z.number(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
                    descricao: z.string(),
                    ativo: z.string()
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const select = new SelectBrand();
        const update = new UpdateBrand();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, id, descricao, ativo } = request.body;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: 'Code is required' });
        }

        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: 'Brand not found' });
        }

        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const result = await update.update(dbName, { codigo, id, descricao, ativo, data_cadastro, data_recadastro });

            if (result.affectedRows > 0) {
                const item = { codigo, id, descricao, ativo, data_cadastro, data_recadastro };
                await publishMessage(empresa, 'brand.updated', item, source);
                return reply.status(200).send(item);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating brand:', e);
            return reply.status(400).send({ success: false, message: 'Error updating brand' });
        }
    });
};

export { getBrandsRoute };
export default getBrandsRoute;