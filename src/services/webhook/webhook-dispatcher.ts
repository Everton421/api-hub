import crypto from 'node:crypto';
import axios from 'axios';
import { SelectWebhook } from "../../models/webhook/select.ts";
import { UpdateWebhook } from "../../models/webhook/update.ts";

function signPayload(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function sendWebhooks(cnpj: string, evento: string, data: any, source?: string): Promise<void> {
    const select = new SelectWebhook();
    const update = new UpdateWebhook();

    const webhooks = await select.findActiveByEvent(cnpj, evento);

    if (webhooks.length === 0) return;

    const metadata_source = source || 'api_internal';

    const payload = {
        metadata: {
            tenant_id: cnpj,
            event: evento,
            timestamp: new Date().toISOString(),
            origin: metadata_source
        },
        data
    };

    const bodyString = JSON.stringify(payload);

    for (const webhook of webhooks) {
        try {
            const signature = signPayload(bodyString, webhook.secret);

            const response = await axios.post(webhook.url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature
                },
                timeout: 20000
            });

            await update.updateStatus(webhook.codigo, response.status, null);
        } catch (err: any) {
            const status = err.response?.status ?? null;
            console.log(err)
            const message = err.message || 'Erro desconhecido';
            console.error(`[Webhook] Falha ao enviar para ${webhook.url}   ${message}`);
            await update.updateStatus(webhook.codigo, status, message);
        }
    }
}
