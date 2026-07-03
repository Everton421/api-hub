import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectProductMovement } from '../../models/product-movement/select.ts';
import { InsertProductMovement } from '../../models/product-movement/insert.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';
import { type ProductMovementType } from '../../models/product-movement/types/product-movement-type.ts';
import { SelectProduct } from '../../models/product/select.ts';
import { SelectSector } from '../../models/sector/select.ts';

const productMovementResponseSchema = z.object({
    codigo: z.coerce.number(),
    setor:  z.object({
                    codigo: z.coerce.number(), 
                    id: z.coerce.string(), 
                    descricao: z.coerce.string(),
           }), 
    id:z.string(),
    produto: z.object({
                    codigo: z.coerce.number(), 
                    id: z.coerce.string(), 
                    descricao: z.coerce.string(),
                    unidade_medida:z.coerce.string()
           }),
    unidade_medida: z.string(),
    ent_sai: z.string(),
    quantidade: z.coerce.number(),
    tipo: z.string(),
    historico: z.string(),
    data_recadastro: z.string(),
    usuario: z.coerce.number(),
});

const productMovementBodySchema = z.object({
    setor: z.number(),
    produto: z.number(),
    quantidade: z.number(),
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
        const selectProduct = new SelectProduct();

        const select = new SelectProductMovement();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { data_recadastro, limit, usuario } = request.query;
        const selectSetor = new SelectSector();

        try {
            let resultMoviment = await select.findAll(dbName, { data_recadastro: data_recadastro, usuario });
            if (limit && resultMoviment.length > limit) {
                resultMoviment = resultMoviment.slice(0, limit);
            }
    let  resultMovimentRequest:any[] = [] ;

               
                for( const mov of resultMoviment ){
                    const produto = mov.produto;
                    const setor = mov.setor;
                    const [product] = await selectProduct.findByCode(dbName, produto );
                    const [ sector ] = await selectSetor.findByCode(dbName, setor);
                     resultMovimentRequest.push(   {
                         ...mov,
                        produto:{
                                codigo: product.codigo,
                                id:product.id,
                                descricao: product.descricao,
                                unidade_medida: product.unidade_medida
                        },
                        setor:{
                            codigo: sector.codigo,
                            id: sector.id,
                            descricao:sector.descricao
                        }
                     })
                }
            return reply.status(200).send(resultMovimentRequest);

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
                quantidade: z.coerce.number().optional(),
                tipo: z.string().optional(),
                historico: z.string().optional(),
                data_recadastro: z.string().optional(),
                usuario: z.coerce.number().optional(),
                ent_sai: z.enum(['E','S', '*']).default('*').optional().describe('E = Entrada, S = Saida, * = Todos'),
                limit: z.coerce.number().optional(),
                search: z.string().optional()
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
        const selectProduct = new SelectProduct();
        const selectSetor = new SelectSector();

        const select = new SelectProductMovement();
        const decodedToken = DecodedToken(String(request.headers.token));
        const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { limit, ...searchParams } = request.query;

        try {
            let resultMoviment = await select.findByParams(dbName, searchParams);
            if (limit && resultMoviment.length > limit) {
                resultMoviment = resultMoviment.slice(0, limit);
            }

                let  resultMovimentRequest:any[] = [] ;

                for( const mov of resultMoviment ){
                    const produto = mov.produto;
                    const setor = mov.setor;
                    const [product] = await selectProduct.findByCode(dbName, produto );
                    const [ sector ] = await selectSetor.findByCode(dbName, setor);
                     resultMovimentRequest.push(   {
                         ...mov,
                        produto:{
                                codigo: product.codigo,
                                id:product.id,
                                descricao: product.descricao,
                                unidade_medida: product.unidade_medida
                        },
                        setor:{
                            codigo: sector.codigo,
                            id: sector.id,
                            descricao:sector.descricao
                        }
                     })
                }
            return reply.status(200).send(resultMovimentRequest);
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
                201: z.object({
                       codigo:z.number(),
                        unidade_medida: z.string(),
                        ent_sai: z.string(),
                        quantidade: z.coerce.number(),
                        tipo: z.string(),
                        historico: z.string(),
                        data_recadastro: z.string(),
                        usuario: z.coerce.number(),
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

        const data_recadastro = dateService.obterDataHoraAtual();
 
        const insert = new InsertProductMovement();
       

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
            return reply.status(201).send(item);
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
                200: z.array(
                     z.object({
                       codigo:z.number(),
                        unidade_medida: z.string(),
                        ent_sai: z.string(),
                        quantidade: z.coerce.number(),
                        tipo: z.string(),
                        historico: z.string(),
                        data_recadastro: z.string(),
                        usuario: z.coerce.number(),
                }),
                ),
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


                    const result = await insert.insert(dbName, movementData);
                    const item: ProductMovementType = {
                        ...movementData,
                        codigo: result.insertId
                    };
                    results.push(item);

                    await publishMessage(empresa, 'movimentosprodutos.inserido', item, source);

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
