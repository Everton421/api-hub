import { conn, db_api } from "../../database/databaseConfig.ts";
import {   type UsuarioApi } from "./interface.ts";

export class SelectUsersApi {

    async findByName(nome: string): Promise<UsuarioApi[]> {
        let sql = `
                select * from ${db_api}.usuarios where nome = ?
            `;
        const [result] = await conn.query(sql, [nome]);
        return result as UsuarioApi[];
    }

    async findByEmail(email: string): Promise<UsuarioApi[]> {
        let sql = `
                select * from ${db_api}.usuarios where email = ?
            `;
        const [result] = await conn.query(sql, [email]);
        return result as UsuarioApi[];
    }

    async findByEmailAndCodeValidator(email: string, codigoRecuperador: any): Promise<UsuarioApi[]> {
        let sql = `
                select * from ${db_api}.usuarios where email = ? and cod_recuperador = ? 
            `;
        const [result] = await conn.query(sql, [email, codigoRecuperador]);
        return result as UsuarioApi[];
    }

    async findByEmalAndPassword(email: string, senha: any): Promise<UsuarioApi[]> {
        let sql = `
                select * from ${db_api}.usuarios where email = ? and senha = ? 
            `;
        const [result] = await conn.query(sql, [email, senha]);
        return result as UsuarioApi[];
    }

}
