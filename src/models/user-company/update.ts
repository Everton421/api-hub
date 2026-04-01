import { ResultSetHeader } from "mysql2";
import { conn } from "../../database/databaseConfig.ts";

export class UpdateUserCompany {
    async updatePassword(company: string, email: string, password: string): Promise<ResultSetHeader> {
        const sql = `UPDATE ${company}.usuarios
                     SET senha = ?
                     WHERE email = ?`;

        const [result] = await conn.query(sql, [password, email]);
        return result as ResultSetHeader;
    }
}
