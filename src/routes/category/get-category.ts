
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { SelectCategories    } from "../../models/categorias/select.ts";
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";
import { DateService } from "../../utils/dateService.ts";

export const getCategoryRoute : FastifyPluginAsyncZod = async ( server )=>{
    server.get('/offline/categorias' ,  {
          schema:
            {
                tags: ['categorias'],
                headers: z.object({
                    token: z.string()
                }),
                querystring: z.object({
                    data_recadastro: z.string(),
                    limit: z.number().optional()
                })
            }
    }, async (request, reply )=>{
        const dateService = new DateService();

        let select = new SelectCategories();
        let decodToken = DecodedToken(String(request.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        let dbName = `\`${empresa}\``;
        const limit = request.query.limit;
          let data_recadastro: string = '';

       if (request.query.data_recadastro) {

                if (!dateService.isValidDate(request.query.data_recadastro as string)) {
                    return reply.status(400).send({
                        erro: true,
                        msg: "Informe a data no formato YYYY-MM-DD HH:mm:ss"
                    });
                    }

                data_recadastro = String(request.query.data_recadastro);
            }
        try {

            let resultado: any = await select.findAllByLastUpdate(dbName, limit, data_recadastro);
            return reply.status(200).send(resultado)

        } catch (e) {
            console.log("ocorreu um erro ao consultar as categorias", e)
            return reply.status(500).send({ erro: true, msg: "ocorreu um erro ao consultar as categorias" })

        }
    })
}

  