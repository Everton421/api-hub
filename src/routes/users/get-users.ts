



import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { SelectUsersCompany } from "../../models/users-company/select.ts";
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";

export const getUserRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/user', {
        schema: {
            tags: ['users'],
            headers:z.object({
                token: z.string()
            })
        }
    }, async (request, reply) => {

        const selectUsersCompany = new SelectUsersCompany();
                let decodToken = DecodedToken(String(request.headers.token))
                    //console.log(decodToken.payload?.codigo)
                    if(decodToken.payload?.codigo && decodToken.payload?.cnpj ){
                              const  dbName = `\`${decodToken.payload?.cnpj}\``;  // Usando o CNPJ formatado como nome do banco

                        const code = decodToken.payload?.codigo;
                            const resultUser = await  selectUsersCompany.findByCode(dbName, code)
                            if(resultUser.length >  0 ){
                                    const { codigo, email ,nome } = resultUser[0] 
                                return  reply.status(200).send({ codigo, email ,nome });

                                 }else{
                                return  reply.status(400).send({  sucess: false, message: "Usuário não foi  encontrado." });
                                  }


                    }
    })  


}

