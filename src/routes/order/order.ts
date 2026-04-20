import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectOrder } from '../../models/order/select.ts';
import { InsertOrder } from '../../models/order/insert.ts';
import { UpdateOrder } from '../../models/order/update.ts';
import { type OrderInstallment,type OrderItemProduct,type OrderItemService,   SelectOrderItems } from '../../models/order/select-items.ts';
import { SelectClient } from '../../models/client/select.ts';
import { DateService } from '../../utils/dateService.ts';
import { publishMessage } from '../../services/broker/publish-message.ts';
import { type OrderReceivedType, type OrderType } from '../../models/order/types/order-type.ts';

const productOrderSchema = z.object({
    codigo: z.union([z.number(), z.string()]),
    preco: z.union([z.number(), z.string()]).optional(),
    quantidade: z.union([z.number(), z.string()]),
    desconto: z.union([z.number(), z.string()]).optional(),
    total: z.union([z.number(), z.string()]),
    frete: z.union([z.number(), z.string()]).optional(),
    descricao: z.string(),
    id: z.union([z.number(), z.string()]),
    quantidade_separada: z.union([z.number(), z.string()]).optional(),
    quantidade_faturada: z.union([z.number(), z.string()]).optional()
});

const serviceOrderSchema = z.object({
    codigo: z.union([z.number(), z.string()]),
    quantidade: z.union([z.number(), z.string()]).optional(),
    desconto: z.union([z.number(), z.string()]).optional(),
    total: z.union([z.number(), z.string()]),
    valor: z.union([z.number(), z.string()]),
    aplicacao: z.string().optional(),
    id: z.union([z.number(), z.string()]),

});

const parcelOrderSchema = z.object({
    parcela: z.union([z.number(), z.string()]),
    valor: z.union([z.number(), z.string()]),
    vencimento: z.string()
});

const clientSchema = z.object({
    codigo: z.number(),
    nome: z.string().optional()
});

const orderResponseSchema = z.object({
    codigo: z.union([z.number(), z.string()]),
    id: z.union([z.number(), z.string()]).optional(),
    id_externo: z.union([z.number(), z.string()]).optional(),
    id_interno: z.string().optional(),
    vendedor: z.union([z.number(), z.string()]),
    situacao:z.enum([ 'EA' , 'FI' , 'RE' , 'AI' , 'FP' ]).optional().describe(" EA = Em aberto/orcamento , FI = Faturado integralmente , AI = aprovado/pedido , FP = faturado parcialmente "),
    situacao_separacao: z.enum(['N','P','I']).optional().describe('I =separado integralmente, P = separado parcialmente, N = não foi separado'),
    contato: z.string().optional(),
    descontos: z.union([z.number(), z.string()]).optional(),
    frete: z.union([z.number(), z.string()]).optional(),
    forma_pagamento: z.union([z.number(), z.string()]).optional(),
    quantidade_parcelas: z.union([z.number(), z.string()]).optional(),
    total_geral: z.union([z.number(), z.string()]).optional(),
    total_produtos: z.union([z.number(), z.string()]).optional(),
    total_servicos: z.union([z.number(), z.string()]).optional(),
    cliente_id: z.string(),
    cliente_nome:z.string(),
    veiculo: z.union([z.number(), z.string()]).optional(),
    data_cadastro: z.string().optional(),
    data_recadastro: z.string().optional(),
    tipo_os: z.union([z.number(), z.string()]).optional(),
    enviado: z.enum(['S' , 'N']).default('S').optional(),
    tipo: z.union([z.number(), z.string()]).optional(),
    nome: z.string().optional(),
    observacoes: z.string().optional(),
    produtos: z.array(productOrderSchema).optional(),
    servicos: z.array(serviceOrderSchema).optional(),
    parcelas: z.array(parcelOrderSchema).optional(),
    cliente_info: clientSchema.optional()
});
         
const ordersRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/pedidos', {
        schema: {
            tags: ['pedidos'],
            headers: z.object({
                token: z.string(),
                source: z.string().optional()
            }),
            body: z.array(z.object({
                codigo: z.number(),
                id: z.number().optional(),
                id_externo: z.number().optional(),
                id_interno: z.string().optional(),
                vendedor: z.number().optional(),
                situacao:z.enum([ 'EA' , 'FI' , 'RE' , 'AI' , 'FP' ]).optional().describe(" EA = Em aberto/orcamento , FI = Faturado integralmente , AI = aprovado/pedido , FP = faturado parcialmente "),
                situacao_separacao: z.enum(['N','P','I']).optional().describe('I =separado integralmente, P = separado parcialmente, N = não foi separado'),
                contato: z.string().optional(),
                descontos: z.number().optional(),
                frete: z.number().optional(),
                forma_pagamento: z.number().optional(),
                quantidade_parcelas: z.number().optional(),
                total_geral: z.number(),
                total_produtos: z.number(),
                total_servicos: z.number().optional(),
                cliente: z.object({
                    codigo: z.number()
                }).optional(),
                veiculo: z.number().optional(),
                data_cadastro: z.string().optional(),
                data_recadastro: z.string().optional(),
                tipo_os: z.number().optional(),
                tipo: z.number().optional(),
                observacoes: z.string().optional(),
                observacoes2: z.string().optional(),
                just_ipi: z.string().optional(),
                just_icms: z.string().optional(),
                just_subst: z.string().optional(),
                produtos: z.array(productOrderSchema).optional(),
                servicos: z.array(serviceOrderSchema).optional(),
                parcelas: z.array(parcelOrderSchema).optional()
            })),
            response: {
                201: z.object({
                    results: z.array(z.object({
                        codigo: z.number(),
                        status: z.string()
                    }))
                }),
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
        const insertPedido = new InsertOrder();
        const selectPedido = new SelectOrder();
        const updatePedido = new UpdateOrder();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o token!' });
        }

        const cnpj = decodedToken.payload.cnpj.replace(/\D/g, '');
        const empresa = `\`${cnpj}\``;
        const source = request.headers.source as string || 'api_internal';

        if (!request.body || request.body.length === 0) {
            return reply.status(400).send({ success: false, message: 'É necessário informar os pedidos!' });
        }

        try {
            const results = await Promise.all(request.body.map(async (p) => {
                let status: string;

                const validPedido = await selectPedido.exists(empresa, p.codigo);

                if (validPedido) {
                    const existingOrder = await selectPedido.findByCode(empresa, p.codigo);
                    if (existingOrder.length > 0) {
                        const existingRecadastro = existingOrder[0].data_recadastro;
                        
                        if (p.data_recadastro && p.data_recadastro > existingRecadastro) {
                            console.log(`Atualizando pedido ${p.codigo}`);
                            await updatePedido.update(empresa, p as OrderReceivedType, p.codigo);
                            await publishMessage(cnpj, 'pedido.atualizado', p, source);
                            status = 'atualizado';
                        } else {
                            status = `O pedido ${p.codigo} se encontra atualizado`;
                        }
                    } else {
                        status = `Pedido ${p.codigo} não encontrado para atualização`;
                    }
                } else {
                    await insertPedido.create(empresa, p as OrderReceivedType);
                    await publishMessage(cnpj, 'pedido.inserido', p, source);
                    status = 'inserido';
                }

                return { codigo: p.codigo, status };
            }));

            return reply.status(201).send({ results });
        } catch (e) {
            console.error('Erro ao processar pedidos:', e);
            return reply.status(500).send({ success: false, message: 'Erro interno ao processar pedidos.' });
        }
    });

    server.get('/pedidos', {
        schema: {
            tags: ['pedidos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                data_inicial: z.string().optional(),
                data_final: z.string().optional(), 
                vendedor: z.coerce.number().optional(),
                search: z.string().optional(),
                tipo:z.coerce.number().optional(),
                limit: z.coerce.number().optional().default(20),
                situacao: z.enum([ 'EA' , 'FI' , 'RE' , 'AI' , 'FP' ]).optional().describe(" EA = Em aberto/orcamento , FI = Faturado integralmente , AI = aprovado/pedido , FP = faturado parcialmente "),
                situacao_separacao: z.enum([ 'I' , 'P' , 'N' ]).optional().describe('I =separado integralmente, P = separado parcialmente, N = não foi separado'),
            }),
            response: {
                200: z.array(orderResponseSchema),
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
        const selectPedido = new SelectOrder();
        const selectCliente = new SelectClient();
        const selectOrderItems = new SelectOrderItems();
        const dateService = new DateService();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o token!' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const {  data_final, data_inicial , search , tipo, vendedor, limit, situacao, situacao_separacao} = request.query;

       

        if (data_final && !dateService.isValidDate(data_final)) {
            return reply.status(400).send({
                success: false,
                message: 'Informe a data no formato YYYY-MM-DD HH:mm:ss'
            });
        }

        if (data_inicial && !dateService.isValidDate(data_inicial)) {
            return reply.status(400).send({
                success: false,
                message: 'Informe a data no formato YYYY-MM-DD HH:mm:ss'
            });
        }



        try {
            const dados_orcamentos = await selectPedido.findByParams(dbName, 
                { 
                        startDate:data_inicial,
                        endDate:data_final,
                        search: search,
                        type:tipo,
                        limit: limit,
                        seller:vendedor ,
                         situacao:situacao,
                         situacao_separacao: situacao_separacao
                        });

            if (dados_orcamentos.length === 0) {
                return reply.status(200).send([]);
            }

            const orcamentos_registrados = await Promise.all(dados_orcamentos.map(async (i: OrderType) => {
                let produtos: OrderItemProduct[] = [];
                let servicos: OrderItemService[] = [];
                let parcelas: OrderInstallment[] = [];
                let cliente_info: any;

                try {
                    const resultCliente = await selectCliente.findByCode(dbName, i.cliente);
                    cliente_info = resultCliente.length > 0 ? { codigo: resultCliente[0].codigo, nome: resultCliente[0].nome } : undefined;
                } catch (e) { console.log(`Erro ao buscar o cliente do pedido ${i.codigo}`); }

                try {
                    produtos = await selectOrderItems.findProductsByOrder(dbName, i.codigo);
                } catch (e) { console.log(`Erro ao buscar os produtos do pedido ${i.codigo}`); }

                try {
                    servicos = await selectOrderItems.findServicesByOrder(dbName, i.codigo);
                } catch (e) { console.log(`Erro ao buscar os servicos do pedido ${i.codigo}`); }

                try {
                    parcelas = await selectOrderItems.findInstallmentsByOrder(dbName, i.codigo);
                } catch (e) { console.log(`Erro ao buscar as parcelas do pedido ${i.codigo}`); }

                return {
                    ...i,
                    produtos,
                    servicos,
                    parcelas,
                    cliente_info
                };
            }));
            return reply.status(200).send(orcamentos_registrados);
        } catch (error) {
            console.error('Erro ao buscar orçamentos:', error);
            return reply.status(500).send({ success: false, message: 'Erro interno ao buscar orçamentos.' });
        }
    });
    server.get('/pedidos/:codigo', {
        schema: {
            tags: ['pedidos'],
            headers: z.object({
                token: z.string()
            }),
           params: z.object({
                 codigo: z.coerce.number()
               }),
            response: {
                200: orderResponseSchema ,
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                404: z.object({
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
        const selectPedido = new SelectOrder();
        const selectCliente = new SelectClient();
        const selectOrderItems = new SelectOrderItems();
        const dateService = new DateService();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o token!' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const {  codigo } = request.params;

        try {
            const dados_orcamentos = await selectPedido.findByCode(dbName, codigo);

            if (dados_orcamentos.length === 0) {
                return reply.status(404).send({ success: false, message:`Pedido ${codigo} não foi encontrado.`});
            }

            const orcamentos_registrados = await Promise.all(dados_orcamentos.map(async (i: OrderType) => {
                let produtos: OrderItemProduct[] = [];
                let servicos: OrderItemService[] = [];
                let parcelas: OrderInstallment[] = [];
                let cliente_info: any;

                try {
                    const resultCliente = await selectCliente.findByCode(dbName, i.cliente);
                    cliente_info = resultCliente.length > 0 ? { codigo: resultCliente[0].codigo, nome: resultCliente[0].nome } : undefined;
                } catch (e) { console.log(`Erro ao buscar o cliente do pedido ${i.codigo}`); }

                try {
                    produtos = await selectOrderItems.findProductsByOrder(dbName, i.codigo);
                } catch (e) { console.log(`Erro ao buscar os produtos do pedido ${i.codigo}`); }

                try {
                    servicos = await selectOrderItems.findServicesByOrder(dbName, i.codigo);
                } catch (e) { console.log(`Erro ao buscar os servicos do pedido ${i.codigo}`); }

                try {
                    parcelas = await selectOrderItems.findInstallmentsByOrder(dbName, i.codigo);
                } catch (e) { console.log(`Erro ao buscar as parcelas do pedido ${i.codigo}`); }

                return {
                    ...i,
                    produtos,
                    servicos,
                    parcelas,
                    cliente_info
                };
            }));
            return reply.status(200).send(orcamentos_registrados[0]);
        } catch (error) {
            console.error('Erro ao buscar orçamentos:', error);
            return reply.status(500).send({ success: false, message: 'Erro interno ao buscar orçamentos.' });
        }
    });
    server.get('/pedidos/totais', {
        schema: {
            tags: ['pedidos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                vendedor: z.coerce.number()
            }),
            response: {
                200: z.array(z.object({
                    total_faturado: z.string().nullable().default('0.00'),
                    total_pedidos: z.string().nullable().default('0.00'),
                    media_pedidos: z.string().nullable().default('0.00'),
                    quantidade_pedidos: z.number().nullable(),
                    novos_clientes: z.number().nullable(),
                    total_clientes: z.number().nullable()
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
        const selectPedido = new SelectOrder();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o token!' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const vendedor = Number(request.query.vendedor);

        if (!vendedor) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o vendedor' });
        }

        try {
            const result = await selectPedido.findStats(dbName, vendedor);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Erro ao buscar totais:', e);
            return reply.status(500).send({ success: false, message: 'Erro interno ao buscar os dados dos orçamentos.' });
        }
    });

    server.get('/pedidos/ultimos', {
        schema: {
            tags: ['pedidos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                vendedor: z.coerce.number(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.array(z.object({
                    id: z.string().optional(),
                    id_externo: z.string().optional(),
                    total_geral: z.string().optional(),
                    situacao: z.string().optional(),
                    nome: z.string().optional(),
                    data_cadastro: z.string().optional(),
                    cliente_nome:z.string().optional(),
                    cliente_id:z.string().optional() 
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
        const selectPedido = new SelectOrder();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o token!' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const vendedor = Number(request.query.vendedor);
        const limit = request.query.limit || 7;

        if (!vendedor) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o vendedor' });
        }

        try {
            const result = await selectPedido.findLastInserted(dbName, vendedor, limit);
            return reply.status(200).send(result);
        } catch (e) {
            console.error('Erro ao buscar últimos inseridos:', e);
            return reply.status(500).send({ success: false, message: 'Erro interno ao buscar os dados dos orçamentos.' });
        }
    });

    server.get('/pedidos/totais-por-data', {
        schema: {
            tags: ['pedidos'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                vendedor: z.coerce.number()
            }),
             
            response: {
                200: z.array(z.object({
                    total: z.string().nullable().default('0'),
                    data_cadastro: z.string()
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
        const selectPedido = new SelectOrder();
        const decodedToken = DecodedToken(String(request.headers.token));

        if (!decodedToken.payload?.cnpj) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o token!' });
        }

        const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const vendedor = Number(request.query.vendedor);

        if (!vendedor) {
            return reply.status(400).send({ success: false, message: 'É necessário informar o vendedor' });
        }

        try {
            const result = await selectPedido.findTotalsByDate(dbName, vendedor);
            return reply.status(200).send(result);

        } catch (e) {
            console.error('Erro ao buscar totais por data:', e);
            return reply.status(500).send({ success: false, message: 'Erro interno ao buscar os dados dos orçamentos.' });
        }
    });
};

export { ordersRoute };
export default ordersRoute;
