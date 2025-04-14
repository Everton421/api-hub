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



 async novaBusca(empresa: string, query:any):Promise<marca[]> {

        let {
            codigo,
            id,
            descricao,
            limit,
            ativo
        } = query;

        
        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.marcas 
        `;  

        const conditions: string[] = [];
        const params: any[] = [];

        if(!limit || isNaN(limit)){
            limit = 20;
        }

        if (codigo) {
            conditions.push("codigo = ?"); // Placeholder (?) para o parâmetro
            params.push(codigo);          // Adiciona o valor ao array de parâmetros
        }
        if (id) {
            conditions.push("id = ?");
            params.push(Number(id));
        }

         if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }
    
        if (descricao) {
            conditions.push("descricao LIKE ?");
            params.push(`%${descricao}%`);  
        }
        let whereClause = "";
        
        if (conditions.length > 0) {
            whereClause = " WHERE " + conditions.join(" AND ");
        }

        //conditions.join(" LIMIT ?");
      let limitQuery = " LIMIT ? "

        params.push( Number(limit));  

        const finalSql = baseSql + whereClause + limitQuery;

        // console.log("SQL Executado:", finalSql);  
        // console.log("Parâmetros:", params);       

        try {
       
             return new Promise <marca[]> ( async ( resolve , reject ) =>{
                await conn.query(finalSql, params,(err:any, result:marca[] )=>{
                    if (err){
                        reject(err);
                    }else{
                        resolve(result)

                    } 
                })

             })


        } catch (err) {
            console.error("Erro ao executar a query:", err);
            // É importante tratar o erro adequadamente. Lançar ou retornar um erro específico.
            throw new Error("Falha ao buscar marcas no banco de dados.");
            // Ou `reject(err)` se estivesse dentro do `new Promise` original, mas com async/await é melhor lançar.
        }
    }

}