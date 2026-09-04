import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../../../../services/decoded-token/decodedToken.ts";
import { buildSyncMlAnnouncementService } from "../update-announcement/announcement-composer.ts";

export const mlItemUpdatePriceStockRoute: FastifyPluginAsyncZod = async (server) => {
    server.put('/ml/anuncios/update/price-stock', {
        schema: {
            tags: ['ml'],
            description: "Atualiza preço e estoque dos anúncios de um produto no Mercado Livre (sincroniza todos os anúncios ML vinculados).",
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                codigo_produto: z.coerce.number()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    data: z.any()
                }),
                400: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                401: z.object({
                    success: z.boolean(),
                    message: z.string()
                }),
                500: z.object({
                    success: z.boolean(),
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload?.cnpj) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const { codigo_produto } = request.body;

        try {
            const service = buildSyncMlAnnouncementService();
            const result = await service.syncProductByCode(empresa, codigo_produto);

            if (result.totalAnuncios === 0) {
                return reply.status(400).send({
                    success: false,
                    message: `Nenhum anúncio ML ativo encontrado para o produto ${codigo_produto}.`
                });
            }

            return reply.status(200).send({ success: result.falhas === 0, data: result });
        } catch (e: any) {
            console.error("Erro ao atualizar preço/estoque do anúncio:", e);
            return reply.status(500).send({ success: false, message: `${e instanceof Error ? e.message : e}` });
        }
    });
};
