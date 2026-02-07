import { conn } from "../../database/databaseConfig";
import { ISetor } from "./types/setor";

type query = {
    codigo: number,
    descricao: string,
    limit: number,
    id: number,
    ativo: 'S' | 'N'
}
export class SelectSetor {

    async findAll(empresa: any, data_recadastro: string) {
        return new Promise<ISetor[]>(async (resolve, reject) => {

            let sql = ` select 
            *,
            coalesce( DATE_FORMAT(data_cadastro, '%Y-%m-%d') , '0000-00-00') AS data_cadastro,
           coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro   
            from ${empresa}.setores  `

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

            await conn.query(finalSql, valueQuery, (err: any, result: ISetor[]) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }

    async findByDescription(empresa: string, query: Partial<query>): Promise<ISetor[]> {


        let {
            codigo,
            descricao,
            limit,
            id,
            ativo
        } = query;

        let baseSql = `
                SELECT
                    *,
                    DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                    DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro  
                FROM  ${empresa}.setores
            `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (!limit || isNaN(limit)) {
            limit = 20;
        }

        if (codigo) {
            conditions.push(" codigo = ? "); // Placeholder (?) para o parâmetro
            params.push(codigo);          // Adiciona o valor ao array de parâmetros
        }
        if (id) {
            conditions.push(" id = ? "); // Placeholder (?) para o parâmetro
            params.push(id);          // Adiciona o valor ao array de parâmetros
        }
        if (ativo) {
            conditions.push(" ativo = ? "); // Placeholder (?) para o parâmetro
            params.push(ativo);          // Adiciona o valor ao array de parâmetros
        }


        if (descricao) {
            conditions.push(" descricao LIKE ? ");
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

        try {

            return new Promise<ISetor[]>(async (resolve, reject) => {
                await conn.query(finalSql, params, (err: any, result: ISetor[]) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result)

                    }
                })

            })


        } catch (err) {
            console.error("Erro ao executar a query:", err);
            throw new Error("Falha ao buscar setorres no banco de dados.");
            // Ou `reject(err)` se estivesse dentro do `new Promise` original, mas com async/await é melhor lançar.
        }
    }

    async findByCode(empresa: any, codigo: number): Promise<ISetor[]> {
        return new Promise<ISetor[]>(async (resolve, reject) => {

            let sql = ` select 
            *,
            coalesce( DATE_FORMAT(data_cadastro, '%Y-%m-%d') , '0000-00-00') AS data_cadastro,
           coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro   
            from ${empresa}.setores where codigo = ? and ativo = 'S';`



            await conn.query(sql, codigo, (err: any, result: ISetor[]) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }

}