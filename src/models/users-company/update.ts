import { type ResultSetHeader } from "mysql2";
import { conn } from "../../database/databaseConfig.ts";

export class UpdatUsersCompany {

    async updateSenha(empresa: any, senha: any, email: string) {
 
            let sql = `
                  update ${empresa}.usuarios
                    set senha= ? 
                  where email = ?   
            `;
            const values = [ senha ,email ]

             const [ result ] = await conn.query(sql);
                return result as ResultSetHeader;
    }
}
