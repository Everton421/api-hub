import { conn } from "../../database/databaseConfig"
import { Select_fotos } from "./select"

type    OkPacket = {
  fieldCount:number,
  affectedRows:number,
  insertId:number,
  serverStatus:number,
  warningCount:number,
  message: string,
  protocol41: boolean,
  changedRows: number
}

export class Delete_fotos{

    async delete(empresa:string, codigoProduto:Number ):Promise<OkPacket>{

    const select = new Select_fotos();

        return new Promise( async (resolve, reject)=>{
        const slq = `DELETE FROM ${empresa}.fotos_produtos WHERE produto=${codigoProduto}`
            await conn.query(slq, (err, result )=>{
                 if(err){
                   reject(err);
               }else{
         //    console.log('imagens deletadas com sucesso!', result)
                   resolve(result);
               }
            })

       })

    
}
 

}
