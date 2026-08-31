import { conn } from "../../../../../database/databaseConfig.ts";
import { type ResultSetHeader } from "mysql2/promise";
import { type NewNf } from "./types.ts";

type ResponseInsert = { sucess: boolean; message: string; insertId?: number };

export class InsertNf {

    async insert(dbName: string, nf: NewNf): Promise<ResponseInsert> {
        const sql = `
            INSERT INTO ${dbName}.nf
                SET
                    chave_acesso = ?,
                    xml = ?,
                    pedido_id_externo = ?,
                    shipment_id = ?,
                    marketplace = ?,
                    system_user_code = ?,
                    ml_user_id = ?
        `;

        const values = [
            nf.chave_acesso,
            nf.xml,
            nf.pedido_id_externo,
            nf.shipment_id,
            nf.marketplace,
            nf.system_user_code,
            nf.ml_user_id ?? null
        ];

        try {
            const [result] = await conn.query<ResultSetHeader>(sql, values);
            return { sucess: true, message: "NF registrada com sucesso!", insertId: result.insertId };
        } catch (err) {
            return { sucess: false, message: `Erro ao registrar NF: ${err}` };
        }
    }
}
