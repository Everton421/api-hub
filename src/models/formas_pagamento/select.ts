import { conn } from "../../database/databaseConfig";
import { formaPagamentoBanco, queryFpgt } from "../../types/formas_pagamento/type-formas-pagamento";




export class SelectForma_pagamento{


    async   buscaGeral(empresa:any, data_recadastro:string )   {
        return new Promise   ( async ( resolve , reject ) =>{
        let sql = ` select *,
         DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        from ${empresa}.forma_pagamento  `


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
            await conn.query(finalSql, data_recadastro,  (err:any, result:any  )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }


    async novaBusca(empresa: string, query: Partial<queryFpgt>):Promise<formaPagamentoBanco[]> {
    
        let {
            codigo,
            id,
            limit,
            descricao,
            parcelas,
            ativo,
        } = query
         
        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.forma_pagamento 
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
        
        if (parcelas) {
            conditions.push("parcelas = ?");
            params.push(Number(parcelas));
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

        let limitQuery = " LIMIT ? "

        params.push( Number(limit));  

        const finalSql = baseSql + whereClause + limitQuery;


        try {
       
             return new Promise  ( async ( resolve , reject ) =>{
                await conn.query(finalSql, params,(err:any, result  )=>{
                    if (err){
                        reject(err);
                    }else{
                        resolve(result)

                    } 
                })

             })


        } catch (err) {
            console.error("Erro ao executar a query:", err);
            throw new Error("Falha ao buscar formas de pagamento no banco de dados.");
        }
    }
    
  
}