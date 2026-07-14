import { conn } from "../../database/databaseConfig.ts";

export class InsertItemsRequirements {
    async insertProductItem(
        dbName: string,
        data: { requerimento: number; produto: number; quantidade: number; custo: number | null }
    ) {
        const sql = `INSERT INTO ${dbName}.produtos_requerimento (requerimento, produto, quantidade, custo) VALUES (?, ?, ?, ?)`;
        const values = [data.requerimento, data.produto, data.quantidade, data.custo];
        const [result] = await conn.query(sql, values);
        return result;
    }

    async insertLoteSerieItem(
        dbName: string,
        data: { requerimento: number; produto: number; lote_serie: number; quantidade: number }
    ) {
        const sql = `INSERT INTO ${dbName}.lotes_series_requerimento (requerimento, produto, lote_serie, quantidade) VALUES (?, ?, ?, ?)`;
        const values = [data.requerimento, data.produto, data.lote_serie, data.quantidade];
        const [result] = await conn.query(sql, values);
        return result;
    }
}

export class DeleteItemsRequirements {
    async deleteProductItems(dbName: string, requerimento: number) {
        const sql = `DELETE FROM ${dbName}.produtos_requerimento WHERE requerimento = ?`;
        const [result] = await conn.query(sql, [requerimento]);
        return result;
    }

    async deleteLoteSerieItems(dbName: string, requerimento: number) {
        const sql = `DELETE FROM ${dbName}.lotes_series_requerimento WHERE requerimento = ?`;
        const [result] = await conn.query(sql, [requerimento]);
        return result;
    }
}
