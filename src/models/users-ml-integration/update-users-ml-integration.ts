import { type ResultSetHeader } from "mysql2";
import { conn, db_api } from "../../database/databaseConfig.ts";
import { type IUsersMlIntegrations } from "../../types/users_ml_integrations/type-users-ml-integrations.ts";

export class UpdateUsersMLIntegrations {


    async update(user: Omit<IUsersMlIntegrations, 'id' >) {

            const sql = ` UPDATE  ${db_api}.users_ml_integrations SET  
                                    cnpj = '${user.cnpj}',
                                    integration_name = '${user.integration_name}' 
                                   WHERE system_user_code = ${user.system_user_code}
                                   AND ml_user_id = ${user.ml_user_id}
                            `;

            const [ result ] = await conn.query(sql)
            return result as ResultSetHeader;
        }

}
