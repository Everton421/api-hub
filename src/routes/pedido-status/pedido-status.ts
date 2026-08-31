import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";
import { SelectPedidoStatus } from "../../models/pedido-status/select.ts";

export const pedidoStatusRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/pedidos/:codigo/status-historico', {
        schema: {
            tags: ['pedidos'],
            description: "Retorna os status registrados (por categoria) de um pedido.",
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    data: z.array(z.object({
                        id: z.number().optional(),
                        pedido: z.number(),
                        marketplace: z.string(),
                        categoria: z.string(),
                        status_origem: z.string().nullable(),
                        status_detail: z.string().nullable(),
                        tags: z.string().nullable(),
                        situacao: z.string().nullable(),
                        data_evento: z.string().nullable(),
                        payload_raw: z.string().nullable(),
                        data_cadastro: z.string().optional(),
                        data_recadastro: z.string().optional()
                    }))
                }),
                401: z.object({ success: z.boolean(), message: z.string() }),
                500: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { codigo } = request.params;

        try {
            const selectPedidoStatus = new SelectPedidoStatus();
            const data = await selectPedidoStatus.findByPedido(dbName, codigo);
            return reply.status(200).send({ success: true, data });
        } catch (e) {
            console.error('Erro ao buscar status do pedido:', e);
            return reply.status(500).send({ success: false, message: 'Erro ao buscar status do pedido.' });
        }
    });

    server.get('/pedidos/status/opcoes', {
        schema: {
            tags: ['pedidos'],
            description: "Lista os status de origem distintos registrados para montar filtros no frontend.",
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                marketplace: z.string().optional(),
                categoria: z.enum(['pedido', 'pagamento', 'frete']).optional()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    data: z.array(z.object({ status_origem: z.string() }))
                }),
                401: z.object({ success: z.boolean(), message: z.string() }),
                500: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const { marketplace, categoria } = request.query;

        try {
            const selectPedidoStatus = new SelectPedidoStatus();
            const data = await selectPedidoStatus.findDistinctStatus(dbName, marketplace, categoria);
            return reply.status(200).send({ success: true, data });
        } catch (e) {
            console.error('Erro ao buscar opções de status:', e);
            return reply.status(500).send({ success: false, message: 'Erro ao buscar opções de status.' });
        }
    });
};

export default pedidoStatusRoute;
