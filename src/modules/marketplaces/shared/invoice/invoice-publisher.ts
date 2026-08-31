import { type InvoiceSendInput, type InvoiceSendResult } from "./types/invoice-types.ts";

export interface MarketplaceInvoicePublisher {
    sendInvoice(input: InvoiceSendInput): Promise<InvoiceSendResult>;
}
