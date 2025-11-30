 
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
export class DeleteAtributosAnuncios {

    async delete (empresa:string, id:number  ):Promise<OkPacket>{
        return new Promise(( resolve , reject ) =>{
            const sql =
             `
                DELETE FROM ${empresa}.atributos_anuncios WHERE id_anuncio = ${id};
             ` 
            conn.query(sql, ( err, result:OkPacket )=>{
                if(err){
                    reject(err)
                }else{
                 
                    resolve(result)
                }
            })
        })


    }
}