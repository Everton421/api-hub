import { ResultSetHeader } from "mysql2";
import { conn } from "../../database/databaseConfig.ts";
import { type NewUserCompany } from "./types/user-company-type.ts";

export class InsertUserCompany {
    async insert(company: string, user: NewUserCompany): Promise<ResultSetHeader> {
        const sql = `INSERT INTO ${company}.usuarios
                     (nome, email, cnpj, senha, responsavel, ativo)
                     VALUES (?, ?, ?, ?, ?, ?)`;

        const values = [user.nome, user.email, user.cnpj, user.senha, user.responsavel, user.ativo];
        const [result] = await conn.query(sql, values);
        return result as ResultSetHeader;
    }
}
