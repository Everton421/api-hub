import { conn } from "../../database/databaseConfig";

type service = {
     codigo : number,
     id: number,
     valor : number,
     aplicacao : string,
     tipo_serv : number,
     data_cadastro :string,
     data_recadastro : string
}


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

async buscaPorCodigoDescricao(empresa:any, param:string){
 
     let parametro = `%${param}%`

    const sql = `SELECT *,
       DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
      DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    FROM ${empresa}.servicos
    WHERE  codigo like ? OR aplicacao like ?  limit  20  `;

    return new Promise <service[]>( async (resolve,reject)=>{
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
    return new Promise <service[]>  ( async ( resolve , reject ) =>{
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