import { conn } from "../../database/databaseConfig"
import { Produto } from "./interface_produto"

export class Select_produtos{

    async   buscaPorCodigo(empresa:any, codigo:number)   {
        return new Promise <Produto[]> ( async ( resolve , reject ) =>{
 
        let sql = `
         select 
            *,
                 DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
             CONVERT(observacoes1 USING utf8) as observacoes1,
             CONVERT(observacoes2 USING utf8) as observacoes2,
             CONVERT(observacoes3 USING utf8) as observacoes3
        from ${empresa}.produtos where codigo = ? `
            await conn.query(sql, [    codigo], (err:any, result:Produto[] )=>{
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
            WHERE  codigo like ? OR descricao = ?    `;
    return new Promise<Produto[]>( async (resolve,reject)=>{
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
    return new Promise<Produto[]>( async (resolve,reject)=>{
        await conn.query( sql,[  parametro , parametro], (err:any, result:any)=>{
            if(err){ 
                  reject(err)
            }else{
                 resolve(result)
                 }
        } )
    })
}

async   buscaGeral(empresa:any )   {
    return new Promise <Produto[]> ( async ( resolve , reject ) =>{
        let sql = ` select 
        *,
        DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro, 
             CONVERT(observacoes1 USING utf8) as observacoes1,
             CONVERT(observacoes2 USING utf8) as observacoes2,
             CONVERT(observacoes3 USING utf8) as observacoes3
        from ${empresa}.produtos  `
        await conn.query(sql,  (err:any, result:Produto[] )=>{
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

}