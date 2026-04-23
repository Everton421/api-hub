import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectService } from '../../models/service/select.ts';
import { InsertService } from '../../models/service/insert.ts';
import { UpdateService } from '../../models/service/update.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const servicesRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/bulk/servicos', {
        schema: {
            tags: ['servicos'],
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
                    id: z.coerce.string(),
                    valor: z.coerce.string(),
                    aplicacao: z.string(),
                    tipo_serv: z.number(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
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
        const select = new SelectService();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit } = request.query;

        try {
            const result = await select.findAll(dbName, data_recadastro, limit);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching services:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching services' });
        }
    });

    server.get('/servicos/search', {
        schema: {
            tags: ['servicos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                id: z.string().optional(),
                aplicacao: z.string().optional(),
                tipo: z.coerce.number().optional(),
                ativo: z.string().optional(),
                limit: z.coerce.number().optional(),
                search: z.coerce.string().optional(),
                orderBy: z.enum(['codigo' , 'aplicacao', 'data_recadastro', 'id' ]).default('codigo')
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    id: z.coerce.string(),
                    valor: z.coerce.string(),
                    aplicacao: z.string(),
                    tipo_serv: z.number(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
                    ativo: z.string()
                })),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectService();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
            const result = await select.findByParams(dbName, request.query);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching services:', e);
            return reply.status(400).send({ success: false, message: 'Error searching services' });
        }
    });

    server.post('/servicos', {
        schema: {
            tags: ['servicos'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                id: z.coerce.string(),
                valor: z.coerce.number(),
                aplicacao: z.coerce.string(),
                tipo_serv: z.coerce.number(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                201: z.object({
                    codigo: z.number(),
                    id: z.coerce.string(),
                    valor: z.coerce.number(),
                    aplicacao: z.coerce.string(),
                    tipo_serv: z.coerce.number(),
                    data_cadastro: z.coerce.string(),
                    data_recadastro: z.coerce.string(),
                    ativo:  z.enum(['S', 'N']).default('S')
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
        const { id, valor, aplicacao, tipo_serv, ativo } = request.body;

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const insert = new InsertService();
        const select = new SelectService();
        const verify = await select.findByParams( dbName, { id:id });
        if( verify.length > 0 ) return reply.status(400).send({ success: true , message:`Service ID ${id} already exists.`}) 
        try {
            const result = await insert.insert(dbName, {  id, valor, aplicacao, tipo_serv, data_cadastro, data_recadastro, ativo });
            const item = { codigo: result.insertId, id, valor, aplicacao, tipo_serv, data_cadastro, data_recadastro, ativo };
            await publishMessage(empresa, 'servico.inserido', item, source);
            return reply.status(201).send(item);
        } catch (e) {
            console.error('Error inserting service:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting service' });
        }
    });

    server.put('/servicos', {
        schema: {
            tags: ['servicos'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.coerce.string(),
                valor: z.coerce.number(),
                aplicacao: z.coerce.string(),
                tipo_serv: z.coerce.number(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: z.object({
                    codigo: z.number(),
                    id: z.coerce.string(),
                    valor: z.coerce.number(),
                    aplicacao: z.coerce.string(),
                    tipo_serv: z.coerce.number(),
                    data_cadastro: z.coerce.string(),
                    data_recadastro: z.coerce.string(),
                    ativo: z.enum(['S', 'N']).default('S')
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const select = new SelectService();
        const update = new UpdateService();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, id, valor, aplicacao, tipo_serv, ativo } = request.body;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: 'Code is required' });
        }

        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: 'Service not found' });
        }

        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const result = await update.update(dbName, { codigo, id, valor, aplicacao, tipo_serv, data_cadastro, data_recadastro, ativo });

            if (result.affectedRows > 0) {
                const item = { codigo, id, valor, aplicacao, tipo_serv, data_cadastro, data_recadastro, ativo };
                await publishMessage(empresa, 'servico.atualizado', item, source);
                return reply.status(200).send(item);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating service:', e);
            return reply.status(400).send({ success: false, message: 'Error updating service' });
        }
    });
};

export { servicesRoute };
export default servicesRoute;
