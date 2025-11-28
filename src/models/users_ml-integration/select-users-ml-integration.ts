import { conn, db_api } from "../../database/databaseConfig";
import { IMl_account } from "../../types/ml-account/ml-account";
import { IUsersMlIntegrations } from "../../types/users_ml_integrations/users_ml_integrations";

export class SelectUsersMlIntegrations{


    async fincByIdMLandCodeSystem(  user_id:number, ml_user_id:number  ): Promise<IUsersMlIntegrations[]>{

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *
             FROM ${db_api}.users_ml_integrations 
               WHERE   system_user_code  = ? and
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

 async findBySystemUserCodeAndCnpj(user_id:number,ml_user_id:number, cnpj:string): Promise<IUsersMlIntegrations[]>{
        return new Promise( async (resolve, reject)=>{
             let sql = ` SELECT *
             FROM ${db_api}.users_ml_integrations 
               WHERE   system_user_code  = ? and  cnpj = ?  and ml_user_id
               `
               let param= [ user_id, cnpj , ml_user_id ]

    await conn.query( sql, param ,(err:any, result :any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
 }
}
