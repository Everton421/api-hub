



import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z, { email } from "zod";
 import jwt from 'jsonwebtoken'
import { SelectUsersApi } from "../../models/users-api/select.ts";
import { validaContratoLogin } from "../../services/validaContrato/validaContrato.ts";
import { SelectUserCompany } from "../../models/user-company/select.ts";

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/login', {
        schema: {
            tags: ['login'],
            body: z.object({
                email: z.string(),
                senha: z.string()
            })

        }
    }, async (request, reply) => {

        const selectUserApi = new SelectUsersApi();
        const selectUsersCompany = new SelectUserCompany();
    

        const { email, senha } = request.body
        let validUserEmail = await selectUserApi.findByEmail(email);

        if (validUserEmail.length === 0) {
            return reply.status(400).send({ success: false, message: "Credenciais invalidas." })
        }

        const user = validUserEmail[0]

        if (!user.senha) {
            return reply.status(400).send({ success: false, message: "Credenciais invalidas." })
        }


        if (user.senha !== senha) {
            return reply.status(400).send({ success: false, message: "Credenciais invalidas." })
        }

        const validUserApi = await selectUserApi.findByEmalAndPassword(email, senha);
        if (validUserApi.length > 0) {
            let cnpj = validUserApi[0].cnpj;
            const nomeUsuario = validUserApi[0].nome
            let databaseName = validUserApi[0].cnpj.replace(/\D/g, '');

            let empresa = `\`${databaseName}\``;

            let resultUserEmpr = await selectUsersCompany.findByEmail(empresa, email);
            if (resultUserEmpr.length === 0) {
                console.log(`Não foi encontrado usuario com o email :${email} no banco de dados da empresa `);

                return reply.status(400).send({ success: false, message: "Erro interno do servidor durante a autenticação!" })
            }

            const codigoUsuario = resultUserEmpr[0].codigo

            let resultValidContrato = await validaContratoLogin(validUserApi[0].cnpj)

            if (resultValidContrato.valido === false) {
                return reply.status(400).send(
                    {
                        success: false,
                        message: resultValidContrato.tipo_contrato === 'T' ? 'Período de teste Expirado.' : `${resultValidContrato.motivo}`,
                        tipo_contrato: resultValidContrato.tipo_contrato
                    });

            }

            const secret = process.env.SECRET
             if (!secret) {
                console.error("Erro crítico: JWT_SECRET não está definido!");
                return reply.status(500).send({ success: false, message: "Erro interno do servidor [JWT Secret Missing]." });
            }

            const payload = {
                cnpj: cnpj,
                email: email,
                senha: senha,
                codigo: codigoUsuario
            }

           
            const token = jwt.sign(
                payload, secret
            )
            return reply.send({
                token: token,
            })

        } else {
            console.log("Usuario não encontrado.")
        }
    })


}

