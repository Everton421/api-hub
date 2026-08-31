import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../../../../services/decoded-token/decodedToken.ts";
import { buildInvoiceService } from "../../../shared/invoice/invoice-factory.ts";

export const mlInvoiceWebhookRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/ml/invoice/webhook', {
        schema: {
            tags: ['ml'],
            description: "Recebe dados de faturamento (chave + XML da NF) enviados pelo ERP e envia ao Mercado Livre",
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                pedido_id_externo: z.string(),
                shipment_id: z.string(),
                chave_acesso: z.string().length(44),
                xml_base64: z.string(),
                marketplace: z.string().default('ML')
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

        const { pedido_id_externo, shipment_id, chave_acesso, xml_base64, marketplace } = request.body;

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const systemUserCode = decoded.payload.codigo;

        try {
            const invoiceService = buildInvoiceService();

            const result = await invoiceService.registerAndSend(empresa, systemUserCode, {
                pedidoIdExterno: pedido_id_externo,
                shipmentId: shipment_id,
                chaveAcesso: chave_acesso,
                xmlBase64: xml_base64,
                marketplace
            });

            const status = result.success ? 200 : 400;
            return reply.status(status).send({
                success: result.success,
                message: result.message,
                codigo: result.codigo
            });
        } catch (error: any) {
            console.error("Erro ao processar webhook de faturamento:", error);
            return reply.status(500).send({ success: false, message: "Erro ao processar faturamento." });
        }
    });
};

export default mlInvoiceWebhookRoute;