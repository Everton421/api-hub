import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectVehicle } from '../../models/vehicle/select.ts';
import { InsertVehicle } from '../../models/vehicle/insert.ts';
import { UpdateVehicle } from '../../models/vehicle/update.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';

const getVehicleRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/offline/vehicles', {
        schema: {
            tags: ['vehicles'],
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
                    cliente: z.number(),
                    placa: z.string(),
                    marca: z.string(),
                    modelo: z.string(),
                    ano: z.string(),
                    cor: z.string(),
                    combustivel: z.string(),
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
        const select = new SelectVehicle();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit } = request.query;

        try {
            const result = await select.findAll(dbName, data_recadastro);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching vehicles:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching vehicles' });
        }
    });

    server.get('/offline/vehicles/search', {
        schema: {
            tags: ['vehicles'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                cliente: z.coerce.number().optional(),
                id: z.coerce.number().optional(),
                placa: z.string().optional(),
                marca: z.string().optional(),
                modelo: z.string().optional(),
                ano: z.string().optional(),
                ativo: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    id: z.number(),
                    cliente: z.number(),
                    placa: z.string(),
                    marca: z.string(),
                    modelo: z.string(),
                    ano: z.string(),
                    cor: z.string(),
                    combustivel: z.string(),
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
        const select = new SelectVehicle();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        try {
            const result = await select.findByParams(dbName, request.query);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching vehicles:', e);
            return reply.status(400).send({ success: false, message: 'Error searching vehicles' });
        }
    });

    server.post('/offline/vehicles', {
        schema: {
            tags: ['vehicles'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                id: z.number(),
                cliente: z.number(),
                placa: z.string(),
                marca: z.string(),
                modelo: z.string(),
                ano: z.string(),
                cor: z.string(),
                combustivel: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: z.object({
                    codigo: z.number(),
                    id: z.number(),
                    cliente: z.number(),
                    placa: z.string(),
                    marca: z.string(),
                    modelo: z.string(),
                    ano: z.string(),
                    cor: z.string(),
                    combustivel: z.string(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
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
        const { id, cliente, placa, marca, modelo, ano, cor, combustivel, ativo } = request.body;

        const data_cadastro = dateService.obterDataAtual();
        const data_recadastro = dateService.obterDataHoraAtual();

        const insert = new InsertVehicle();

        try {
            const result = await insert.insert(dbName, { id, cliente, placa, marca, modelo, ano, cor, combustivel, data_cadastro, data_recadastro, ativo });
            const item = { codigo: result.insertId, id, cliente, placa, marca, modelo, ano, cor, combustivel, data_cadastro, data_recadastro, ativo };
            await publishMessage(empresa, 'vehicle.inserted', item, source);
            return reply.status(200).send(item);
        } catch (e) {
            console.error('Error inserting vehicle:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting vehicle' });
        }
    });

    server.put('/offline/vehicles', {
        schema: {
            tags: ['vehicles'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                codigo: z.number(),
                id: z.number(),
                cliente: z.number(),
                placa: z.string(),
                marca: z.string(),
                modelo: z.string(),
                ano: z.string(),
                cor: z.string(),
                combustivel: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: z.object({
                    codigo: z.number(),
                    id: z.number(),
                    cliente: z.number(),
                    placa: z.string(),
                    marca: z.string(),
                    modelo: z.string(),
                    ano: z.string(),
                    cor: z.string(),
                    combustivel: z.string(),
                    data_cadastro: z.string(),
                    data_recadastro: z.string(),
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
        const select = new SelectVehicle();
        const update = new UpdateVehicle();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const source = request.headers.source as string || 'api_internal';
        const { codigo, id, cliente, placa, marca, modelo, ano, cor, combustivel, ativo } = request.body;

        if (!codigo) {
            return reply.status(400).send({ success: false, message: 'Code is required' });
        }

        const existing = await select.findByCode(dbName, codigo);
        if (existing.length === 0) {
            return reply.status(400).send({ success: false, message: 'Vehicle not found' });
        }

        const data_cadastro = existing[0].data_cadastro;
        const data_recadastro = dateService.obterDataHoraAtual();

        try {
            const result = await update.update(dbName, { codigo, id, cliente, placa, marca, modelo, ano, cor, combustivel, data_cadastro, data_recadastro, ativo });

            if (result.affectedRows > 0) {
                const item = { codigo, id, cliente, placa, marca, modelo, ano, cor, combustivel, data_cadastro, data_recadastro, ativo };
                await publishMessage(empresa, 'vehicle.updated', item, source);
                return reply.status(200).send(item);
            }

            return reply.status(400).send({ success: false, message: 'No rows affected' });
        } catch (e) {
            console.error('Error updating vehicle:', e);
            return reply.status(400).send({ success: false, message: 'Error updating vehicle' });
        }
    });
};

export { getVehicleRoute };
export default getVehicleRoute;
