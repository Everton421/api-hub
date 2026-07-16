import { conn, db_api } from "../../database/databaseConfig.ts";

export class DeleteWebhook {

    async deleteByCodigo(codigo: number): Promise<{ affectedRows: number }> {
        const sql = `DELETE FROM ${db_api}.webhooks WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as { affectedRows: number };
    }

}
