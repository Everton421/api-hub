import { conn } from "../../database/databaseConfig.ts";
import { type SectorType } from "./types/sector-type.ts";

export class UpdateSector {
    async update(dbName: string, data: SectorType): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.setores
                     SET id = ?, data_cadastro = ?, data_recadastro = ?, descricao = ?
                     WHERE codigo = ?`;

        const values = [data.id, data.data_cadastro, data.data_recadastro, data.descricao, data.codigo];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}
