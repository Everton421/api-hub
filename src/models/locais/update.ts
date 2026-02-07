import { conn } from "../../database/databaseConfig"
import { ILocal } from "../../types/locais/type-local";

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
type updateLocal = Partial<Omit<ILocal, 'codigo'>> & {codigo: ILocal['codigo'] }
 
type conditionUpdate = { 
    codigo:number 
    setor:number 
    ativo: 'S'| 'N'
    id:string
}
export class UpdateLocais{


    async update ( empresa:any, local:Partial<updateLocal> ):Promise<OkPacket>{ 

       return new Promise( async ( resolve, reject)=>{
            let {
                codigo,
                data_recadastro,
                ativo,
                data_cadastro,
                descricao,
                id,
                setor
            } = local
        if (Object.keys(local).length <= 1) {
                        return reject(new Error("Nenhum campo fornecido para atualização."));
                    }
                const sql =` UPDATE  ${empresa}.locais SET  `;
                            let conditions = [ ]
                            let values = []

                                if(ativo){
                                    conditions.push( ' ativo = ? ')
                                    values.push(`${ativo}`)
                                }
                                if(data_cadastro){
                                    conditions.push( ' data_cadastro = ? ')
                                    values.push(`${data_cadastro}`)
                                }
                                 if(data_recadastro){
                                    conditions.push( ' data_recadastro = ? ')
                                    values.push(`${data_recadastro}`)
                                }
                                if(descricao){
                                    conditions.push( ' descricao = ? ')
                                    values.push(`${descricao}`)
                                }
                                if(id){
                                    conditions.push( ' id = ? ')
                                    values.push(`${id}` )
                                }
                                if(setor){
                                    conditions.push( ' setor = ? ')
                                    values.push( setor )
                                }                                   

                              let whereClause = ` where codigo =  ? `
                                    values.push( codigo )

                                    let finalSql = sql;
                                if(conditions.length > 0 ){
                                    finalSql = sql + conditions.join(' , ') + whereClause 
                                }

                            await conn.query(finalSql, values, (err:any, result:any )=>{
                                if(err){
                                     console.log("Erro ao tentar atualizar local", err)
                                     reject(err);
                                }else{
                                    console.log(`local atualizado com sucesso `)
                                     resolve(result);
                                }
                            })
                        })
        }

          async updateByCondition ( empresa:any, local:Partial<updateLocal>, condition:Partial<conditionUpdate> ) :Promise<OkPacket>{

       return new Promise( async ( resolve, reject)=>{
            let {
                codigo,
                data_recadastro,
                ativo,
                data_cadastro,
                descricao,
                id,
                setor
            } = local
        if (Object.keys(local).length <= 1) {
                        return reject(new Error("Nenhum campo fornecido para atualização."));
                    }
     if (Object.keys(local).length <= 1) {
                        return reject(new Error("Nenhuma condição fornecida para atualização."));
                    }

                const sql =` UPDATE  ${empresa}.locais SET  `;
                            let conditions = [ ]
                            let values = []

                                if(ativo){
                                    conditions.push( ' ativo = ? ')
                                    values.push(`${ativo}`)
                                }
                                if(data_cadastro){
                                    conditions.push( ' data_cadastro = ? ')
                                    values.push(`${data_cadastro}`)
                                }
                                 if(data_recadastro){
                                    conditions.push( ' data_recadastro = ? ')
                                    values.push(`${data_recadastro}`)
                                }
                                if(descricao){
                                    conditions.push( ' descricao = ? ')
                                    values.push(`${descricao}`)
                                }
                                if(id){
                                    conditions.push( ' id = ? ')
                                    values.push(`${id}` )
                                }
                                if(setor){
                                    conditions.push( ' setor = ? ')
                                    values.push( setor )
                                }                                   

                              let whereClause = ` where codigo =  ? `
                                    values.push( codigo )

                                    let finalSql = sql;
                                if(conditions.length > 0 ){
                                    finalSql = sql + conditions.join(' , ') + whereClause 
                                }

                            await conn.query(finalSql, values, (err:any, result:any )=>{
                                if(err){
                                     console.log("Erro ao tentar atualizar local", err)
                                     reject(err);
                                }else{
                                    console.log(`local atualizado com sucesso `)

                                     resolve(result);
                                }
                            })
                        })
        }  

}
 