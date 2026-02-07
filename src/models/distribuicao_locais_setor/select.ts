import { conn } from "../../database/databaseConfig";
import { IDistribuicaoLocaisSetor } from "../../types/distribuicao_locais_setor/distribuicao_locais_setor";



export class SelectDistribuicaoSetor {

    async selectAll(empresa: string, query: { data_recadastro: string }): Promise<IDistribuicaoLocaisSetor[]> {
        return new Promise(async (resolve, reject) => {


            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
              FROM ${empresa}.distribuicao_locais_setor `;

            let conditions = []
            let values = []

            if (query.data_recadastro && query.data_recadastro !== '') {
                conditions.push(' data_recadastro > ? ');
                values.push(`${query.data_recadastro}`)
            }
            let finalSql = sql

            let whereClause = ' WHERE  '

            if (conditions.length > 0) {
                finalSql = sql + whereClause + conditions
            }

            //     console.log(finalSql)
            //     console.log(values)
            await conn.query(finalSql, values, (err: any, result: any) => {
                if (err) {
                    console.log("Erro ao tentar cosultar as distribuições ", err)
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

    }

    async selectByParam(empresa: string, query: Partial<IDistribuicaoLocaisSetor>): Promise<IDistribuicaoLocaisSetor[]> {
        return new Promise(async (resolve, reject) => {
            if (Object.keys(query).length <= 1) {
                return reject(new Error("Nenhum campo fornecido para filtrar."));
            }

            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
              FROM ${empresa}.distribuicao_locais_setor `;

            let conditions = []
            let values = []

            if (query.produto) {
                conditions.push(' produto = ? ');
                values.push(query.produto)
            }
            if (query.setor) {
                conditions.push(' setor = ? ');
                values.push(query.setor)
            }
            if (query.local) {
                conditions.push(' local = ? ');
                values.push(query.local)
            }
            if (query.unidade_medida) {
                conditions.push(' unidade_medida = ? ');
                values.push(`${query.unidade_medida}`)
            }
            if (query.quantidade) {
                conditions.push(' quantidade = ? ');
                values.push(`${query.quantidade}`)
            }
            if (query.data_cadastro) {
                conditions.push(' data_cadastro = ? ');
                values.push(`${query.data_cadastro}`)
            }
            if (query.data_recadastro) {
                conditions.push(' data_recadastro = ? ');
                values.push(`${query.data_recadastro}`)
            }
            let finalSql = sql

            let whereClause = ' WHERE  '

            if (conditions.length > 0) {
                finalSql = sql + whereClause + conditions.join(' AND ')
            }

            await conn.query(finalSql, values, (err: any, result: any) => {
                if (err) {
                    console.log("Erro ao tentar cosultar as distribuições ", err)
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

    }

    async selectByParamUpdate(empresa: string, query: Partial<IDistribuicaoLocaisSetor>): Promise<IDistribuicaoLocaisSetor[]> {
        return new Promise(async (resolve, reject) => {
            //  if (Object.keys(query).length <= 1) {
            //                      return reject(new Error("Nenhum campo fornecido para filtrar."));
            //                  }

            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
              FROM ${empresa}.distribuicao_locais_setor `;

            let conditions = []
            let values = []

            if (query.produto) {
                conditions.push(' produto = ? ');
                values.push(`${query.produto}`)
            }
            if (query.setor) {
                conditions.push(' setor = ? ');
                values.push(`${query.setor}`)
            }
            if (query.local) {
                conditions.push(' local = ? ');
                values.push(`${query.local}`)
            }
            if (query.unidade_medida) {
                conditions.push(' unidade_medida = ? ');
                values.push(`${query.unidade_medida}`)
            }
            if (query.quantidade) {
                conditions.push(' quantidade = ? ');
                values.push(`${query.quantidade}`)
            }
            if (query.data_cadastro) {
                conditions.push(' data_cadastro = ? ');
                values.push(`${query.data_cadastro}`)
            }
            if (query.data_recadastro) {
                conditions.push(' data_recadastro  < ? ');
                values.push(`${query.data_recadastro}`)
            }
            let finalSql = sql

            let whereClause = ' WHERE  '

            if (conditions.length > 0) {
                finalSql = sql + whereClause + conditions.join(' AND ')
            }

            await conn.query(finalSql, values, (err: any, result: any) => {
                if (err) {
                    console.log("Erro ao tentar cosultar as distribuições ", err)

                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

    }
}