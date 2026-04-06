import { conn, db_api } from "../../database/databaseConfig.ts";
import { type IUsersMlIntegrations } from "../../types/users_ml_integrations/type-users-ml-integrations.ts";

export class SelectUsersMlIntegrations {


    async fincByIdMLandCodeSystem(user_id: number, ml_user_id: number): Promise<IUsersMlIntegrations[]> {


            let sql = ` SELECT *
             FROM ${db_api}.users_ml_integrations 
               WHERE   system_user_code  = ? and
                ml_user_id = ?
               `
            let param = [user_id, ml_user_id]

           const [ result] =  await conn.query(sql, param )
           return result as IUsersMlIntegrations[]
    }

    async findBySystemUserCodeAndCnpj(user_id: number, ml_user_id: number, cnpj: string): Promise<IUsersMlIntegrations[]> {
            let sql = ` SELECT *
             FROM ${db_api}.users_ml_integrations 
               WHERE   system_user_code  = ? and  cnpj = ?  and ml_user_id
               `
            let param = [user_id, cnpj, ml_user_id]

            const [result] = await conn.query(sql, param );
           return result as IUsersMlIntegrations[]

        }
}
