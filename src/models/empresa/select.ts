import { conn, db_api } from "../../database/databaseConfig";

export class SelectEmpresa{
    
         

    async selectPorCnpj(cnpj:string):Promise<IEmpresasBanco[]>{

        return new Promise((resolve, reject ) =>{
            const sql = `
            select * from ${db_api}.empresas where cnpj = ?     
            `
            conn.query(sql, String(cnpj) , (err, result )=>{
                        if(err){
                            console.log(err);
                            reject(err)
                        }else{
                            resolve(result);
                        }
                 } 
            )
        })
      
    }
    
    async selectAll(cnpj:string):Promise<IEmpresasBanco[]>{

        return new Promise((resolve, reject ) =>{
            const sql = `
            select * from ${db_api}.empresas      
            `
            conn.query(sql, String(cnpj) , (err, result )=>{
                        if(err){
                            console.log(err);
                            reject(err)
                        }else{
                            resolve(result);
                        }
                 } 
            )
        })
      
    }
}