import { conn } from "../../database/databaseConfig"
type OkPacket = {
  fieldCount: number,
  affectedRows: number,
  insertId: number,
  serverStatus: number,
  warningCount: number,
  message: string,
  protocol41: boolean,
  changedRows: number
}
export class InsertSetor{

    async cadastrarSetor( empresa:string, setor:any ):Promise<OkPacket>{
        return new Promise( async (resolve, reject )=>{
            
            let sql = `
                    INSERT INTO ${empresa}.setores (   data_cadastro, data_recadastro, descricao ) VALUES
                                                      (   ? , ? , ? ); `;
            const values = [  setor.data_cadastro, setor.data_recadastro, setor.descricao, ]

            await conn.query( sql , values,(err:any, result:any )=>{
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    console.log(result)
                    resolve(result);
                }
            })  
        })
    }
}