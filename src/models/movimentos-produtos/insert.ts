import { conn } from "../../database/databaseConfig"
import { IMovimentosProdutos } from "./types/movimentos_produtos";
 
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
export class InsertMovimentosProdutos{

    async insertMovimentos( empresa:string, movimentoProduto:Partial<IMovimentosProdutos> ){
        return new Promise( async (resolve, reject )=>{
            
            let sql = `
                    INSERT INTO ${empresa}.movimentos_produtos (  
                        setor,
                        produto,
                        quantidade,
                        tipo,
                        historico,
                        data_recadastro  
                    
                    ) VALUES
                            ( ? , ? , ? , ?, ?, ? ); `;
            const values = [  
                        movimentoProduto.setor,
                        movimentoProduto.produto,
                        movimentoProduto.quantidade,
                        movimentoProduto.tipo,
                        movimentoProduto.historico,
                        movimentoProduto.data_recadastro,
             ]

            await conn.query( sql , values,(err:any, result:any )=>{
                if(err){
                    console.log(err)
                    reject(err);
                }else{
                    resolve(result);
                }
            })  
        })
    }

      /*async insertUpateMovimentos( empresa:string, produtoSetor:IMovimentosProdutos ):Promise<OkPacket>{
        return new Promise( async (resolve, reject )=>{
            
            let sql = `
                    INSERT INTO ${empresa}.movimentos_produtos  SET 
                    setor =${produtoSetor.setor},
                    produto =${produtoSetor.produto},
                    estoque =${produtoSetor.estoque},
                    local_produto = '${produtoSetor.local_produto}',
                    local1_produto = '${produtoSetor.local1_produto}',
                    local2_produto = '${produtoSetor.local2_produto}',
                    local3_produto = '${produtoSetor.local3_produto}',
                    local4_produto = '${produtoSetor.local4_produto}',
                    data_recadastro = '${produtoSetor.data_recadastro}' 
                    ON DUPLICATE  KEY UPDATE  
                    estoque =${produtoSetor.estoque},
                    setor =${produtoSetor.setor},
                    local_produto = '${produtoSetor.local_produto}',
                    local1_produto = '${produtoSetor.local1_produto}',
                    local2_produto = '${produtoSetor.local2_produto}',
                    local3_produto = '${produtoSetor.local3_produto}',
                    local4_produto = '${produtoSetor.local4_produto}',
                    data_recadastro = '${produtoSetor.data_recadastro}'  
                    `;

            await conn.query( sql ,  (err:any, result:any )=>{
                if(err){
                    console.log(err)
                    reject(err);
                }else{
                    resolve(result);
                }
            })  
        })
    }
    */
}