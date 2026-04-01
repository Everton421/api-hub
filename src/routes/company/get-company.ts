import { type  FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';
import { SelectCompany } from '../../models/company/select.ts';

export const getCompanyRoute :FastifyPluginAsyncZod = async ( server ) =>{
    server.get('/company', { 
        schema: { 
            tags: ['company'],
            headers:z.object({
                     token: z.string()
                }),
                response: {
                    200: z.object({
                          cnpj:z.string(),
                          data_contrato: z.string(), 
                          telefone:z.string() ,
                          nome:z.string() ,
                          email:z.string() ,
                    }),
                    400: z.object()
                }
                     
        }
    },
    async ( request, reply ) =>{
                        let decodToken = DecodedToken(String(request.headers.token))
                        const selectCompany = new SelectCompany();

                              const { cnpj } = decodToken.payload!;
                        const resultCompany = await selectCompany.findByCnpj(cnpj);
                         if(resultCompany.length >  0 ){

                                const { cnpj, data_contrato, telefone, nome ,email ,  codigo  } = resultCompany[0];
                                return reply.status(200).send({ cnpj, data_contrato, telefone, nome ,email   });
                         }else{
                           return reply.status(400).send({});

                         }

                  } 
)
}