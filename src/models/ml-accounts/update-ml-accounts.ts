import { type ResultSetHeader } from "mysql2";
import { type InsertUserMl } from "../../types/ml-account/type-ml-account.ts";
import { conn } from "../../database/databaseConfig.ts";

export class UpdateMLAccountClient {

    async update(empresa: any, user: InsertUserMl) {

        return new Promise(async (resolve, reject) => {

            const sql = ` UPDATE  ${empresa}.ml_accounts SET  
                                    access_token = ?,
                                     refresh_token = ?,
                                     token_expires_in = ? 
                                   WHERE user_id = ?
                                   AND ml_user_id = ?
                            `;

            const values = [ user.access_token, user.refresh_token, user.token_expires_in, user.user_id, user.ml_user_id ];

            const [ result ] = await conn.query(sql, values);
            return result as ResultSetHeader;
        })
    }

}


