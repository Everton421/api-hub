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
        return new Promise((resolve, reject) => {
            // Nota: O nome do banco/tabela (${empresa}) não aceita "?". 
            // Certifique-se que a variável 'empresa' venha de uma fonte segura (token/sessão).
            let sql = `
                    INSERT INTO \`${empresa}\`.produto_setor (  
                    setor, produto, estoque, local_produto, local1_produto,
                    local2_produto, local3_produto, local4_produto, data_recadastro 
                    ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? ); `;
            
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
            ];

            conn.query(sql, values, (err: any, result: any) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    async insertUpateProdutoSetor(empresa: string, produtoSetor: IProdutoSetor): Promise<OkPacket> {
        return new Promise((resolve, reject) => {
            // Removidas as aspas simples e substituído por "?"
            let sql = `
                INSERT INTO \`${empresa}\`.produto_setor (
                    setor, produto, estoque, local_produto, local1_produto, 
                    local2_produto, local3_produto, local4_produto, data_recadastro
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE  
                    estoque = VALUES(estoque),
                    setor = VALUES(setor),
                    local_produto = VALUES(local_produto),
                    local1_produto = VALUES(local1_produto),
                    local2_produto = VALUES(local2_produto),
                    local3_produto = VALUES(local3_produto),
                    local4_produto = VALUES(local4_produto),
                    data_recadastro = VALUES(data_recadastro)
            `;

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
            ];

            conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    async upateProdutoSetor(empresa: string, produtoSetor: IProdutoSetor): Promise<OkPacket> {
        return new Promise((resolve, reject) => {
            let sql = `
                UPDATE \`${empresa}\`.produto_setor SET
                    estoque = ?,
                    local_produto = ?,
                    local1_produto = ?,
                    local2_produto = ?,
                    local3_produto = ?,
                    local4_produto = ?,
                    data_recadastro = ?
                WHERE produto = ? AND setor = ?
            `;

            const values = [
                produtoSetor.estoque,
                produtoSetor.local_produto,
                produtoSetor.local1_produto,
                produtoSetor.local2_produto,
                produtoSetor.local3_produto,
                produtoSetor.local4_produto,
                produtoSetor.data_recadastro,
                produtoSetor.produto,
                produtoSetor.setor
            ];

            conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                resolve(result);
            });
        });
    }
}