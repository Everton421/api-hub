import test from "node:test";
import { sendWebhooks } from "../webhook/webhook-dispatcher.ts";

test("send-message-web-hook.test",async ()=>{

    await void sendWebhooks('12264558911',  'marca.inserido', { ok:true}, 'api_internal').catch(err => {
        console.error('[Webhook] Erro ao enviar webhooks:', err);
    });

})