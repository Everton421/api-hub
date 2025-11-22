import { conn } from "../../database/databaseConfig"
import { InsertUserMl } from "../../types/ml-account/ml-account";


export class InsertaMLAccountClient{


    async cadastrar( empresa:string, user:InsertUserMl ){
        return new Promise( async (resolve, reject )=>{
            
            let sql = `
                    INSERT INTO ${empresa}.ml_accounts (   user_id,  ml_user_id, access_token, refresh_token , token_expires_in ) VALUES
                                                      ( ? , ? , ? , ? , ?); `;
            const values = [ user.user_id , user.ml_user_id, user.access_token, user.refresh_token, user.token_expires_in]

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