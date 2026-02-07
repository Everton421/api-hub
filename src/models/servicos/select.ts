import { conn } from "../../database/databaseConfig";

type service = {
    codigo: number,
    id: number,
    valor: number,
    aplicacao: string,
    tipo_serv: number,
    data_cadastro: string,
    data_recadastro: string
}


export class Select_servicos {

    async buscaPorCodigo(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {

            let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        from ${empresa}.servicos where codigo = ? `
            await conn.query(sql, [codigo], (err: any, result: any) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }

    async buscaPorCodigoDescricao(empresa: any, param: string) {

        let parametro = `%${param}%`

        const sql = `SELECT *,
       DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
      DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    FROM ${empresa}.servicos
    WHERE  codigo like ? OR aplicacao like ?  limit  20  `;

        return new Promise<service[]>(async (resolve, reject) => {
            await conn.query(sql, [parametro, parametro], (err: any, result: any) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }


    async buscaGeral(empresa: any, data_recadastro: string) {
        return new Promise<service[]>(async (resolve, reject) => {
            let sql = ` select *,
      DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    from ${empresa}.servicos  `
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
                if (err) reject(err);
                resolve(result)
            })
        })
    }


    async novaBusca(empresa: string, query: any) {

        let {
            codigo,
            id,
            aplicacao,
            tipo,
            limit,
            ativo
        } = query;


        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.servicos 
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
        if (tipo) {
            conditions.push("tipo_serv = ?");
            params.push(Number(tipo));
        }
        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }

        if (aplicacao) {
            conditions.push("aplicacao LIKE ?");
            params.push(`%${aplicacao}%`);
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
            // É importante tratar o erro adequadamente. Lançar ou retornar um erro específico.
            throw new Error("Falha ao buscar marcas no banco de dados.");
            // Ou `reject(err)` se estivesse dentro do `new Promise` original, mas com async/await é melhor lançar.
        }
    }



}