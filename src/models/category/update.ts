import { conn } from "../../database/databaseConfig.ts";
import { type CategoryType } from "./types/category-type.ts";

export class UpdateCategory {
    async update(dbName: string, data: CategoryType): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.categorias SET
            id = ?,
            data_cadastro = ?,
            data_recadastro = ?,
            descricao = ?,
            ativo = ?
        WHERE codigo = ?`;

        const values = [
            data.id,
            data.data_cadastro,
            data.data_recadastro,
            data.descricao,
            data.ativo,
            data.codigo
        ];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}
