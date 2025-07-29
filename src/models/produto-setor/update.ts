import { conn } from "../../database/databaseConfig"
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

    type queryUpdateSaldo = 
    {
        estoque:number,
         produto:number,
        setor:number,
        data_recadastro:string
    }
export class UpdateProdutoSetor{
    

    async updateSaldo( empresa:any, query:queryUpdateSaldo):Promise<OkPacket>{
       return new Promise( async ( resolve, reject)=>{
             const sql =` UPDATE  ${empresa}.produto_setor SET
                            estoque = ${query.estoque},
                            data_recadastro = '${query.data_recadastro}'
                            where produto = ${query.produto} and setor = ${query.setor}  
                         `
                          await conn.query(sql,   (err:any, result:OkPacket )=>{
                                                         if(err){
                                                              console.log(err)
                                                              reject(err);
                                                         }else{
                                                           //  console.log(`produto atualizado com sucesso `)
                                                              resolve(result);
                                                         }
                                                     })
                   })
        }

    }