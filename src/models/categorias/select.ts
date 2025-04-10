import { conn } from "../../database/databaseConfig"
import { categoria } from "../../types/categoriaProduto/categoria";


export class Select_Categorias{

    async busca_por_descricao(empresa:string, descricao:string ){

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.categorias 
               WHERE descricao = '${descricao}' `
 
            await conn.query( sql  ,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }
    async findByDescription(empresa:string, descricao:string, limit:number ){

        return new Promise( async (resolve, reject)=>{

            let sql = ` SELECT *,
               DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
               DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
            FROM ${empresa}.categorias 
              WHERE descricao like ?  OR codigo like ?
              limit   ?
              `
            const params = [`%${descricao}%`,`%${descricao}%`, limit ]

           await conn.query( sql  , params,(err:any, result:any )=>{
               if(err){
                   reject(err);
               }else{
                   resolve(result);
               }
           })
       })
    }

    async busca_geral(empresa:string , limit:number){

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.categorias  limit ?`
 
            await conn.query( sql ,limit ,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }

    async buscaPorCodigo(empresa:string , codigo:number, limit:number): Promise<categoria[]>{

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.categorias
            where codigo = ? limit ?
             `
            const params = [ codigo, limit ];
            await conn.query( sql, params  ,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }

    async buscaPorId(empresa:string , id:number, limit:number ){

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.categorias
            where id = ? 
            limit   ? 
             `
            const params = [id, limit ]
            await conn.query( sql, params  ,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }
}