import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";
import { MlToolsService } from "../../services/ml-services/ml-tools-service.ts";
import { GetMlItemsService } from "../../services/ml-services/get-itens-ml-service.ts";
 
export const mlToolsRoute: FastifyPluginAsyncZod = async (server) => {

    server.post('/ml/tools/predict-category', {
        schema: {
            tags: ['ml/tools'],
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                title: z.string()
            })
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const { title } = request.body;

        if (!title || title.length < 3) {
            return reply.status(400).send({
                success: false,
                message: "O título é obrigatório e deve ter pelo menos 3 caracteres."
            });
        }

        try {
            const toolsService = new MlToolsService();
            const result = await toolsService.predictCategory(title);
            return reply.status(200).send(result);
        } catch (error: any) {
            return reply.status(500).send({
                success: false,
                message: error.message
            });
        }
    });

    server.get('/ml/tools/status_vendedor', {
        schema: {
            tags: ['ml/tools'],
            headers: z.object({
                token: z.string(),
              ml_user_id: z.coerce.number(),
            }),
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const  { codigo } = decoded.payload
        const dbName = `\`${empresa}\``;
        const { ml_user_id } = request.headers;

      
        const getMlItemsService = new GetMlItemsService();
        
        
        const result = await getMlItemsService.getStatusSeller(empresa, codigo,  ml_user_id); 
        return result.data;
    });
};