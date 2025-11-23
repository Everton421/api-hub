import { conn, db_api } from "../../database/databaseConfig"
import { InsertUserMl } from "../../types/ml-account/ml-account";
import { IUsersMlIntegrations } from "../../types/users_ml_integrations/users_ml_integrations";


export class InsertUsersMlintegration{

    async cadastrar(  user:IUsersMlIntegrations ){
        return new Promise( async (resolve, reject )=>{
            
            let sql = `
                    INSERT INTO ${db_api}.users_ml_integrations (     ml_user_id, system_user_code, cnpj , created_at, integration_name ) VALUES
                                                      (  ? , ? , ? , ?, ?); `;
            const values = [  user.ml_user_id, user.system_user_code, user.cnpj, user.created_at, user.integration_name]

            await conn.query( sql , values,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })  
        })
    }
}