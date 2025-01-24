import { conn } from "../../database/databaseConfig"

export class Insert_Categorias{

    async cadastrar( empresa:string, categoria:any ){
        return new Promise( async (resolve, reject )=>{
            
            let sql = `
                    INSERT INTO ${empresa}.categorias ( id, data_cadastro, data_recadastro, descricao ) VALUES
                                                      ( ? , ? , ? , ? ); `;
            const values = [ categoria.id , categoria.data_cadastro, categoria.data_recadastro, categoria.descricao]

            await conn.query( sql , values,(err:any, result:any )=>{
                if(err){
                    reject(err);
                    console.log(err)
                }else{
                    resolve(result);
                }
            })  
        })
    }
}