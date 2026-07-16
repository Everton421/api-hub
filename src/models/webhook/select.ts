import { conn, db_api } from "../../database/databaseConfig.ts";
import { type WebhookType } from "./types/webhook-type.ts";

export class SelectWebhook {

    async findByCnpj(cnpj: string): Promise<WebhookType[]> {
        const sql = `SELECT * FROM ${db_api}.webhooks WHERE cnpj = ?`;
        const [result] = await conn.query(sql, [cnpj]);
        return result as WebhookType[];
    }

    async findByCodigo(codigo: number): Promise<WebhookType[]> {
        const sql = `SELECT * FROM ${db_api}.webhooks WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as WebhookType[];
    }

    async findActiveByEvent(cnpj: string, evento: string): Promise<WebhookType[]> {
        const sql = `SELECT * FROM ${db_api}.webhooks WHERE cnpj = ? AND ativo = 'S' AND FIND_IN_SET(?, eventos)`;
        const [result] = await conn.query(sql, [cnpj, evento]);
        return result as WebhookType[];
    }

}
