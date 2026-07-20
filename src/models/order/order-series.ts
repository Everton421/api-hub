import {type ResultSetHeader } from "mysql2";
import { conn } from "../../database/databaseConfig.ts";

export type OrderSeriesRow = {
    pedido: number;
    produto: number;
    lote_serie: number;
    quantidade: number;
};

export type OrderSeriesWithDetails = OrderSeriesRow & {
    serie?: string;
    lote?: string;
};

export class OrderSeries {
    async insertSeries(dbName: string, pedido: number, itens: { produto: number; lote_serie: number; quantidade: number }[]): Promise<void> {
        for (const item of itens) {
            const sql = `INSERT INTO ${dbName}.pedido_series (pedido, produto, lote_serie, quantidade)
                VALUES (?, ?, ?, ?)`;
            await conn.query(sql, [pedido, item.produto, item.lote_serie, item.quantidade]);
        }
    }

    async findByOrder(dbName: string, pedido: number): Promise<OrderSeriesWithDetails[]> {
        const sql = `SELECT ps.*, ls.serie, ls.lote
        FROM ${dbName}.pedido_series ps
        JOIN ${dbName}.lotes_series ls ON ls.codigo = ps.lote_serie
        WHERE ps.pedido = ?`;

        const [result] = await conn.query(sql, [pedido]);
        return result as OrderSeriesWithDetails[];
    }

    async findByOrderAndProduct(dbName: string, pedido: number, produto: number): Promise<OrderSeriesWithDetails[]> {
        const sql = `SELECT ps.*, ls.serie, ls.lote
        FROM ${dbName}.pedido_series ps
        JOIN ${dbName}.lotes_series ls ON ls.codigo = ps.lote_serie
        WHERE ps.pedido = ? AND ps.produto = ?`;

        const [result] = await conn.query(sql, [pedido, produto]);
        return result as OrderSeriesWithDetails[];
    }

    async deleteByOrder(dbName: string, pedido: number)  {
        const sql = `DELETE FROM ${dbName}.pedido_series WHERE pedido = ?`;
       const data =  await conn.query(sql, [pedido]) as ResultSetHeader[] ;
        return data;
    }

    async deleteByOrderAndProduct(dbName: string, pedido: number, produto: number): Promise<void> {
        const sql = `DELETE FROM ${dbName}.pedido_series WHERE pedido = ? AND produto = ?`;
        await conn.query(sql, [pedido, produto]);
    }
}
