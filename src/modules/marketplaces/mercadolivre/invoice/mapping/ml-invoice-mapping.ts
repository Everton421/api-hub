import { type InvoicePayload } from "../../../shared/invoice/types/invoice-types.ts";
import { type MlInvoiceRequestBody } from "../types/ml-invoice-payload.ts";

export class MlInvoiceMapping {

    mapToMlBody(payload: InvoicePayload): MlInvoiceRequestBody {
        return {
            access_key: payload.chaveAcesso,
            invoice_xml: payload.xmlBase64
        };
    }
}
