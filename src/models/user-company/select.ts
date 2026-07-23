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
        if(query.email){
           conditions.push(' email LIKE ? ') 
            values.push(`%${query.email}%`);
        }

        if(query.nome){
           conditions.push(' nome LIKE ? ') 
            values.push(`%${query.nome}%`);
        } 
        if(query.ativo){
         conditions.push('   ativo LIKE ? ') 
            values.push(`%${query.ativo}%`);
        }
        if(query.search){
           conditions.push('   codigo LIKE ?  OR nome like ? or  email like ? ') 
            values.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
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
