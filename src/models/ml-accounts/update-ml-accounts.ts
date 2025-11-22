import { conn } from "../../database/databaseConfig";
import { InsertUserMl } from "../../types/ml-account/ml-account";

export class UpdateMLAccountClient{

    async update ( empresa:any,user:InsertUserMl  ){

       return new Promise( async ( resolve, reject)=>{

                const sql =` UPDATE  ${empresa}.ml_accounts SET  
                                    access_token = '${user.access_token}',
                                     refresh_token = '${user.refresh_token}',
                                     token_expires_in = '${user.token_expires_in}' 
                                   WHERE user_id = ${user.user_id}
                                   AND ml_user_id = ${user.ml_user_id}
                            `;

                            await conn.query(sql,   (err:any, result:any )=>{
                                if(err){
                                     console.log(err)
                                     reject(err);
                                }else{
                                    console.log(`token atualizado com sucesso `)
                                     resolve(result);
                                }
                            })
                        })
        }

}
 

