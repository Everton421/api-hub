import { conn } from "../../database/databaseConfig";
import { tipo_os } from "../../types/tipo_os/type-tipo-os";

export class SelectTipo_os {


    async buscaGeral(empresa: any, data_recadastro: string) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro  from ${empresa}.tipos_os  `

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
    async buscaPorCodigo(empresa: any, codigo: number): Promise<tipo_os[]> {
        return new Promise(async (resolve, reject) => {
            let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro  from ${empresa}.tipos_os 
            where codigo = ${codigo}
            `
            await conn.query(sql, (err: any, result: any) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }

    async novaBusca(empresa: string, query: any) {

        let {
            codigo,
            descricao,
            id,
            limit,
            ativo
        } = query;


        let baseSql = `
       SELECT *,
              DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
              DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
           FROM ${empresa}.tipos_os 
      `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (!limit || isNaN(limit)) {
            limit = 20;
        }
        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }
        if (codigo) {
            conditions.push("codigo = ?"); // Placeholder (?) para o parâmetro
            params.push(codigo);          // Adiciona o valor ao array de parâmetros
        }
        if (id) {
            conditions.push("id = ?");
            params.push(Number(id));
        }

        if (descricao) {
            conditions.push("descricao LIKE ?");
            params.push(`%${descricao}%`);
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
            throw new Error("Falha ao buscar os tipo de OS no banco de dados.");
        }
    }

}