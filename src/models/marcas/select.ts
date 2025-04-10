import { conn } from "../../database/databaseConfig"
import { marca } from "../../types/marcaProduto/marca";


export class Select_Marcas{


    async busca_por_descricao(empresa:string, descricao:string , limit:number) : Promise<marca[]>{

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.marcas 
               WHERE descricao like ? `
               let param= [ `%${descricao}%`, limit ]
 
            await conn.query( sql , param ,(err:any, result :any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }

    async busca_por_codigo(empresa:string, codigo:number,limit:number ): Promise<marca[]>{

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.marcas 
               WHERE codigo = ?
               limit ?
               `
               let param= [ codigo, limit ]
 
            await conn.query( sql, param ,(err:any, result :any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }

    async buscaPorId(empresa:string, id:number , limit:number): Promise<marca[]>{

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.marcas 
               WHERE id = ?
               limit ? 
               `

            let param= [ id, limit ]

            await conn.query( sql, param  ,(err:any, result :any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }


    async busca_geral(empresa:string, limit:number ): Promise<marca[]>{

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.marcas   
                limit ? 
             `
             let param= [   limit ]
 
            await conn.query( sql,param  ,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }


}