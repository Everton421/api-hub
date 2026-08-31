import { conn } from "../../../../../database/databaseConfig.ts";
import { type ResultSetHeader } from "mysql2/promise";
import { type UpdateNfData } from "./types.ts";

export class UpdateNf {

    async update(dbName: string, data: UpdateNfData, codigo: number): Promise<boolean> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.status_envio !== undefined) {
            fields.push("status_envio = ?");
            values.push(data.status_envio);
        }
        if (data.tentativas !== undefined) {
            fields.push("tentativas = ?");
            values.push(data.tentativas);
        }
        if (data.erro !== undefined) {
            fields.push("erro = ?");
            values.push(data.erro);
        }
        if (data.data_envio !== undefined) {
            fields.push("data_envio = ?");
            values.push(data.data_envio);
        }
        if (data.ml_user_id !== undefined) {
            fields.push("ml_user_id = ?");
            values.push(data.ml_user_id);
        }

        if (fields.length === 0) {
            throw new Error("Nenhum campo para atualizar");
        }

        values.push(codigo);

        const sql = `UPDATE ${dbName}.nf SET ${fields.join(', ')} WHERE codigo = ?`;

        const [result] = await conn.query<ResultSetHeader>(sql, values);
        return result.affectedRows > 0;
    }
}
