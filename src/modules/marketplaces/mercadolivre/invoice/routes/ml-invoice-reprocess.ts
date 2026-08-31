import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../../../../services/decoded-token/decodedToken.ts";
import { buildInvoiceService } from "../../../shared/invoice/invoice-factory.ts";

export const mlInvoiceReprocessRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/ml/invoice/reprocess', {
        schema: {
            tags: ['ml'],
            description: "Reenvia para o Mercado Livre uma NF que falhou (status ERRO)",
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                codigo: z.number()
            }),
            response: {
                200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    codigo: z.number().optional()
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
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const { codigo } = request.body;

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const systemUserCode = decoded.payload.codigo;

        try {
            const invoiceService = buildInvoiceService();

            const result = await invoiceService.reprocessByCodigo(empresa, systemUserCode, codigo);

            const status = result.success ? 200 : 400;
            return reply.status(status).send({
                success: result.success,
                message: result.message,
                codigo: result.codigo
            });
        } catch (error: any) {
            console.error("Erro ao reprocessar NF:", error);
            return reply.status(500).send({ success: false, message: "Erro ao reprocessar NF." });
        }
    });
};

export default mlInvoiceReprocessRoute;