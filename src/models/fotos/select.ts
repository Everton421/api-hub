import { conn } from "../../database/databaseConfig"


export class Select_fotos{

    async busca_geral(empresa:string){
        return new Promise( async (resolve, reject)=>{

            let sql = ` SELECT *,
               DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
               DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
            FROM ${empresa}.fotos_produtos   `

           await conn.query( sql  ,(err, result )=>{
               if(err){
                   reject(err);
               }else{
                   resolve(result);
               }
           })
       })
    }

    async buscaPorProduto(codigoProduto:number){
        return new Promise( async (resolve, reject) =>{
            let sql = ` select * from fotos_produtos where produto = ${codigoProduto}`;
            await conn.query( sql  ,(err, result )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })
        })
    }
}
