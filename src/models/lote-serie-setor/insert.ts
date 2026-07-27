import { conn } from "../../database/databaseConfig.ts";
import { type LoteSerieSetorInput } from "./types/lote-serie-setor-type.ts";

export class InsertLoteSerieSetor {
    async insertOrUpdate(dbName: string, data: LoteSerieSetorInput): Promise<{ affectedRows: number }> {
        const sql = `INSERT INTO ${dbName}.lote_serie_setor (setor, produto, lote_serie, estoque)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                estoque = VALUES(estoque),
                produto = VALUES(produto)`;

        const values = [data.setor, data.produto, data.lote_serie, data.estoque];
        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }

    async incrementStock(dbName: string, setor: number, lote_serie: number, quantidade: number): Promise<void> {
        const sql = `UPDATE ${dbName}.lote_serie_setor 
                     SET estoque = estoque + ?
                     WHERE setor = ? AND lote_serie = ?`;
        await conn.query(sql, [quantidade, setor, lote_serie]);
    }

    async decrementStock(dbName: string, setor: number, lote_serie: number, quantidade: number): Promise<void> {
        const sql = `UPDATE ${dbName}.lote_serie_setor 
                     SET estoque = estoque - ?
                     WHERE setor = ? AND lote_serie = ?`;
        await conn.query(sql, [quantidade, setor, lote_serie]);
    }
}
