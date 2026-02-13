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

type queryUpdateSaldo = {
    estoque: number,
    produto: number,
    setor: number,
    data_recadastro: string
}

export class UpdateProdutoSetor {

    async updateSaldo(empresa: any, query: queryUpdateSaldo): Promise<OkPacket> {
        return new Promise((resolve, reject) => {
            // 1. Usamos '?' para os valores. 
            // 2. Usamos crases (backticks) para o nome do banco/tabela por segurança.
            const sql = ` 
                UPDATE \`${empresa}\`.produto_setor 
                SET estoque = ?, data_recadastro = ?
                WHERE produto = ? AND setor = ? 
            `;

            // 3. Colocamos os valores na ordem exata dos '?' acima
            const values = [
                query.estoque,
                query.data_recadastro,
                query.produto,
                query.setor
            ];

            // 4. Passamos o array 'values' como segundo parâmetro
            conn.query(sql, values, (err: any, result: OkPacket) => {
                if (err) {
                    console.error("Erro na query updateSaldo:", err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
}