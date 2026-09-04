import { type MarketplaceInvoicePublisher } from "../../../shared/invoice/invoice-publisher.ts";
import { type InvoiceSendInput, type InvoiceSendResult } from "../../../shared/invoice/types/invoice-types.ts";
import { MlAuthServices } from "../../services/auth/ml-auth-services.ts";
import { MlInvoiceMapping } from "../mapping/ml-invoice-mapping.ts";
import { MlInvoiceRequest } from "../request/ml-invoice-request.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export class MlInvoiceService implements MarketplaceInvoicePublisher {
    private readonly mlAuthServices: MlAuthServices;
    private readonly mlInvoiceMapping: MlInvoiceMapping;
    private readonly mlInvoiceRequest: MlInvoiceRequest;

    constructor(
        mlAuthServices: MlAuthServices,
        mlInvoiceMapping: MlInvoiceMapping = new MlInvoiceMapping(),
        mlInvoiceRequest: MlInvoiceRequest = new MlInvoiceRequest()
    ) {
        this.mlAuthServices = mlAuthServices;
        this.mlInvoiceMapping = mlInvoiceMapping;
        this.mlInvoiceRequest = mlInvoiceRequest;
    }

    async sendInvoice(input: InvoiceSendInput): Promise<InvoiceSendResult> {
        const { cnpj, systemUserCode, mlUserId, payload } = input;

        try {
            const accessToken = await this.mlAuthServices.getValidMlAccessToken(cnpj, systemUserCode, mlUserId);
            const body = this.mlInvoiceMapping.mapToMlBody(payload);

            await this.mlInvoiceRequest.sendInvoiceData(ML_API_URL, payload.shipmentId, body, accessToken);

            return {
                success: true,
                shipmentId: payload.shipmentId,
                msg: "NF enviada com sucesso ao Mercado Livre!"
            };
        } catch (error: any) {
            console.error("Erro ao enviar NF para o Mercado Livre:", JSON.stringify(error.response?.data, null, 2));

            let errorMessage = "Erro ao enviar NF para o Mercado Livre.";

            if (error.response?.data?.cause) {
                const mlError = error.response.data.cause[0];
                errorMessage = `ML Recusou: ${mlError?.message || mlError} (Código: ${mlError?.code || mlError})`;
            } else if (error instanceof Error && error.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                shipmentId: payload.shipmentId,
                msg: errorMessage
            };
        }
    }
}
