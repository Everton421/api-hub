import { conn, db_api } from "../../database/databaseConfig";

import { IUsersMlIntegrations } from "../../types/users_ml_integrations/type-users-ml-integrations";

export class UpdateUsersMLIntegrations {


    async update(user: IUsersMlIntegrations) {

        return new Promise(async (resolve, reject) => {

            const sql = ` UPDATE  ${db_api}.users_ml_integrations SET  
                                    cnpj = '${user.cnpj}',
                                    integration_name = '${user.integration_name}' 
                                   WHERE system_user_code = ${user.system_user_code}
                                   AND ml_user_id = ${user.ml_user_id}
                            `;

            await conn.query(sql, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log(`token atualizado com sucesso `)
                    resolve(result);
                }
            })
        })
    }

}
