import { conn, db_api } from "../../database/databaseConfig.ts";

type WebhookUpdate = {
    url?: string;
    eventos?: string;
    ativo?: string;
};

export class UpdateWebhook {

    async update(codigo: number, data: WebhookUpdate): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.url !== undefined) {
            fields.push('url = ?');
            values.push(data.url);
        }
        if (data.eventos !== undefined) {
            fields.push('eventos = ?');
            values.push(data.eventos);
        }
        if (data.ativo !== undefined) {
            fields.push('ativo = ?');
            values.push(data.ativo);
        }

        if (fields.length === 0) {
            return { affectedRows: 0 };
        }

        values.push(codigo);
        const sql = `UPDATE ${db_api}.webhooks SET ${fields.join(', ')} WHERE codigo = ?`;
        const [result] = await conn.query(sql, values);
        return result as { affectedRows: number };
    }

    async updateStatus(codigo: number, status: number | null, erro: string | null): Promise<void> {
        const sql = `UPDATE ${db_api}.webhooks SET ultimo_status = ?, ultimo_erro = ? WHERE codigo = ?`;
        await conn.query(sql, [status, erro, codigo]);
    }

}
