import { conn } from "../../database/databaseConfig"

export class Select_veiculos{

    async  buscaGeral ( dbName:string ) {
            return new Promise<any[]>( async (resolve, reject )=>{
                
                let sql = `select *,
                  DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
            from ${dbName}.veiculos;
                `
                await conn.query(sql, ( err:any, result:any )=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(result)
                    }

                })
            })
    }




    async  buscaPorCliente ( dbName:string, cliente:number ) {
        return new Promise<any[]>( async (resolve, reject )=>{
            
         let sql = `select *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                    DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
                    from ${dbName}.veiculos
                    where cliente = ${cliente}
                    ;  `

            await conn.query(sql,  ( err:any, result:any )=>{
                if(err){
                
                    reject(err);
                }else{
                    resolve(result)
                }

            })
        })
}
}