import {type ResultSetHeader } from "mysql2";
import { conn, db_api } from "../../database/databaseConfig.ts";
import { type IUsersMlIntegrations } from "../../types/users_ml_integrations/type-users-ml-integrations.ts";

 

export class InsertUsersMlintegration {

    async cadastrar(user: IUsersMlIntegrations) {

            let sql = `
                    INSERT INTO ${db_api}.users_ml_integrations (     ml_user_id, system_user_code, cnpj , created_at, integration_name ) VALUES
                                                      (  ? , ? , ? , ?, ?); `;
            const values = [user.ml_user_id, user.system_user_code, user.cnpj, user.created_at, user.integration_name]

           const [result] =  await conn.query(sql, values )  
           return result as ResultSetHeader;
    }
}