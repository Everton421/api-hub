import { conn } from "../../database/databaseConfig.ts";

export class DeleteCategory {
    async delete(dbName: string, codigo: number): Promise<{ affectedRows: number }> {
        const sql = `DELETE FROM ${dbName}.categorias WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return { affectedRows: (result as any).affectedRows };
    }
}
