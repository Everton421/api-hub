import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectUserCompany } from '../../models/user-company/select.ts';
import { InsertUserApi } from '../../models/user-api/insert.ts';
import { InsertUserCompany } from '../../models/user-company/insert.ts';
import { DateService } from '../../utils/dateService.ts';

const getUsersRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/offline/users', {
        schema: {
            tags: ['users'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    nome: z.string(),
                    email: z.string(),
                    cnpj: z.string(),
                    responsavel: z.string(),
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
        const select = new SelectUserCompany();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { limit } = request.query;

        if (!dbName) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        try {
            const result = await select.findAll(dbName, limit ?? 100);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching users:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching users' });
        }
    });

    server.get('/offline/users/search', {
        schema: {
            tags: ['users'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(z.object({
                    codigo: z.number(),
                    nome: z.string(),
                    email: z.string(),
                    cnpj: z.string(),
                    responsavel: z.string(),
                    ativo: z.string()
                })),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectUserCompany();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        if (!dbName) {
            return reply.status(400).send({ success: false, message: 'Company identifier not provided' });
        }

        try {
            const result = await select.findByParams(dbName, request.query);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching users:', e);
            return reply.status(400).send({ success: false, message: 'Error searching users' });
        }
    });

    server.post('/offline/users', {
        schema: {
            tags: ['users'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.object({
                nome: z.string(),
                email: z.string(),
                cnpj: z.string(),
                senha: z.string(),
                responsavel: z.string(),
                telefone: z.string(),
                ativo: z.enum(['S', 'N']).default('S')
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    userApiCode: z.number(),
                    userCompanyCode: z.number()
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
        const { nome, email, cnpj, senha, responsavel, telefone, ativo } = request.body;

        const insertUserApi = new InsertUserApi();
        const insertUserCompany = new InsertUserCompany();

        try {
            const resultUserApi = await insertUserApi.insert({ nome, email, cnpj, senha, responsavel, telefone });
            const userApiCode = resultUserApi.insertId;

            const resultUserCompany = await insertUserCompany.insert(dbName, { nome, email, cnpj, senha, responsavel, ativo });
            const userCompanyCode = resultUserCompany.insertId;

            return reply.status(200).send({
                success: true,
                message: 'User created successfully',
                userApiCode,
                userCompanyCode
            });
        } catch (e) {
            console.error('Error creating user:', e);
            return reply.status(400).send({ success: false, message: 'Error creating user' });
        }
    });
};

export { getUsersRoute };
export default getUsersRoute;
