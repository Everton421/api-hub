import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { SelectUsersMlIntegrations } from "../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { MlOrdersService } from "../orders/ml-orders-service.ts";
import { MlAuthServices } from "../services/auth/ml-auth-services.ts";
import { SelectMLAccountClient } from "../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../models/ml-accounts/update-ml-accounts.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export const mlNotificationsRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/ml/notifications', {
        schema: {
            tags: ['ml'],
            description: "Recebe notificacoes do Mercado Livre (webhook)",
            body: z.object({
                _id: z.string().optional(),
                topic: z.string(),
                resource: z.string(),
                user_id: z.number(),
                application_id: z.number().optional(),
                attempts: z.number().optional(),
                sent: z.string().optional(),
                received: z.string().optional()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { topic, resource, user_id } = request.body;
            console.log(request.body);
        if (topic !== 'orders_v2') {
            return reply.status(200).send({ success: true, message: `Topic ${topic} ignorado.` });
        }

        const orderIdStr = resource.replace('/orders/', '');
        const mlOrderId = Number(orderIdStr);

        if (!mlOrderId) {
            return reply.status(200).send({ success: false, message: 'Resource invalido.' });
        }

        const selectUsersMl = new SelectUsersMlIntegrations();
        const integracoes = await selectUsersMl.findByMlUserId(user_id);

        if (!integracoes || integracoes.length === 0) {
            return reply.status(200).send({ success: false, message: `Integracao nao encontrada para ml_user_id ${user_id}.` });
        }

        const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);
        const service = new MlOrdersService(mlAuthServices);

        for (const integracao of integracoes) {
            const cnpj = integracao.cnpj.replace(/\D/g, '');
            const systemUserCode = Number(integracao.system_user_code);

            try {
                await service.processOrder(cnpj, systemUserCode, user_id, mlOrderId);
            } catch (e) {
                console.error(`Erro ao processar pedido ML ${mlOrderId} para CNPJ ${cnpj}:`, e);
            }
        }

        return reply.status(200).send({ success: true, message: 'Notificacao recebida e processada.' });
    });
};

export default mlNotificationsRoute;
