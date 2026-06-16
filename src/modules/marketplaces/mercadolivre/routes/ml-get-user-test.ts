import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../../../services/decoded-token/decodedToken.ts";
import { SelectMLAccountClient } from "../../../../models/ml-accounts/select-ml-accounts.ts";
import { SelectUsersMlIntegrations } from "../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { GetUserTest } from "../services/get-test-user.ts";

export const GetMlUserTestRoute: FastifyPluginAsyncZod = async (server) => {

    server.get('/ml/user_test', {
        schema: {
            tags: ['ml/accounts'],
            headers: z.object({
                token: z.string(),
                ml_user_id: z.string(),
            }),
            /*response: {
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
            */
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success:false, message: "Token inválido" });
        }

        const getUserTest = new GetUserTest();
        const selectUsersMl = new SelectUsersMlIntegrations();

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;
        const codigo = decoded.payload.codigo;
        const ml_user_id = request.headers.ml_user_id;

            const integracoes = await selectUsersMl.findBySystemUserCodeAndCnpj(Number(codigo), Number(ml_user_id), empresa);
         if (!integracoes || integracoes.length === 0) {
             return reply.status(400).send({ msg: "Usuário não possui conta ML vinculada." });
         }

        try {

            const result = await getUserTest.getUser(empresa, Number(codigo), Number(ml_user_id))
            //const selectMLAccountClient = new SelectMLAccountClient();
            //const resultAccount = await selectMLAccountClient.findByUserIdAndIntegration(dbName, codigo);
             
            return reply.status(200).send(result);
        } catch (e) {
            console.log(e)
            return reply.status(400).send({ success: false, message: 'Erro ao tentar consultar o recurso' });
        }
    });
};