import { conn } from "../../database/databaseConfig";
import { ISetor } from "./types/setor";

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

export class UpdateSetor {

    async update(empresa: any, tipo_os: ISetor): Promise<OkPacket> {
        return new Promise((resolve, reject) => {
            const {
                codigo,
                data_cadastro,
                data_recadastro,
                descricao,
            } = tipo_os;

            // 1. Substituímos as variáveis e aspas por '?'
            // 2. Usamos crases (backticks) no nome do banco para evitar erros de sintaxe
            const sql = ` 
                UPDATE ${empresa}.setores SET  
                    data_cadastro = ?,
                    data_recadastro = ?,
                    descricao = ? 
                WHERE codigo = ?
            `;

            // 3. Criamos o array de valores na ordem exata dos '?'
            const values = [
                data_cadastro,
                data_recadastro,
                descricao, // Se aqui vier "Setor d'Água", o driver tratará a aspa sozinho
                codigo
            ];

            // 4. Passamos o array 'values' como segundo parâmetro
            conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.error("Erro ao atualizar setor:", err);
                    reject(err);
                } else {
                    console.log(`Setor atualizado com sucesso`);
                    resolve(result);
                }
            });
        });
    }
}