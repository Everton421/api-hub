import { conn, db_api } from "../../database/databaseConfig.ts";

type WebhookInsert = {
    cnpj: string;
    url: string;
    eventos: string;
    secret: string;
};

export class InsertWebhook {

    async create(data: WebhookInsert): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${db_api}.webhooks (cnpj, url, eventos, secret) VALUES (?, ?, ?, ?)`;
        const [result] = await conn.query(sql, [data.cnpj, data.url, data.eventos, data.secret]);
        return result as { insertId: number };
    }

}
