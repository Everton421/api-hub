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

    type queryMovimentos = 
    {
    codigo:number
    setor:number
    produto:number
    quantidade:string
    unidade_medida:string
    tipo:string
    historico:string
    data_recadastro:string,
    usuario:number
      ent_sai:string
    }
export class UpdateMovimentos{
    

    async updateMovimentos( empresa:any, query:queryMovimentos):Promise<OkPacket>{
       return new Promise( async ( resolve, reject)=>{
             const sql =` UPDATE  ${empresa}.movimentos_produtos SET
                            quantidade = ${query.quantidade},
                            data_recadastro = '${query.data_recadastro}',
                            setor = '${query.setor}',
                            produto ='${query.produto}',
                            unidade_medida = '${query.unidade_medida}',
                            historico = '${query.historico}',
                               tipo = '${query.tipo}',
                               usurio=  ${query.usuario},
                               ent_sai = '${query.ent_sai}'
                            where codigo = ${query.codigo}    
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