import { SelectMLAccountClient } from "../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../models/ml-accounts/update-ml-accounts.ts";
import { MlAuthServices } from "../../mercadolivre/services/auth/ml-auth-services.ts";
import { MlInvoiceService } from "../../mercadolivre/invoice/services/ml-invoice-service.ts";
import { type MarketplaceInvoicePublisher } from "./invoice-publisher.ts";
import { InvoiceService } from "./invoice.service.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export function buildInvoiceService(): InvoiceService {
    const publishers = new Map<string, MarketplaceInvoicePublisher>();

    const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);
    publishers.set('ML', new MlInvoiceService(mlAuthServices));

    return new InvoiceService(publishers);
}