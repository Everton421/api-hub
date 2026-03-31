import { type ResultSetHeader } from "mysql2";
import { conn, db_api } from "../../database/databaseConfig.ts";

export class UpdateUsersApi {

 
    async updateCodeValidator(codigo: number, data: any, email: any) {

            let sql = `
                  update ${db_api}.usuarios
                    set cod_recuperador= '${codigo}',
                        data_expiracao='${data}'
                  where email = '${email}'   
            `;

            const [ result ] = await conn.query(sql);
                return result as ResultSetHeader;
        }   

    async updatePassword(senha: any, email: any) {

            let sql = `
                  update ${db_api}.usuarios
                    set senha = '${senha}' 
                  where email = '${email}'   
            `;

            const [ result ] = await conn.query(sql);
                return result as ResultSetHeader;
    }




}