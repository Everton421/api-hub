import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../../../services/decoded-token/decodedToken.ts";
import { SelectMLAccountClient } from "../../../../models/ml-accounts/select-ml-accounts.ts";

export const mlAccountsRoute: FastifyPluginAsyncZod = async (server) => {

    server.get('/ml/accounts/:codigo', {
        schema: {
            tags: ['ml/accounts'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                codigo: z.coerce.number().describe("Codigo do vendedor no sistema.")
            }),
            response: {
                200: z.array(z.object({
                     ml_user_id: z.coerce.number(),
                     integration_name: z.coerce.string() ,
                     created_at: z.coerce.string()
                }) ),
                400: z.object({
                     success: z.boolean(),
                     message: z.string()
                }),
                401: z.object({
                     success: z.boolean(),
                     message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success:false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const codigo = request.params.codigo;

        try {
            const selectMLAccountClient = new SelectMLAccountClient();
            const resultAccount = await selectMLAccountClient.findByUserIdAndIntegration(dbName, codigo);
             
            return reply.status(200).send(resultAccount);
        } catch (e) {
            return reply.status(400).send({ success: false, message: 'Erro ao tentar consultar o recurso' });
        }
    });
};