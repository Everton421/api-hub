import { conn } from "../../database/databaseConfig";
import { VeiculoBanco } from "../../types/veiculo/type-veiculo";

export class Select_veiculos {

    async buscaGeral(dbName: string, data_recadastro: string) {
        return new Promise<any[]>(async (resolve, reject) => {

            let sql = `select *,
                  DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
            from ${dbName}.veiculos
                `

            let paramQuery = [];
            let valueQuery = [];

            if (data_recadastro) {
                paramQuery.push(' WHERE data_recadastro >  ? ')
                valueQuery.push(data_recadastro);
            }

            let finalSql = sql;
            if (paramQuery.length > 0) {
                finalSql = sql + paramQuery;
            }
            await conn.query(finalSql, valueQuery, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result)
                }

            })
        })
    }




    async buscaPorCliente(dbName: string, cliente: number) {
        return new Promise<any[]>(async (resolve, reject) => {

            let sql = `select *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                    DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
                    from ${dbName}.veiculos
                    where cliente = ${cliente}
                    ;  `

            await conn.query(sql, (err: any, result: any) => {
                if (err) {

                    reject(err);
                } else {
                    resolve(result)
                }

            })
        })
    }

    async buscaPorCodigo(dbName: string, codigo: number) {
        return new Promise<VeiculoBanco[]>(async (resolve, reject) => {

            let sql = `select *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                    DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
                    from ${dbName}.veiculos
                    where codigo = ${codigo}
                    ;  `

            await conn.query(sql, (err: any, result: any) => {
                if (err) {
                    console.log(`erro ao tentar consultar o veiculo codigo ${codigo}`)
                    reject(err);
                } else {
                    resolve(result)
                }

            })
        })
    }


    async novaBusca(empresa: string, query: any) {

        let {
            codigo,
            cliente,
            id,
            limit,
            placa,
            marca,
            modelo,
            ano,
            ativo,
        } = query;


        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.veiculos 
        `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (!limit || isNaN(limit)) {
            limit = 20;
        }

        if (codigo) {
            conditions.push("codigo = ?"); // Placeholder (?) para o parâmetro
            params.push(codigo);          // Adiciona o valor ao array de parâmetros
        }
        if (id) {
            conditions.push("id = ?");
            params.push(Number(id));
        }
        if (cliente) {
            conditions.push("cliente = ?");
            params.push(Number(cliente));
        }
        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }
        if (placa) {
            conditions.push("placa LIKE ?");
            params.push(`%${placa}%`);
        }

        if (marca) {
            conditions.push("marca LIKE ?");
            params.push(`%${marca}%`);
        }

        if (modelo) {
            conditions.push("modelo LIKE ?");
            params.push(`%${modelo}%`);
        }

        if (ano) {
            conditions.push("ano LIKE ?");
            params.push(`%${ano}%`);
        }

        let whereClause = "";

        if (conditions.length > 0) {
            whereClause = " WHERE " + conditions.join(" AND ");
        }

        //conditions.join(" LIMIT ?");
        let limitQuery = " LIMIT ? "

        params.push(Number(limit));

        const finalSql = baseSql + whereClause + limitQuery;

        // console.log("SQL Executado:", finalSql);  
        // console.log("Parâmetros:", params);       

        try {

            return new Promise(async (resolve, reject) => {
                await conn.query(finalSql, params, (err: any, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result)

                    }
                })

            })


        } catch (err) {
            console.error("Erro ao executar a query:", err);
            throw new Error("Falha ao buscar os veiculos no banco de dados.");
        }
    }




}