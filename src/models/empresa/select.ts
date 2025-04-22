import { conn, db_api } from "../../database/databaseConfig";

export class SelectEmpresa{
    
         

    async selectPorCnpj(cnpj:string):Promise<IEmpresasBanco[]>{

        return new Promise((resolve, reject ) =>{
            const sql = `
            select *,
                DATE_FORMAT(data_contrato, '%Y-%m-%d') as data_contrato,
                DATE_FORMAT(inicio_contrato, '%Y-%m-%d') as inicio_contrato,
                DATE_FORMAT(fim_contrato, '%Y-%m-%d') as fim_contrato 
             from ${db_api}.empresas where cnpj = ?     
            `
            conn.query(sql, cnpj , (err, result )=>{
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
            select 
            
            *,
                DATE_FORMAT(data_contrato, '%Y-%m-%d') as data_contrato,
                DATE_FORMAT(inicio_contrato, '%Y-%m-%d') as inicio_contrato,
                DATE_FORMAT(fim_contrato, '%Y-%m-%d') as fim_contrato 
            from ${db_api}.empresas      
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