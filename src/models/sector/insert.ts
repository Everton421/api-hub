import { conn } from "../../database/databaseConfig.ts";
import { type SectorType } from "./types/sector-type.ts";

export class InsertSector {
    async insert(dbName: string, data: SectorType): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.setores (id, data_cadastro, data_recadastro, descricao)
                      VALUES (?, ?, ?, ?)`;

        const values = [data.id, data.data_cadastro, data.data_recadastro, data.descricao];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
