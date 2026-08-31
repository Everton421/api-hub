import { conn, db_api } from "../../database/databaseConfig.ts";
import { type IUsersMlIntegrations } from "../../types/users_ml_integrations/type-users-ml-integrations.ts";

export class SelectUsersMlIntegrations {


    async findByCodigo(codigo: number): Promise<IUsersMlIntegrations[]> {
        const sql = `SELECT *    FROM ${db_api}.users_ml_integrations WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as IUsersMlIntegrations[];
    }

    async findByIntegrationInternalId(integrationId: number): Promise<IUsersMlIntegrations[]> {
        const sql = `SELECT *    FROM ${db_api}.users_ml_integrations WHERE id = ?`;
        const [result] = await conn.query(sql, [integrationId]);
        return result as IUsersMlIntegrations[];
    }

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

    async findByMlUserId(ml_user_id: number): Promise<IUsersMlIntegrations[]> {
        const sql = `SELECT * FROM ${db_api}.users_ml_integrations WHERE ml_user_id = ?`;
        const [result] = await conn.query(sql, [ml_user_id]);
        return result as IUsersMlIntegrations[];
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

    async findBySystemUserCodeAndCnpjList(user_id: number, cnpj: string): Promise<IUsersMlIntegrations[]> {
            let sql = ` SELECT *
             FROM ${db_api}.users_ml_integrations 
               WHERE system_user_code = ? AND cnpj = ?
               `
            let param = [user_id, cnpj]

            const [result] = await conn.query(sql, param);
            return result as IUsersMlIntegrations[]
        }
}
