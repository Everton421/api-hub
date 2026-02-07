import { conn } from "../../database/databaseConfig";

export class InsertServico {

    async insert(empresa: any, servico: any) {

        return new Promise(async (resolve, reject) => {
            let {
                codigo,
                valor,
                aplicacao,
                tipo_serv,
                data_cadastro,
                data_recadastro,
                ativo
            } = servico

            const sql = ` INSERT INTO  ${empresa}.servicos  
                             (
                            valor ,
                            aplicacao,
                            tipo_serv,
                            data_cadastro,
                            data_recadastro, 
                            ativo
                                ) VALUES (
                                     ${valor},
                                    '${aplicacao}',
                                    ${tipo_serv},
                                   '${data_cadastro}',
                                   '${data_recadastro}', 
                                  '${ativo}'
                                   )
                            `;

            let dados = [valor, aplicacao, tipo_serv, data_cadastro, data_recadastro, ativo]
            await conn.query(sql, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log(`servico cadastrado com sucesso `)
                    resolve(result);
                }
            })
        })
    }

}
