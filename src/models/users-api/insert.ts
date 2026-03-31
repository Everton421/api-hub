import { type ResultSetHeader } from "mysql2";
import { conn, db_api } from "../../database/databaseConfig.ts";
import { type newUser   } from "./interface.ts";

export class InsertUsersApi {


    async insertUser(usuario: newUser) {

            let sql = `
                        INSERT INTO ${db_api}.usuarios
                        (
                            nome, email, cnpj, senha, responsavel, telefone
                        ) values( ?, ?, ?, ? , ?, ? )
                    `;

            const values = [usuario.nome, usuario.email, usuario.cnpj, usuario.senha, usuario.responsavel, usuario.telefone]
            const [ result ] = await conn.query(sql, values);
        return result as ResultSetHeader;
    }

 



}