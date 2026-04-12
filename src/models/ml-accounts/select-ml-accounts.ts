import { conn, db_api } from "../../database/databaseConfig.ts";
import { type IMl_account } from "../../types/ml-account/type-ml-account.ts";


type resultuserIntegration = {
     ml_user_id: number,
      integration_name: string ,
      created_at:string
}
export class SelectMLAccountClient {


    async fincByIdMLandCodeSystem(empresa: string, user_id: number, ml_user_id: number): Promise<IMl_account[]> {

            let sql = ` SELECT *
             FROM ${empresa}.ml_accounts 
               WHERE user_id = ? and
                ml_user_id = ?
               `
            let param = [user_id, ml_user_id]

            const [result] = await conn.query(sql, param )
            return result as IMl_account[];
    }

    async findByUserIdAndIntegration(empresa: string, user_id: number,): Promise<resultuserIntegration[]> {
            const sql = `
                    SELECT 
                        i.ml_user_id,
                        i.integration_name,
                        i.created_at
                    FROM ${empresa}.ml_accounts ma
                      join ${db_api}.users_ml_integrations i 
                    on  ma.user_id = i.system_user_code 
                    and i.ml_user_id = ma.ml_user_id  
                    where ma.user_id = ? 
                `
            const [ result ] = await conn.query(sql, [user_id]);
            return result as resultuserIntegration[]  ;

    }
}
