
import { type FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z, { number, success } from 'zod';
import { SelectBranchesCampany } from '../../models/branches-company/select.ts';
import { DecodedToken } from '../../services/decoded-token/decodedToken.ts';

export const branchesCompanyRoute: FastifyPluginAsyncZod = async (server) => {
  server.get('/filias/search', {
        schema:{
            tags:['filias'],
             headers: z.object({
                token: z.string()
              }),
              querystring: z.object({
                    codigo: z.coerce.number().optional(),
                    nome_fantasia:z.coerce.string().optional(),
                    razao_social:z.coerce.string().optional(),
                    cnpj: z.coerce.string().optional(),
                    ativo: z.enum([ 'S' , 'N']).optional()
                   }),
                   response: {
                    200: z.array( 
                        z.object({
                             codigo: z.coerce.number(),
                             nome_fantasia: z.coerce.string(),
                             razao_social: z.coerce.string(),
                             cnpj: z.coerce.string(),
                             ativo: z.enum([ "S" , "N"]).default('S')
                        }),
                    ),
                    500: z.object({
                                success: z.boolean(),
                                message: z.string()
                        })
                   }
        }
    }, 
    async ( request, reply )=>{
        
                const decodedToken = DecodedToken(String(request.headers.token));
                const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
                const dbName = `\`${empresa}\``;
                const { ativo, cnpj, codigo, nome_fantasia, razao_social } = request.query;
            const selectBranchesCampany = new SelectBranchesCampany();
            try{
                const dataBranches = await selectBranchesCampany.getByParams(dbName, {ativo, cnpj, codigo, nome_fantasia, razao_social});
                return reply.status(200).send(dataBranches);

            }catch(e){
              return reply.status(500).send({ success: false, message: `Erro ao tentar consultar filiais.`}) 
            }
         
    }) 
}