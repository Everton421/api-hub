import { conn } from "../../database/databaseConfig";
import { IProdutoSetor } from "./types/produto-setor";
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
export class InsertProdutoSetor {

    async cadastrarProdutoSetor(empresa: string, produtoSetor: IProdutoSetor): Promise<OkPacket> {
        return new Promise(async (resolve, reject) => {

            let sql = `
                    INSERT INTO ${empresa}.produto_setor (  
                    setor,
                    produto,
                    estoque,
                    local_produto,
                    local1_produto,
                    local2_produto,
                    local3_produto,
                    local4_produto,
                    data_recadastro ) VALUES
                            ( ? , ? , ? , ?, ?, ?, ?, ?, ? ); `;
            const values = [
                produtoSetor.setor,
                produtoSetor.produto,
                produtoSetor.estoque,
                produtoSetor.local_produto,
                produtoSetor.local1_produto,
                produtoSetor.local2_produto,
                produtoSetor.local3_produto,
                produtoSetor.local4_produto,
                produtoSetor.data_recadastro
            ]

            await conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async insertUpateProdutoSetor(empresa: string, produtoSetor: IProdutoSetor): Promise<OkPacket> {
        return new Promise(async (resolve, reject) => {

            let sql = `
                    INSERT INTO ${empresa}.produto_setor  SET 
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

            await conn.query(sql, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }


    async upateProdutoSetor(empresa: string, produtoSetor: IProdutoSetor): Promise<OkPacket> {
        return new Promise(async (resolve, reject) => {

            let sql = `
                     UPDATE  ${empresa}.produto_setor set
                    estoque =${produtoSetor.estoque},
                    local_produto = '${produtoSetor.local_produto}',
                    local1_produto = '${produtoSetor.local1_produto}',
                    local2_produto = '${produtoSetor.local2_produto}',
                    local3_produto = '${produtoSetor.local3_produto}',
                    local4_produto = '${produtoSetor.local4_produto}',
                    data_recadastro = '${produtoSetor.data_recadastro}' 
                    where produto = ${produtoSetor.produto} and setor = ${produtoSetor.setor}
                    `;

            await conn.query(sql, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
}