import { type ResultSetHeader } from "mysql2";
import { conn } from "../../database/databaseConfig.ts";
import { type  InsertUserMl } from "../../types/ml-account/type-ml-account.ts";


export class InsertaMLAccountClient {


    async cadastrar(empresa: string, user: InsertUserMl) {

            let sql = `
                    INSERT INTO ${empresa}.ml_accounts (   user_id,  ml_user_id, access_token, refresh_token , token_expires_in ) VALUES
                                                      ( ? , ? , ? , ? , ?); `;
            const values = [user.user_id, user.ml_user_id, user.access_token, user.refresh_token, user.token_expires_in]

            const [result ] = await conn.query(sql, values)
            return result as ResultSetHeader;
    }
}