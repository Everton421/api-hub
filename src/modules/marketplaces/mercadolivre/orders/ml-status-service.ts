import { InsertPedidoStatus } from "../../../../models/pedido-status/insert.ts";
import { SelectPedidoStatus } from "../../../../models/pedido-status/select.ts";
import { CreateTablePedidoStatus } from "../../../../database/tables-structures/create-table-pedido-status.ts";
import { derivarSituacao } from "../../../../services/StatusMarketplace.ts";
import { type MlOrder } from "./types/ml-order-types.ts";

export class MlStatusService {
    private readonly insertPedidoStatus: InsertPedidoStatus;
    private readonly selectPedidoStatus: SelectPedidoStatus;
    private readonly createTablePedidoStatus: CreateTablePedidoStatus;

    constructor() {
        this.insertPedidoStatus = new InsertPedidoStatus();
        this.selectPedidoStatus = new SelectPedidoStatus();
        this.createTablePedidoStatus = new CreateTablePedidoStatus();
    }

    async registrarStatus(database: string, codigoPedido: number, mlOrder: MlOrder): Promise<void> {
        const dbName = database.replace(/`/g, '');
        await this.createTablePedidoStatus.createTablePedidoStatus(dbName);
        await this.upsertPedido(database, codigoPedido, mlOrder);
        await this.upsertPagamento(database, codigoPedido, mlOrder);
        await this.upsertFrete(database, codigoPedido, mlOrder);
    }

    private async upsertPedido(database: string, codigoPedido: number, mlOrder: MlOrder): Promise<void> {
        const dataEvento = mlOrder.last_updated?.replace('T', ' ').split('.')[0] || null;
        await this.insertPedidoStatus.upsert(database, {
            pedido: codigoPedido,
            marketplace: 'ML',
            categoria: 'pedido',
            status_origem: mlOrder.status || null,
            status_detail: mlOrder.status_detail || null,
            tags: this.serializeTags(mlOrder.tags),
            situacao: derivarSituacao('ML', mlOrder.status),
            data_evento: dataEvento,
            payload_raw: this.serializePayload({ status: mlOrder.status, status_detail: mlOrder.status_detail, tags: mlOrder.tags, static_tags: mlOrder.static_tags })
        });
    }

    private async upsertPagamento(database: string, codigoPedido: number, mlOrder: MlOrder): Promise<void> {
        for (const payment of mlOrder.payments) {
            await this.insertPedidoStatus.upsert(database, {
                pedido: codigoPedido,
                marketplace: 'ML',
                categoria: 'pagamento',
                status_origem: payment.status || null,
                status_detail: null,
                tags: null,
                situacao: derivarSituacao('ML', payment.status || ''),
                data_evento: null,
                payload_raw: this.serializePayload({ id: payment.id, status: payment.status, payment_method_id: payment.payment_method_id })
            });
        }
    }

    private async upsertFrete(database: string, codigoPedido: number, mlOrder: MlOrder): Promise<void> {
        if (!mlOrder.shipping) return;
        await this.insertPedidoStatus.upsert(database, {
            pedido: codigoPedido,
            marketplace: 'ML',
            categoria: 'frete',
            status_origem: mlOrder.shipping.status || null,
            status_detail: null,
            tags: null,
            situacao: derivarSituacao('ML', mlOrder.shipping.status || ''),
            data_evento: null,
            payload_raw: this.serializePayload({ id: mlOrder.shipping.id, status: mlOrder.shipping.status, shipping_type: mlOrder.shipping.shipping_type })
        });
    }

    private serializeTags(tags?: string[]): string | null {
        if (!tags || tags.length === 0) return null;
        return JSON.stringify(tags);
    }

    private serializePayload(payload: unknown): string | null {
        try {
            return JSON.stringify(payload);
        } catch {
            return null;
        }
    }
}
