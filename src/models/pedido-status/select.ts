import { conn } from "../../database/databaseConfig.ts";
import { type PedidoStatusType, type CategoriaStatus } from "./types.ts";

export class SelectPedidoStatus {
    async findByPedido(dbName: string, pedido: number): Promise<PedidoStatusType[]> {
        const sql = `SELECT * FROM ${dbName}.pedido_status WHERE pedido = ? ORDER BY categoria`;
        const [result] = await conn.query(sql, [pedido]);
        return result as PedidoStatusType[];
    }

    async findDistinctStatus(dbName: string, marketplace?: string, categoria?: CategoriaStatus): Promise<{ status_origem: string }[]> {
        const conditions: string[] = [];
        const values: any[] = [];

        if (marketplace) {
            conditions.push("marketplace = ?");
            values.push(marketplace);
        }
        if (categoria) {
            conditions.push("categoria = ?");
            values.push(categoria);
        }

        let sql = `SELECT DISTINCT status_origem FROM ${dbName}.pedido_status`;
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY status_origem';

        const [result] = await conn.query(sql, values);
        return result as { status_origem: string }[];
    }
}
