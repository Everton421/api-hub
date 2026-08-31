import { SelectUsersMlIntegrations } from "../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { type MarketplaceInvoicePublisher } from "./invoice-publisher.ts";
import { InsertNf } from "./models/insert.ts";
import { SelectNf } from "./models/select.ts";
import { UpdateNf } from "./models/update.ts";
import { type NewNf, type NfType } from "./models/types.ts";
import { type InvoicePayload, type InvoiceSendResult } from "./types/invoice-types.ts";

export type InvoiceReceiveBody = {
    pedidoIdExterno: string;
    shipmentId: string;
    chaveAcesso: string;
    xmlBase64: string;
    marketplace: string;
};

export type InvoiceRegisterResult = {
    success: boolean;
    message: string;
    codigo?: number;
};

export class InvoiceService {
    private readonly insertNf: InsertNf;
    private readonly selectNf: SelectNf;
    private readonly updateNf: UpdateNf;
    private readonly selectUsersMlIntegrations: SelectUsersMlIntegrations;
    private readonly publishers: Map<string, MarketplaceInvoicePublisher>;

    constructor(
        publishers: Map<string, MarketplaceInvoicePublisher>,
        insertNf: InsertNf = new InsertNf(),
        selectNf: SelectNf = new SelectNf(),
        updateNf: UpdateNf = new UpdateNf(),
        selectUsersMlIntegrations: SelectUsersMlIntegrations = new SelectUsersMlIntegrations()
    ) {
        this.publishers = publishers;
        this.insertNf = insertNf;
        this.selectNf = selectNf;
        this.updateNf = updateNf;
        this.selectUsersMlIntegrations = selectUsersMlIntegrations;
    }

    async registerAndSend(cnpj: string, systemUserCode: number, body: InvoiceReceiveBody): Promise<InvoiceRegisterResult> {
        const dbName = `\`${cnpj}\``;
        const marketplace = body.marketplace || 'ML';

        const publisher = this.publishers.get(marketplace);
        if (!publisher) {
            return { success: false, message: `Marketplace '${marketplace}' não possui publisher de NF configurado.` };
        }

        const existentes = await this.selectNf.findByChave(dbName, body.chaveAcesso, marketplace);
        if (existentes.length > 0) {
            return { success: false, message: "NF já registrada para este marketplace." };
        }

        const mlUserId = await this.resolveMlUserId(cnpj, systemUserCode, marketplace);
        if (mlUserId === null) {
            return { success: false, message: "Não foi possível identificar uma conta vinculada para este usuário e marketplace." };
        }

        const newNf: NewNf = {
            chave_acesso: body.chaveAcesso,
            xml: body.xmlBase64,
            pedido_id_externo: body.pedidoIdExterno,
            shipment_id: body.shipmentId,
            marketplace,
            system_user_code: systemUserCode,
            ml_user_id: mlUserId
        };

        const resultInsert = await this.insertNf.insert(dbName, newNf);
        if (!resultInsert.sucess || !resultInsert.insertId) {
            return { success: false, message: resultInsert.message };
        }

        const payload: InvoicePayload = {
            chaveAcesso: body.chaveAcesso,
            xmlBase64: body.xmlBase64,
            pedidoIdExterno: body.pedidoIdExterno,
            shipmentId: body.shipmentId
        };

        const sendResult = await publisher.sendInvoice({
            cnpj,
            systemUserCode,
            mlUserId,
            payload
        });

        if (sendResult.success) {
            await this.updateNf.update(dbName, {
                status_envio: 'ENVIADO',
                data_envio: new Date().toISOString().slice(0, 19).replace('T', ' '),
                erro: null
            }, resultInsert.insertId);

            return { success: true, message: sendResult.msg, codigo: resultInsert.insertId };
        }

        await this.updateNf.update(dbName, {
            status_envio: 'ERRO',
            tentativas: 1,
            erro: sendResult.msg
        }, resultInsert.insertId);

        return { success: false, message: sendResult.msg, codigo: resultInsert.insertId };
    }

    async reprocessByCodigo(cnpj: string, systemUserCode: number, codigo: number): Promise<InvoiceRegisterResult> {
        const dbName = `\`${cnpj}\``;

        const nfs = await this.selectNf.findByCodigo(dbName, codigo);
        if (nfs.length === 0) {
            return { success: false, message: "NF não encontrada." };
        }

        const nf = nfs[0];
        const marketplace = nf.marketplace;

        const publisher = this.publishers.get(marketplace);
        if (!publisher) {
            return { success: false, message: `Marketplace '${marketplace}' não possui publisher de NF configurado.` };
        }

        const mlUserId = nf.ml_user_id ?? await this.resolveMlUserId(cnpj, systemUserCode, marketplace);
        if (mlUserId === null) {
            return { success: false, message: "Não foi possível identificar uma conta vinculada." };
        }

        const payload: InvoicePayload = {
            chaveAcesso: nf.chave_acesso,
            xmlBase64: nf.xml,
            pedidoIdExterno: nf.pedido_id_externo,
            shipmentId: nf.shipment_id
        };

        const tentativas = (nf.tentativas || 0) + 1;
        const sendResult = await publisher.sendInvoice({ cnpj, systemUserCode, mlUserId, payload });

        if (sendResult.success) {
            await this.updateNf.update(dbName, {
                status_envio: 'ENVIADO',
                tentativas,
                erro: null,
                data_envio: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }, nf.codigo);

            return { success: true, message: sendResult.msg, codigo: nf.codigo };
        }

        await this.updateNf.update(dbName, {
            status_envio: 'ERRO',
            tentativas,
            erro: sendResult.msg
        }, nf.codigo);

        return { success: false, message: sendResult.msg, codigo: nf.codigo };
    }

    async listByErro(cnpj: string, limit = 100): Promise<NfType[]> {
        const dbName = `\`${cnpj}\``;
        return this.selectNf.findByErro(dbName, limit);
    }

    private async resolveMlUserId(cnpj: string, systemUserCode: number, marketplace: string): Promise<number | null> {
        if (marketplace !== 'ML') {
            return null;
        }

        const integracoes = await this.selectUsersMlIntegrations.findBySystemUserCodeAndCnpjList(systemUserCode, cnpj);

        if (integracoes.length === 1) {
            return Number(integracoes[0].ml_user_id);
        }

        if (integracoes.length > 1) {
            console.warn(`Múltiplas contas ML para system_user_code ${systemUserCode} cnpj ${cnpj}.`);
            return null;
        }

        return null;
    }
}
