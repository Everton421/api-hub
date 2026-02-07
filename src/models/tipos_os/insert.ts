import { conn } from "../../database/databaseConfig"

export class Insert_tipos_os{

    async cadastrar( empresa:string, marca:any ){
        return new Promise( async (resolve, reject )=>{
            
            let sql = `
                    INSERT INTO ${empresa}.tipos_os ( id, data_cadastro, data_recadastro, descricao, ativo ) VALUES
                                                      ( ? , ? , ? , ? , ?); `;
            const values = [ marca.id , marca.data_cadastro, marca.data_recadastro, marca.descricao, marca.ativo]

            await conn.query( sql , values,(err:any, result:any )=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result);
                }
            })  
        })
    }
}