import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectClient } from '../../models/client/select.ts';
import { InsertClient } from '../../models/client/insert.ts';
import { UpdateClient } from '../../models/client/update.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const clientResponseSchema = z.object({
    codigo: z.number(),
    id: z.number(),
    celular: z.string(),
    nome: z.string(),
    cep: z.string(),
    endereco: z.string(),
    ie: z.string(),
    numero: z.string(),
    cnpj: z.string(),
    cidade: z.string(),
    data_cadastro: z.string(),
    data_recadastro: z.string().nullable(),
    vendedor: z.number(),
    estado: z.string(),
    bairro: z.string(),
    ativo: z.string()
});

const getClientsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/offline/clients', {
        schema: {
            tags: ['clients'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                data_recadastro: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(clientResponseSchema),
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
        const select = new SelectClient();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit } = request.query;

        try {
            const result = await select.findAll(dbName, undefined, data_recadastro);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching clients:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching clients' });
        }
    });

    server.get('/offline/clients/search', {
        schema: {
            tags: ['clients'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                nome: z.string().optional(),
                cnpj: z.string().optional(),
                ativo: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(clientResponseSchema),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectClient();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
            const result = await select.findByParams(dbName, request.query);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching clients:', e);
            return reply.status(400).send({ success: false, message: 'Error searching clients' });
        }
    });

    server.get('/offline/clients/:codigo', {
        schema: {
            tags: ['clients'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: clientResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectClient();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { codigo } = request.params;

        try {
            const result = await select.findByCode(dbName, codigo);
            if (result.length === 0) {
                return reply.status(400).send({ success: false, message: 'Client not found' });
            }
            return reply.status(200).send(result[0]);
        } catch (e) {
            console.error('Error fetching client:', e);
            return reply.status(400).send({ success: false, message: 'Error fetching client' });
        }
    });

    server.post('/offline/clients', {
        schema: {
            tags: ['clients'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                id: z.number(),
                celular: z.string(),
                nome: z.string(),
                cep: z.string(),
                endereco: z.string(),
                ie: z.string().optional(),
                numero: z.string(),
                cnpj: z.string(),
                cidade: z.string(),
                vendedor: z.number(),
                estado: z.string(),
                bairro: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: clientResponseSchema,
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
        const { id, celular, nome, cep, endereco, ie, numero, cnpj, cidade, vendedor, estado, bairro, ativo } = request.body;

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const insert = new InsertClient();

        try {
            const result = await insert.insert(dbName, { 
                codigo: 0, 
                id, 
                celular, 
                nome, 
                cep, 
                endereco, 
                ie: ie || '', 
                numero, 
                cnpj, 
                cidade, 
                data_cadastro, 
                data_recadastro, 
                vendedor, 
                estado, 
                bairro, 
                ativo 
            });
            const item = { 
                codigo: result.insertId, 
                id, 
                celular, 
                nome, 
                cep, 
                endereco, 
                ie: ie || '', 
                numero, 
                cnpj, 
                cidade, 
                data_cadastro, 
                data_recadastro, 
                vendedor, 
                estado, 
                bairro, 
                ativo 
            };
            await publishMessage(empresa, 'client.inserted', item, source);
            return reply.status(200).send(item);
        } catch (e) {
            console.error('Error inserting client:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting client' });
        }
    });

    server.put('/offline/clients', {
        schema: {
            tags: ['clients'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.number(),
                celular: z.string(),
                nome: z.string(),
                cep: z.string(),
                endereco: z.string(),
                ie: z.string().optional(),
                numero: z.string(),
                cnpj: z.string(),
                cidade: z.string(),
                vendedor: z.number(),
                estado: z.string(),
                bairro: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: clientResponseSchema,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const dateService = new DateService();
        const select = new SelectClient();
        const update = new UpdateClient();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, id, celular, nome, cep, endereco, ie, numero, cnpj, cidade, vendedor, estado, bairro, ativo } = request.body;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: 'Code is required' });
        }

        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: 'Client not found' });
        }

        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const result = await update.update(dbName, { 
                codigo, 
                id, 
                celular, 
                nome, 
                cep, 
                endereco, 
                ie: ie || '', 
                numero, 
                cnpj, 
                cidade, 
                data_cadastro, 
                data_recadastro, 
                vendedor, 
                estado, 
                bairro, 
                ativo 
            });

            if (result.affectedRows > 0) {
                const item = { 
                    codigo, 
                    id, 
                    celular, 
                    nome, 
                    cep, 
                    endereco, 
                    ie: ie || '', 
                    numero, 
                    cnpj, 
                    cidade, 
                    data_cadastro, 
                    data_recadastro, 
                    vendedor, 
                    estado, 
                    bairro, 
                    ativo 
                };
                await publishMessage(empresa, 'client.updated', item, source);
                return reply.status(200).send(item);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating client:', e);
            return reply.status(400).send({ success: false, message: 'Error updating client' });
        }
    });
};

export { getClientsRoute };
export default getClientsRoute;
