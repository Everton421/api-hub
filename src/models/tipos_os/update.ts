import { conn } from "../../database/databaseConfig";
import { tipo_os } from "../../types/tipo_os/type-tipo-os";

export class Update_tipo_os {

    async update(empresa: any, tipo_os: tipo_os) {

        return new Promise((resolve, reject) => {
            let {
                codigo,
                id,
                data_cadastro,
                data_recadastro,
                descricao,
                ativo
            } = tipo_os;

            // Mantido o ${empresa} conforme solicitado.
            // Substituídos os valores por '?' para tratar as aspas automaticamente.
            const sql = ` 
                UPDATE ${empresa}.tipos_os SET  
                    id = ?,
                    data_cadastro = ?,
                    data_recadastro = ?,
                    descricao = ?,
                    ativo = ?
                WHERE codigo = ?
            `;

            // Array com os valores na ordem exata dos '?'
            const values = [
                id,
                data_cadastro,
                data_recadastro,
                descricao, // Aqui as aspas serão tratadas pelo driver
                ativo,
                codigo     // O valor do WHERE
            ];

            conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(`tipo_os atualizada com sucesso`);
                    resolve(result);
                }
            });
        });
    }
}