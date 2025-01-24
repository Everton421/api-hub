import { conn } from "../../database/databaseConfig";

export class SelectTipo_os{


    async   buscaGeral(empresa:any )   {
        return new Promise   ( async ( resolve , reject ) =>{
        let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro  from ${empresa}.tipos_os  `
            await conn.query(sql,  (err:any, result:any  )=>{
                if (err)  reject(err); 
                  resolve(result)
            })
         })
    }
    
  
}