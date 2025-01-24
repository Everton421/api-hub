import { conn } from "../../database/databaseConfig"


export class Select_Marcas{


    async busca_por_descricao(empresa:string, descricao:string ){

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.marcas 
               WHERE descricao = '${descricao}' `
 
            await conn.query( sql  ,(err:any, result :any)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }


    async busca_geral(empresa:string  ){

        return new Promise( async (resolve, reject)=>{

             let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.marcas   `
 
            await conn.query( sql  ,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }


}