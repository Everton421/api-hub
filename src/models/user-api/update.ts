import { type ResultSetHeader } from "mysql2";
import { conn, db_api } from "../../database/databaseConfig.ts";

export class UpdateUserApi {
    async updateRecoveryCode(email: string, recoveryCode: number, expirationDate: string): Promise<ResultSetHeader> {
        const sql = `UPDATE ${db_api}.usuarios
                     SET cod_recuperador = ?, data_expiracao = ?
                     WHERE email = ?`;

        const [result] = await conn.query(sql, [recoveryCode, expirationDate, email]);
        return result as ResultSetHeader;
    }

    async updatePassword(email: string, password: string): Promise<ResultSetHeader> {
        const sql = `UPDATE ${db_api}.usuarios
                     SET senha = ?
                     WHERE email = ?`;

        const [result] = await conn.query(sql, [password, email]);
        return result as ResultSetHeader;
    }
}
