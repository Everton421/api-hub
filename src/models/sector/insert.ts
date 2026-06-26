import { conn } from "../../database/databaseConfig.ts";
import { type SectorType } from "./types/sector-type.ts";

export class InsertSector {
    async insert(dbName: string, data: SectorType): Promise<{ insertId: number }> {
         
        const columns =['id', 'data_cadastro', 'data_recadastro', 'descricao']

        const values: (string | number)[] = [data.id, data.data_cadastro, data.data_recadastro, data.descricao];
        
           if (data.codigo != null) {
            columns.unshift('codigo');
            values.unshift(data.codigo);
        }

                      const placeholders = values.map(() => '?').join(', ');
     const sql = `INSERT INTO ${dbName}.setores  (${columns.join(', ')}) values (${placeholders})` ;

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
