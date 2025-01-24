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
        let sql = ` SELECT  codigo, nome, cnpj, celular ,
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

}
