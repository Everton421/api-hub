import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const healthRoute : FastifyPluginAsyncZod = async ( server )=>{
    server.get('/health' ,  {
          schema:
            {
                tags: ['health']
            }
    }, async (request, reply )=>{
        reply.send({ ok : true });
    })
}