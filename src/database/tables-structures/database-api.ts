 import { conn } from "../databaseConfig"
 
 type resultDatabase =
     {
         fieldCount: number,
         affectedRows: number,
         insertId: number,
         serverStatus: number,
         warningCount: number,
         message: string,
         protocol41: boolean,
         changedRows: number
     }
 type resulFunction = {
     sucess: boolean
     message: string | number
 }
 export class CreateTablesApi {
 
     async createTable(databaseName: string): Promise<resulFunction> {
 
         return new Promise(async (resolve, reject) => {
 
             let sql = `CREATE TABLE IF NOT EXISTS ${databaseName}.ml_accounts (
                           id  int(11) NOT NULL AUTO_INCREMENT,
                             user_id  bigint(20) NOT NULL,
                             ml_user_id  bigint(20) NOT NULL,
                             access_token  text DEFAULT NULL,
                             refresh_token  text DEFAULT NULL,
                             token_expires_in  varchar(255) DEFAULT NULL,
                             PRIMARY KEY ( id ),
                             KEY user_id  ( user_id , ml_user_id)
                             ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`
 
             await conn.query(sql, (err: any, result: resultDatabase) => {
                 if (err) {
                     reject({ sucess: false, message: err });
                 } else {
                     resolve({ sucess: true, message: result.serverStatus });
                 }
             })
         })
 
     }
 }
 