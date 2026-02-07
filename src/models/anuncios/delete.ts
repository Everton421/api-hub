 
import { conn } from "../../database/databaseConfig";
type OkPacket = {
  fieldCount: number,
  affectedRows: number,
  insertId: number,
  serverStatus: number,
  warningCount: number,
  message: string,
  protocol41: boolean,
  changedRows: number
}
export class DeleteAnuncios {

    async delete (empresa:string, id:number  ):Promise<OkPacket>{
        return new Promise(( resolve , reject ) =>{
            const sql =
             `
                DELETE FROM ${empresa}.anuncios WHERE id = ${id};
             ` 
            conn.query(sql, ( err, result )=>{
                if(err){
                    reject(err)
                }else{
        
                    resolve(result)
                }
            })
        })


    }
}