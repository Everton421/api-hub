import { conn } from "../../database/databaseConfig.ts";
import { type LotesSeriesInput } from "./types/lotes-series-type.ts";

export class InsertLotesSeries {
    async insert(dbName: string, data: LotesSeriesInput): Promise<{ insertId: number }> {
        const columns = ['produto', 'lote', 'serie', 'data_cadastro', 'data_recadastro'];
        const values = [data.produto, data.lote ?? null, data.serie ?? null, data.data_cadastro, data.data_recadastro];

        if (data.codigo != null) {
            columns.unshift('codigo');
            values.unshift(data.codigo);
        }

        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${dbName}.lotes_series (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
