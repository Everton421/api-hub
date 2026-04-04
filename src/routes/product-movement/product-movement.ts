import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectProductMovement } from '../../models/product-movement/select.ts';
import { InsertProductMovement } from '../../models/product-movement/insert.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';
import { type ProductMovementType } from '../../models/product-movement/types/product-movement-type.ts';

const productMovementResponseSchema = z.object({
    codigo: z.number(),
    setor: z.number(),
    produto: z.number(),
    unidade_medida: z.string(),
    ent_sai: z.string(),
    quantidade: z.string(),
    tipo: z.string(),
    historico: z.string(),
    data_recadastro: z.string(),
    usuario: z.number(),
    id_setor: z.number().optional(),
    id_produto: z.number().optional()
});

const productMovementBodySchema = z.object({
    codigo: z.number(),
    setor: z.number(),
    produto: z.number(),
    quantidade: z.string(),
    unidade_medida: z.string(),
    tipo: z.string(),
    historico: z.string(),
    usuario: z.number(),
    ent_sai: z.string()
});

const productMovementsRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/bulk/movimentos_produtos', {
        schema: {
            tags: ['movimentos produtos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                data_recadastro: z.string().optional(),
                limit: z.coerce.number().optional(),
                usuario: z.coerce.number().optional()
            }),
            response: {
                200: z.array(productMovementResponseSchema),
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
        const select = new SelectProductMovement();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit, usuario } = request.query;

        try {
            let result = await select.findAll(dbName, { data_recadastro: data_recadastro, usuario });
            if (limit && result.length > limit) {
                result = result.slice(0, limit);
            }
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error fetching product movements:', e);
            return reply.status(500).send({ success: false, message: 'Error fetching product movements' });
        }
    });

    server.get('/movimentos_produtos/search', {
        schema: {
            tags: ['movimentos produtos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                codigo: z.coerce.number().optional(),
                setor: z.coerce.number().optional(),
                produto: z.coerce.number().optional(),
                quantidade: z.string().optional(),
                tipo: z.string().optional(),
                historico: z.string().optional(),
                data_recadastro: z.string().optional(),
                usuario: z.coerce.number().optional(),
                ent_sai: z.string().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(productMovementResponseSchema),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const select = new SelectProductMovement();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { limit, ...searchParams } = request.query;

        try {
            let result = await select.findByParams(dbName, searchParams);
            if (limit && result.length > limit) {
                result = result.slice(0, limit);
            }
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Error searching product movements:', e);
            return reply.status(400).send({ success: false, message: 'Error searching product movements' });
        }
    });

    server.post('/movimentos_produtos', {
        schema: {
            tags: ['movimentos produtos'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: productMovementBodySchema,
            response: {
                200: productMovementResponseSchema,
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

        const data_recadastro = dateService.obterDataHoraAtual();
        const { codigo, usuario} = request.body
        const insert = new InsertProductMovement();
        const select = new SelectProductMovement();

                const verify = await select.findByCodeAndUser(dbName, codigo, usuario  )

                    if(verify.length > 0 ) return reply.status(400).send({ success : false, message:`Moviment CODE: ${codigo} `})
        try {
            const movementData = {
                ...request.body,
                data_recadastro
            };

            const result = await insert.insert(dbName, movementData);
            const item: ProductMovementType = {
                ...movementData,
                codigo: result.insertId
            };

            await publishMessage(empresa, 'movimentosprodutos.inserido', item, source);
            return reply.status(200).send(item);
        } catch (e) {
            console.error('Error inserting product movement:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting product movement' });
        }
    });

    server.post('/bulk/movimentos_produtos', {
        schema: {
            tags: ['movimentos produtos'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.array(productMovementBodySchema),
            response: {
                200: z.array(productMovementResponseSchema),
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

        const data_recadastro = dateService.obterDataHoraAtual();
        const insert = new InsertProductMovement();
        const select = new SelectProductMovement();

        try {
            const results: ProductMovementType[] = [];
            console.log(request.body)
            for (const movement of request.body) {
                const movementData = {
                    ...movement,
                    data_recadastro
                };

                const verify = await select.findByCodeAndUser(dbName,    movement.codigo,  movement.usuario  )
                console.log(verify)
                if (verify.length > 0) {
                    console.log(` o movimento: ${movement.codigo} ja foi registrado  `)

                } else {

                    const result = await insert.insertWithCode(dbName, movementData);
                    const item: ProductMovementType = {
                        ...movementData,
                        codigo: result.insertId
                    };
                    results.push(item);

                    await publishMessage(empresa, 'movimentosprodutos.inserido', item, source);
                }

            }

            return reply.status(200).send(results);
        } catch (e) {
            console.error('Error inserting product movements batch:', e);
            return reply.status(400).send({ success: false, message: 'Error inserting bulk product movements' });
        }
    });
};

export { productMovementsRoute };
export default productMovementsRoute;
