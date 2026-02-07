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

        return new Promise(async (resolve, reject) => {
            let sql =
                `
            UPDATE ${empresa}.servicos SET 
              id = ${id},
              valor = ${valor},
              aplicacao = '${aplicacao}',
              tipo_serv = ${tipo_serv},
              data_cadastro = '${data_cadastro}',
              data_recadastro = '${data_recadastro}',
              ativo = '${ativo}'
                where codigo = ${codigo}
              `

            await conn.query(sql, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log(`servico atualizado com sucesso `)
                    resolve(result);
                }
            })

        })
    }
}