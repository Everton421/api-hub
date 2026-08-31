import axios from "axios";
import { type MlInvoiceRequestBody } from "../types/ml-invoice-payload.ts";

export class MlInvoiceRequest {

    async sendInvoiceData(baseUrl: string, shipmentId: string, body: MlInvoiceRequestBody, accessToken: string): Promise<void> {
        await axios.post(`${baseUrl}/shipments/${shipmentId}/invoice_data`, body, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
    }
}
