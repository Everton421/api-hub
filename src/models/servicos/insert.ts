import { conn } from "../../database/databaseConfig";

export class InsertServico {

    async insert(empresa: any, servico: any) {
        return new Promise((resolve, reject) => {
            const {
                valor,
                aplicacao,
                tipo_serv,
                data_cadastro,
                data_recadastro,
                ativo
            } = servico;

            const sql = ` 
                INSERT INTO  ${empresa}.servicos  
                (
                    valor,
                    aplicacao,
                    tipo_serv,
                    data_cadastro,
                    data_recadastro, 
                    ativo
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const dados = [
                valor, 
                aplicacao, 
                tipo_serv, 
                data_cadastro, 
                data_recadastro, 
                ativo
            ];

            conn.query(sql, dados, (err: any, result: any) => {
                if (err) {
                    console.error("Erro ao inserir serviço:", err);
                    reject(err);
                } else {
                    console.log(`Serviço cadastrado com sucesso`);
                    resolve(result);
                }
            });
        });
    }
}