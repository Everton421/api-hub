import { conn } from "../../database/databaseConfig.ts";

export class DeleteAnuncios {

    async delete(empresa: string, id: number): Promise<{ affectedRows: number }> {
        const sql = `DELETE FROM ${empresa}.anuncios WHERE id = ?`;
        const [result] = await conn.query(sql, [id]);
        return { affectedRows: (result as any).affectedRows };
    }
}