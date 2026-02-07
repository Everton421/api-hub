import { conn } from "../../database/databaseConfig"


export class Select_fotos{

    async busca_geral(empresa:string, data_recadastro:string){
        return new Promise( async (resolve, reject)=>{

            let sql = ` SELECT *,
              TO_BASE64(foto) AS foto,
               DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
               DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
            FROM ${empresa}.fotos_produtos   `
            let paramQuery =[];
            let valueQuery=[];

        if(data_recadastro){
            paramQuery.push( ' WHERE data_recadastro >  ? ')
            valueQuery.push(data_recadastro);
        }
        let finalSql = sql;
        if( paramQuery.length > 0 ){
            finalSql = sql + paramQuery;
        }
           await conn.query( finalSql ,valueQuery ,(err:any, result:any )=>{
               if(err){
                   reject(err);
               }else{
                   resolve(result);
               }
           })
       })
    }

    async buscaPorProduto(empresa:string,codigoProduto:number): Promise <IFoto[]>{
        return new Promise( async (resolve, reject) =>{
            let sql = ` select
                             *,
                            TO_BASE64(foto) AS foto,
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
