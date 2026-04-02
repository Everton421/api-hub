import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectLocation } from '../../models/location/select.ts';
import { InsertLocation } from '../../models/location/insert.ts';
import { UpdateLocation } from '../../models/location/update.ts';
import { type LocationType } from '../../models/location/types/location-type.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const locationsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/offline/locations', {
        schema: {
            tags: ['locations'],
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
                    id: z.string(),
                    setor: z.number(),
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
        const select = new SelectLocation();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit } = request.query;

        try {
            const result = await select.findAll(dbName, limit, data_recadastro);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching locations:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching locations' });
        }
    });

    server.get('/offline/locations/search', {
        schema: {
            tags: ['locations'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                id: z.string().optional(),
                descricao: z.string().optional(),
                setor: z.coerce.number().optional(),
                ativo: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    id: z.string(),
                    setor: z.number(),
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
        const select = new SelectLocation();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
            const result = await select.findByParams(dbName, request.query);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching locations:', e);
            return reply.status(400).send({ success: false, message: 'Error searching locations' });
        }
    });

    server.post('/offline/locations', {
        schema: {
            tags: ['locations'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                id: z.string(),
                descricao: z.string(),
                setor: z.number(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: z.object({
                    codigo: z.number(),
                    id: z.string(),
                    setor: z.number(),
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
        const { id, descricao, setor, ativo } = request.body;

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const insert = new InsertLocation();

        try {
            const result = await insert.insert(dbName, { id, descricao, setor, ativo, data_cadastro, data_recadastro });
            const item: LocationType = { codigo: result.insertId, id, descricao, setor, ativo, data_cadastro, data_recadastro };
            await publishMessage(empresa, 'location.inserted', item, source);
            return reply.status(200).send(item);
        } catch (e) {
            console.error('Error inserting location:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting location' });
        }
    });

    server.put('/offline/locations', {
        schema: {
            tags: ['locations'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.string().optional(),
                descricao: z.string().optional(),
                setor: z.number().optional(),
                ativo: z.enum(['S', 'N']).optional()
            }),
            response: {
                200: z.object({
                    codigo: z.number(),
                    id: z.string(),
                    setor: z.number(),
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
        const select = new SelectLocation();
        const update = new UpdateLocation();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, id, descricao, setor, ativo } = request.body;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: 'Code is required' });
        }

        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: 'Location not found' });
        }

        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const result = await update.update(dbName, { codigo, id, descricao, setor, ativo, data_cadastro, data_recadastro });

            if (result.affectedRows > 0) {
                const updated = await select.findByCode(dbName, codigo);
                const item = updated[0];
                await publishMessage(empresa, 'location.updated', item, source);
                return reply.status(200).send(item);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating location:', e);
            return reply.status(400).send({ success: false, message: 'Error updating location' });
        }
    });
};

export { locationsRoute };
export default locationsRoute;