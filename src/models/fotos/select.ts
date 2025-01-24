import { conn } from "../../database/databaseConfig"


export class Select_fotos{

    async busca_geral(empresa:string){
        return new Promise( async (resolve, reject)=>{

            let sql = ` SELECT *,
               DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
               DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
            FROM ${empresa}.fotos_produtos   `

           await conn.query( sql  ,(err:any, result:any )=>{
               if(err){
                   reject(err);
               }else{
                   resolve(result);
               }
           })
       })
    }

    async buscaPorProduto(empresa:string,codigoProduto:number){
        return new Promise( async (resolve, reject) =>{
            let sql = ` select *,
                           DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
               DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
            from ${empresa}.fotos_produtos where produto = ${codigoProduto}`;
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
