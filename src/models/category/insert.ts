import { conn } from "../../database/databaseConfig.ts";
import { type CategoryType } from "./types/category-type.ts";

export class InsertCategory {
    async create(dbName: string, data: CategoryType): Promise<{ insertId: number }> {
        const columns = ['id', 'data_cadastro', 'data_recadastro', 'descricao', 'ativo'];
        const values = [data.id, data.data_cadastro, data.data_recadastro, data.descricao, data.ativo];

        if (data.codigo != null) {
            columns.unshift('codigo');
            values.unshift(data.codigo);
        }

        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${dbName}.categorias (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
