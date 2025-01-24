import { conn } from "../../database/databaseConfig";


export class Select_servicos{

    async   buscaPorCodigo(empresa:any, codigo:number)   {
        return new Promise  ( async ( resolve , reject ) =>{
 
        let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        from ${empresa}.servicos where codigo = ? `
            await conn.query(sql, [ codigo], (err:any, result:any  )=>{
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
      DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    FROM ${empresa}.servicos
    WHERE  codigo like ? OR aplicacao = ?    `;
    return new Promise ( async (resolve,reject)=>{
        await conn.query( sql,[ codigo, descricao ], (err:any, result:any)=>{
            if(err){ 
                  reject(err)
            }else{
                 resolve(result)
                 }
        } )
    })
}


async   buscaGeral(empresa:any )   {
    return new Promise   ( async ( resolve , reject ) =>{
    let sql = ` select *,
      DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    from ${empresa}.servicos  `
        await conn.query(sql,  (err:any, result:any )=>{
            if (err)  reject(err); 
              resolve(result)
        })
     })
}


}