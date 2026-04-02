import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectSector } from '../../models/sector/select.ts';
import { InsertSector } from '../../models/sector/insert.ts';
import { UpdateSector } from '../../models/sector/update.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const sectorsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/bulk/setores', {
        schema: {
            tags: ['setores'],
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
        const select = new SelectSector();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro } = request.query;

        try {
            const result = await select.findAll(dbName, data_recadastro);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching sectors:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching sectors' });
        }
    });

    server.get('/setores/search', {
        schema: {
            tags: ['setores'],
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
        const select = new SelectSector();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
            const result = await select.findByParams(dbName, request.query);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching sectors:', e);
            return reply.status(400).send({ success: false, message: 'Error searching sectors' });
        }
    });

    server.post('/setores', {
        schema: {
            tags: ['setores'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                id: z.number(),
                descricao: z.string()
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
        const { id, descricao } = request.body;

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const insert = new InsertSector();

        try {
            const result = await insert.insert(dbName, { id, descricao, data_cadastro, data_recadastro, codigo: 0, ativo: 'S' });
            const item = { codigo: result.insertId, id, descricao, ativo: 'S', data_cadastro, data_recadastro };
            await publishMessage(empresa, 'sector.inserted', item, source);
            return reply.status(200).send(item);
        } catch (e) {
            console.error('Error inserting sector:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting sector' });
        }
    });

    server.put('/setores', {
        schema: {
            tags: ['setores'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.number(),
                descricao: z.string()
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
        const select = new SelectSector();
        const update = new UpdateSector();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, id, descricao } = request.body;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: 'Code is required' });
        }

        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: 'Sector not found' });
        }

        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const result = await update.update(dbName, { codigo, id, descricao, data_cadastro, data_recadastro, ativo: 'S' });

            if (result.affectedRows > 0) {
                const item = { codigo, id, descricao, ativo: 'S', data_cadastro, data_recadastro };
                await publishMessage(empresa, 'sector.updated', item, source);
                return reply.status(200).send(item);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating sector:', e);
            return reply.status(400).send({ success: false, message: 'Error updating sector' });
        }
    });
};

export { sectorsRoute };
export default sectorsRoute;
