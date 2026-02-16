import { conn } from "../../database/databaseConfig";

export class updateServico {

    async update(empresa: any, servico: any) {

        const {
            codigo,
            id,
            valor,
            aplicacao,
            tipo_serv,
            data_cadastro,
            data_recadastro,
            ativo
        } = servico;

        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE ${empresa}.servicos SET 
                    id = ?,
                    valor = ?,
                    aplicacao = ?,
                    tipo_serv = ?,
                    data_cadastro = ?,
                    data_recadastro = ?,
                    ativo = ?
                WHERE codigo = ?
            `;

            const values = [
                id,
                valor,
                aplicacao,      // O driver vai tratar as aspas aqui automaticamente
                tipo_serv,
                data_cadastro,
                data_recadastro,
                ativo,
                codigo          // O último '?' é o do WHERE
            ];

            conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.error("Erro ao atualizar serviço:", err);
                    reject(err);
                } else {
                    console.log(`serviço atualizado com sucesso`);
                    resolve(result);
                }
            });
        });
    }
}