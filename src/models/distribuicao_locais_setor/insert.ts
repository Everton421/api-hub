import { conn } from "../../database/databaseConfig";
import { IDistribuicaoLocaisSetor } from "../../types/distribuicao_locais_setor/distribuicao_locais_setor";


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


export class InsertDistribuicaoLocaisSetor{
    
    async insert( empresa:string, obj:IDistribuicaoLocaisSetor  ):Promise<OkPacket>{
           return new Promise( async (resolve, reject )=>{
                    
                    let sql = `
                            INSERT INTO ${empresa}.distribuicao_locais_setor ( 
                            produto,
                            setor,
                            local,
                            unidade_medida,
                            quantidade,
                            data_cadastro,
                            data_recadastro
                             ) VALUES
                             ( ? , ? , ? , ? , ?, ? , ? ); `;
                    const values = [ obj.produto , obj.setor, obj.local, obj.unidade_medida, obj.quantidade, obj.data_cadastro,obj.data_recadastro  ]
        
                    await conn.query( sql , values,(err:any, result:any )=>{
                        if(err){
                            console.log('Erro ao tentar registrar o distribuicao dos produtos nos locais', err )
                            reject(err);
                        }else{
                            resolve(result);
                        }
                    })  
                })
    }
}