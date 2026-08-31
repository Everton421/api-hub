import { conn } from "../../database/databaseConfig.ts";
import { type PedidoStatusType } from "./types.ts";

export class InsertPedidoStatus {
    async upsert(dbName: string, data: PedidoStatusType): Promise<void> {
        const sql = `INSERT INTO ${dbName}.pedido_status (
            pedido,
            marketplace,
            categoria,
            status_origem,
            status_detail,
            tags,
            situacao,
            data_evento,
            payload_raw
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            status_origem = VALUES(status_origem),
            status_detail = VALUES(status_detail),
            tags = VALUES(tags),
            situacao = VALUES(situacao),
            data_evento = VALUES(data_evento),
            payload_raw = VALUES(payload_raw)`;

        await conn.query(sql, [
            data.pedido,
            data.marketplace,
            data.categoria,
            data.status_origem,
            data.status_detail,
            data.tags,
            data.situacao,
            data.data_evento,
            data.payload_raw
        ]);
    }
}
