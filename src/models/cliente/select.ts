import { conn } from "../../database/databaseConfig";
import { Cliente } from "./interface_cliente";


export class Select_clientes{

    async   buscaGeral(empresa:any, vendedor:any )   {
        return new Promise <Cliente[]> ( async ( resolve , reject ) =>{
       let sql = ` select *,
             DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
            from ${empresa}.clientes c
            WHERE c.ativo = 'S' and 
                       ( c.vendedor = ${vendedor} OR c.vendedor = 0 or c.vendedor = null)
                       order by c.vendedor    `
            await conn.query(sql,  (err:any, result:Cliente[] )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }
    
    async   buscaPorVendedor(empresa:any, vendedor:number )   {
        return new Promise <Cliente[]> ( async ( resolve , reject ) =>{
        let sql = ` SELECT *,
             DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
           FROM ${empresa}.clientes WHERE vendedor = ?  `
            await conn.query(sql, [ vendedor], (err:any, result:Cliente[] )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }

    async   buscaPorcodigo(empresa:any, codigo:number )   {
        return new Promise <Cliente[]> ( async ( resolve , reject ) =>{
        let sql = ` SELECT   *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        FROM ${empresa}.clientes WHERE codigo = ?  `
            await conn.query(sql, [ codigo], (err:any, result:Cliente[] )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }

    async   buscaPorCnpj(empresa:any, cnpj:any )   {
      return new Promise <Cliente[]> ( async ( resolve , reject ) =>{
      let sql = ` SELECT  *,
        DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
          DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
      FROM ${empresa}.clientes WHERE cnpj = ?  `
          await conn.query(sql, [ cnpj], (err:any, result:Cliente[] )=>{
              if (err)  reject(err); 
                resolve(result)
          })
       })
  }
  
  async   buscaUltimoIdInserido(empresa:any,   )   {
    return new Promise <any> ( async ( resolve , reject ) =>{
    let sql = ` SELECT MAX(codigo) as codigo FROM ${empresa}.clientes `
        await conn.query(sql,   (err:any, result:any )=>{
            if (err)  reject(err); 
              resolve(result)
        })
     })
}

async   buscaPorCodigoOuDescricaoOuCnpj(empresa:any, param:string  )   {
  return new Promise <any> ( async ( resolve , reject ) =>{
    let parametro = `%${param}%`
    let sql = ` SELECT  *,
    DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
      DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
  FROM ${empresa}.clientes   where nome like ? or codigo like ? or cnpj like ? limit 50`
      await conn.query(sql,  [parametro, parametro, parametro ] ,(err:any, result:any )=>{
          if (err)  reject(err); 
            resolve(result)
      })
   })
}



async novaBusca(empresa:any, query:any ){

let { nome, cnpj, codigo, limit } = query 

    let baseSql = ` select *,
              DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
              DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
              from ${empresa}.clientes  
              `;


              const conditions: string[] = [];
              const params: any[] = [];
      
        if(!limit || isNaN(limit) ){
                limit = 20;
            }


            if (codigo) {
              conditions.push("codigo = ?"); // Placeholder (?) para o parâmetro
              params.push(Number(codigo));          // Adiciona o valor ao array de parâmetros
          }

          if (cnpj) {
            conditions.push("cnpj = ?"); // Placeholder (?) para o parâmetro
            params.push(cnpj );          // Adiciona o valor ao array de parâmetros
         }

          if (nome) {
            conditions.push("nome LIKE ?");
            params.push(`%${nome}%`);  
        }

      let whereClause = "";

        if (conditions.length > 0) {
          whereClause = " WHERE " + conditions.join(" AND ");
      }


      let limitQuery = " LIMIT ? "

       

       params.push( Number(limit));  
      
      const finalSql = baseSql + whereClause + limitQuery;


       // console.log('sql ',finalSql);
       // console.log('params ',params);

          console.log(query)
      try{
        return new Promise <any[]> ( async ( resolve , reject ) =>{
        await conn.query(finalSql, params,(err:any, result: any[] )=>{
          if (err){
              reject(err);
          }else{
              resolve(result)
            } 
          })
      })

      }catch(e){
        console.error("Erro ao executar a query:", e);
        // É importante tratar o erro adequadamente. Lançar ou retornar um erro específico.
        throw new Error("Falha ao buscar produtos no banco de dados.");
        // Ou `reject(err)` se estivesse dentro do `new Promise` original, mas com async/await é melhor lançar.
      }

  }





}
