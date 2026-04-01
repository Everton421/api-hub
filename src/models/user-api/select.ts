import { conn, db_api } from "../../database/databaseConfig.ts";
import { type UserApi } from "./types/user-api-type.ts";

export class SelectUserApi {
    async findByName(name: string): Promise<UserApi[]> {
        const sql = `SELECT * FROM ${db_api}.usuarios WHERE nome = ?`;
        const [result] = await conn.query(sql, [name]);
        return result as UserApi[];
    }

    async findByEmail(email: string): Promise<UserApi[]> {
        const sql = `SELECT * FROM ${db_api}.usuarios WHERE email = ?`;
        const [result] = await conn.query(sql, [email]);
        return result as UserApi[];
    }

    async findByEmailAndRecoveryCode(email: string, recoveryCode: number): Promise<UserApi[]> {
        const sql = `SELECT * FROM ${db_api}.usuarios WHERE email = ? AND cod_recuperador = ?`;
        const [result] = await conn.query(sql, [email, recoveryCode]);
        return result as UserApi[];
    }

    async findByEmailAndPassword(email: string, password: string): Promise<UserApi[]> {
        const sql = `SELECT * FROM ${db_api}.usuarios WHERE email = ? AND senha = ?`;
        const [result] = await conn.query(sql, [email, password]);
        return result as UserApi[];
    }
}
