import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../../../services/decoded-token/decodedToken.ts";
import { SelectUsersMlIntegrations } from "../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { MlAuthServices } from "../services/auth/ml-auth-services.ts";
import { MlOrdersService } from "../orders/ml-orders-service.ts";
import { SelectMLAccountClient } from "../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../models/ml-accounts/update-ml-accounts.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export const mlOrdersSyncRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/ml/orders/sync', {
        schema: {
            tags: ['ml'],
            description: "Consulta pedidos do Mercado Livre por data de criacao/atualizacao e registra no banco",
            headers: z.object({
                token: z.string(),
                ml_user_id: z.coerce.number()
            }),
            querystring: z.object({
                dateCreatedFrom: z.string().optional(),
                dateCreatedTo: z.string().optional(),
                dateUpdatedFrom: z.string().optional(),
                dateUpdatedTo: z.string().optional(),
                offset: z.coerce.number().optional(),
                limit: z.coerce.number().optional()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    totalEncontrados: z.number(),
                    processados: z.number(),
                    erros: z.array(z.object({
                        orderId: z.number(),
                        erro: z.string()
                    }))
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                401: z.object({
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
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const { ml_user_id } = request.headers;
        const { dateCreatedFrom, dateCreatedTo, dateUpdatedFrom, dateUpdatedTo, offset, limit } = request.query;

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const systemUserCode = decoded.payload.codigo;

        const selectUsersMl = new SelectUsersMlIntegrations();
        const integracoes = await selectUsersMl.findBySystemUserCodeAndCnpj(systemUserCode, ml_user_id, empresa);

        if (!integracoes || integracoes.length === 0) {
            return reply.status(400).send({ success: false, message: "Usuário não possui conta ML vinculada." });
        }

        try {
            const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);
            const accessToken = await mlAuthServices.getValidMlAccessToken(empresa, systemUserCode, ml_user_id);

            const mlOrdersService = new MlOrdersService(mlAuthServices);
            const orderIds = await mlOrdersService.fetchOrderIds(empresa, systemUserCode, ml_user_id, {
                dateCreatedFrom,
                dateCreatedTo,
                dateUpdatedFrom,
                dateUpdatedTo,
                offset,
                limit
            });
            let processados = 0;
            const erros: { orderId: number; erro: string }[] = [];

            for (const orderId of orderIds) {
                try {
                    await mlOrdersService.processOrder(empresa, systemUserCode, ml_user_id, orderId);
                    processados++;
                } catch (e: any) {
                    erros.push({ orderId, erro: e?.message || String(e) });
                }
            }

            return reply.status(200).send({
                success: true,
                message: 'Sincronização de pedidos concluída.',
                totalEncontrados: orderIds.length,
                processados,
                erros
            });
        } catch (e: any) {
            console.error('Erro ao sincronizar pedidos ML:', e);
            return reply.status(500).send({ success: false, message: 'Erro ao sincronizar pedidos do Mercado Livre.' });
        }
    });
};

export default mlOrdersSyncRoute;
