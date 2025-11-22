import { conn } from "../../database/databaseConfig";
import { IMl_account } from "../../types/ml-account/ml-account";

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


}
