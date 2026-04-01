import { conn, db_api } from "../../database/databaseConfig.ts";
import { type UserCompany, type UserCompanyQuery } from "./types/user-company-type.ts";

export class SelectUserCompany {
    async findAll(company: string, limit: number = 100): Promise<UserCompany[]> {
        const sql = `SELECT * FROM ${company}.usuarios LIMIT ?`;
        const [result] = await conn.query(sql, [limit]);
        return result as UserCompany[];
    }

    async findByEmail(company: string, email: string): Promise<UserCompany[]> {
        const sql = `SELECT * FROM ${company}.usuarios WHERE email = ?`;
        const [result] = await conn.query(sql, [email]);
        return result as UserCompany[];
    }

    async findByCode(company: string, code: number): Promise<UserCompany[]> {
        const sql = `SELECT * FROM ${company}.usuarios WHERE codigo = ?`;
        const [result] = await conn.query(sql, [code]);
        return result as UserCompany[];
    }

    async findByEmailAndPassword(company: string, email: string, password: string): Promise<UserCompany[]> {
        const sql = `SELECT u.*, e.tipo_contrato, DATE_FORMAT(e.data_contrato, '%Y-%m-%d') AS data_contrato, e.dias_contrato
                     FROM ${company}.usuarios u
                     JOIN ${db_api}.empresas e ON u.cnpj = e.cnpj
                     WHERE u.email = ? AND u.senha = ?`;
        const [result] = await conn.query(sql, [email, password]);
        return result as UserCompany[];
    }

    async findByEmailAndName(company: string, email: string, name: string): Promise<UserCompany[]> {
        const sql = `SELECT * FROM ${company}.usuarios WHERE email = ? AND nome = ?`;
        const [result] = await conn.query(sql, [email, name]);
        return result as UserCompany[];
    }

    async findByParams(company: string, query: UserCompanyQuery): Promise<UserCompany[]> {
        let sql = `SELECT * FROM ${company}.usuarios`;
        const conditions: string[] = [];
        const values: any[] = [];

        if (query.codigo) {
            conditions.push("codigo = ?");
            values.push(query.codigo);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        const limit = query.limit ?? 100;
        sql += " LIMIT ?";
        values.push(limit);

        const [result] = await conn.query(sql, values);
        return result as UserCompany[];
    }
}
