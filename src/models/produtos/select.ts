import { conn } from "../../database/databaseConfig"
import { ProdutoBanco } from "../../types/produto/produto"


type queryProd = {
    codigo:number;
    marca:number;
    grupo:number;
    descricao:string;
}

export class Select_produtos{

    async   buscaPorCodigo(empresa:any, codigo:number)   {
        return new Promise <ProdutoBanco[]> ( async ( resolve , reject ) =>{
 
        let sql = `
         select 
            *,
                 DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
             CONVERT(observacoes1 USING utf8) as observacoes1,
             CONVERT(observacoes2 USING utf8) as observacoes2,
             CONVERT(observacoes3 USING utf8) as observacoes3
        from ${empresa}.produtos where codigo = ? `
            await conn.query(sql, [    codigo], (err:any, result:ProdutoBanco[] )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }

async buscaPorCodigoDescricao(empresa:any, codigo:number, descricao:string){

    if(!codigo) codigo = 0; 
    if(!descricao) descricao = '';
     

    const sql = `SELECT *, 
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
                  CONVERT(observacoes1 USING utf8) as observacoes1,
                  CONVERT(observacoes2 USING utf8) as observacoes2,
                  CONVERT(observacoes3 USING utf8) as observacoes3

            FROM ${empresa}.produtos 
            WHERE  codigo like ? OR descricao = ?  limit  20  `;
    return new Promise<ProdutoBanco[]>( async (resolve,reject)=>{
        await conn.query( sql,[ codigo, descricao ], (err:any, result:any)=>{
            if(err){ 
                  reject(err)
            }else{
                 resolve(result)
                 }
        } )
    })
}

async buscaPorCodigoOuDescricao(empresa:any, parametro:string){

    const sql = `SELECT *, 
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
                  CONVERT(observacoes1 USING utf8) as observacoes1,
                  CONVERT(observacoes2 USING utf8) as observacoes2,
                  CONVERT(observacoes3 USING utf8) as observacoes3

            FROM ${empresa}.produtos 
            WHERE  codigo like ? OR descricao = ?    `;
    return new Promise<ProdutoBanco[]>( async (resolve,reject)=>{
        await conn.query( sql,[  parametro , parametro], (err:any, result:any)=>{
            if(err){ 
                  reject(err)
            }else{
                 resolve(result)
                 }
        } )
    })
}

async buscaPorCodigoOuDescricaoLimit(empresa:any, parametro:string){

    const sql = `SELECT *, 
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
                  CONVERT(observacoes1 USING utf8) as observacoes1,
                  CONVERT(observacoes2 USING utf8) as observacoes2,
                  CONVERT(observacoes3 USING utf8) as observacoes3

            FROM ${empresa}.produtos 
            WHERE  codigo like ? OR descricao like ?   limit 15 `;
    return new Promise<ProdutoBanco[]>( async (resolve,reject)=>{
        await conn.query( sql,[  parametro , parametro], (err:any, result:any)=>{
            if(err){ 
                  reject(err)
            }else{
                 resolve(result)
                 }
        } )
    })
}

async   buscaGeral(empresa:any, data_recadastro:string )   {
    return new Promise <ProdutoBanco[]> ( async ( resolve , reject ) =>{
        
        let sql = ` select 
        *,
        DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro, 
             CONVERT(observacoes1 USING utf8) as observacoes1,
             CONVERT(observacoes2 USING utf8) as observacoes2,
             CONVERT(observacoes3 USING utf8) as observacoes3
        from ${empresa}.produtos  `

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
             

        await conn.query(finalSql, valueQuery, (err:any, result:ProdutoBanco[] )=>{
            if (err)  reject(err); 
              resolve(result)
        })
     })
}

async   buscaUltimoCodigoInserido(empresa:any )   {
    return new Promise <any> ( async ( resolve , reject ) =>{

    let sql = ` select MAX(codigo) as codigo  from ${empresa}.produtos `
        await conn.query(sql,   (err:any, result:any[] )=>{
            if (err)  reject(err); 
              resolve(result[0])
        })
     })
}



 async novaBusca(empresa: string, query:any): Promise<ProdutoBanco[]> {

        let {
            codigo,
            marca,
            grupo,
            descricao,
            limit ,
            ativo
        } = query;

        let baseSql = `
            SELECT
                *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro, 
            CONVERT(observacoes1 USING utf8) as observacoes1,
            CONVERT(observacoes2 USING utf8) as observacoes2,
            CONVERT(observacoes3 USING utf8) as observacoes3
            FROM  ${empresa}.produtos
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
        if (marca) {
            conditions.push("marca = ?");
            params.push(Number(marca));
        }

        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }

        if (grupo) {
            conditions.push("grupo = ?");
            params.push(Number(grupo));
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
       
             return new Promise <ProdutoBanco[]> ( async ( resolve , reject ) =>{
                await conn.query(finalSql, params,(err:any, result:ProdutoBanco[] )=>{
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
            throw new Error("Falha ao buscar produtos no banco de dados.");
            // Ou `reject(err)` se estivesse dentro do `new Promise` original, mas com async/await é melhor lançar.
        }
    }

}