import { connectRabbitMQ, getChannel, getConnection } from "./broker.ts";
import { UpdateMlAnnouncementService } from "../modules/marketplaces/mercadolivre/announcement/update-announcement/update-ml-announcement-service.ts";
import { UpdateMlAnnouncement } from "../modules/marketplaces/mercadolivre/announcement/update-announcement/update-ml-announcement.ts";
import { MlAnnouncementMapping } from "../modules/marketplaces/mercadolivre/announcement/mapping/ml-announcement-mapping.ts";
import { MlAuthServices } from "../modules/marketplaces/mercadolivre/services/auth/ml-auth-services.ts";
import { SelectMLAccountClient } from "../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../models/ml-accounts/update-ml-accounts.ts";

const QUEUE_NAME = 'q.integracao.mercadolivre';
const EXCHANGE = process.env.EXCHANGE_NAME;
const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';
const service = new UpdateMlAnnouncementService(new UpdateMlAnnouncement(new MlAnnouncementMapping(), new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL)));
// Routing keys de estoque/preço de produto que disparam a sincronização com o ML
const BINDING_KEYS = [
    'tenant.*.produtosetor.atualizado',
    'tenant.*.produto.atualizado'
];

let started = false;

export async function startMlConsumer(): Promise<void> {
    if (started) return;
    started = true;

    try {
        await connectRabbitMQ();

        const connection = getConnection();
        const channel = getChannel();

        if (!connection || !channel) {
            console.error("[ Consumer ML ] Sem conexão/canal RabbitMQ disponível.");
            started = false;
            return;
        }
        if (!EXCHANGE) {
            console.error("[ Consumer ML ] EXCHANGE_NAME não configurada.");
            started = false;
            return;
        }

        const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

        for (const key of BINDING_KEYS) {
            await channel.bindQueue(q.queue, EXCHANGE, key);
        }

        channel.prefetch(1);

        console.log(` [*] Consumer MercadoLivre aguardando eventos em ${QUEUE_NAME}...`);

        channel.consume(q.queue, async (msg) => {
            if (!msg) return;
            try {
                const conteudo = JSON.parse(msg.content.toString());
                const tenantId = conteudo?.metadata?.tenant_id;
                const data = conteudo?.data || {};

                if (!tenantId) {
                    console.warn("[ Consumer ML ] Mensagem sem tenant_id, ignorando.");
                    channel.ack(msg);
                    return;
                }

                const cnpj = String(tenantId).replace(/\D/g, '');
                const codigoProduto = Number(data?.produto || data?.codigo || data?.codigo_produto);

                if (!codigoProduto) {
                    console.warn("[ Consumer ML ] Mensagem sem código de produto, ignorando.");
                    channel.ack(msg);
                    return;
                }

                const result = await service.syncProductByCode(cnpj, codigoProduto);

                if (result.failed > 0) {
                    console.warn("[ Consumer ML ] Sincronização parcial/falha:", JSON.stringify(result, null, 2));
                } else {
                    console.log("[ Consumer ML ] Sincronizado:", JSON.stringify(result));
                }

                channel.ack(msg);
            } catch (e) {
                console.error("[ Consumer ML ] Erro ao processar mensagem:", e);
                channel.nack(msg, false, false);
            }
        }, { noAck: false });

    } catch (e) {
        console.error("[ Consumer ML ] Erro ao iniciar:", e);
        started = false;
        setTimeout(() => void startMlConsumer(), 5000);
    }
}

const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/ml-consumer.ts');
if (isDirectRun) {
    void startMlConsumer();
}
