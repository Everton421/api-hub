import {type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { SelectMarketplaces } from "../../models/marketplace/select.ts";
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";

export const marketplacesRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/marketplaces', {
        schema: {
            tags: ['marketplaces'],
            description:"Retorna os marketplaces disponiveis",
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                id: z.number().optional(),
                sigla: z.coerce.string().optional(),
                plataforma: z.coerce.string().optional(),
                url_logo: z.coerce.string().optional(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.number(),
                    sigla: z.string(),
                    plataforma: z.string(),
                    url_logo: z.string(),
                })),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                500: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                401: z.object()
            }
        }
    }, async (request, reply) => {
        if(!request.headers.token){
            return reply.status(401);
        }
         const decodedToken = DecodedToken(String(request.headers.token));
              const empresa = decodedToken.payload?.cnpj.replace(/\D/g, '');
              const dbName = `\`${empresa}\``;

        const select = new SelectMarketplaces();
        const query = request.query

        const result = await select.findByParams(query)
          
        return reply.status(200).send(result);

    });
}