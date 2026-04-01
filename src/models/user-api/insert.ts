import { ResultSetHeader } from "mysql2";
import { conn, db_api } from "../../database/databaseConfig.ts";
import { type NewUserApi } from "./types/user-api-type.ts";

export class InsertUserApi {
    async insert(user: NewUserApi): Promise<ResultSetHeader> {
        const sql = `INSERT INTO ${db_api}.usuarios
                     (nome, email, cnpj, senha, responsavel, telefone)
                     VALUES (?, ?, ?, ?, ?, ?)`;

        const values = [user.nome, user.email, user.cnpj, user.senha, user.responsavel, user.telefone];
        const [result] = await conn.query(sql, values);
        return result as ResultSetHeader;
    }
}
