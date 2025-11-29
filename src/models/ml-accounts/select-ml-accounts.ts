import { conn, db_api } from "../../database/databaseConfig";
import { IMl_account } from "../../types/ml-account/type-ml-account";

export class SelectMLAccountClient{


    async fincByIdMLandCodeSystem(empresa:string, user_id:number, ml_user_id:number  ): Promise<IMl_account[]>{

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *
             FROM ${empresa}.ml_accounts 
               WHERE user_id = ? and
                ml_user_id = ?
               `
               let param= [ user_id, ml_user_id ]
 
            await conn.query( sql, param ,(err:any, result :any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }

    async findByUserIdAndIntegration(empresa:string, user_id:number,):Promise<[ { ml_user_id:number, integration_name:string}]>{
        return new Promise( async (resolve, reject)=>{
                const sql = `
                    SELECT 
                        i.ml_user_id,
                        i.integration_name
                    FROM ${empresa}.ml_accounts ma
                      join ${db_api}.users_ml_integrations i 
                    on  ma.user_id = i.system_user_code 
                    and i.ml_user_id = ma.ml_user_id  
                    where ma.user_id = ? 
                `
   await conn.query( sql,  [ user_id ], (err:any, result :any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }
}
