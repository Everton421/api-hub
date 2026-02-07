import { conn } from "../../database/databaseConfig"
import { ILocal } from "../../types/locais/type-local"


type query = {
    codigo: number,
    id: string,
    descricao: string,
    limit: number,
    ativo: 'S' | 'N'
    setor: number
}

export class SelectLocais {


    async busca_por_descricao(empresa: string, descricao: string, limit: number): Promise<ILocal[]> {

        return new Promise(async (resolve, reject) => {

            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.locais 
               WHERE descricao like ? `
            let param = [`%${descricao}%`, limit]

            await conn.query(sql, param, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async busca_por_codigo(empresa: string, codigo: number, limit: number): Promise<ILocal[]> {

        return new Promise(async (resolve, reject) => {

            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.locais 
               WHERE codigo = ?
               limit ?
               `
            let param = [codigo, limit]

            await conn.query(sql, param, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async buscaPorId(empresa: string, id: number, limit: number): Promise<ILocal[]> {

        return new Promise(async (resolve, reject) => {

            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.locais 
               WHERE id = ?
               limit ? 
               `

            let param = [id, limit]

            await conn.query(sql, param, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }


    async busca_geral(empresa: string, limit: number, data_recadastro: string): Promise<ILocal[]> {

        return new Promise(async (resolve, reject) => {

            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.locais   
              
             `

            let paramQuery = [];
            let valueQuery = [];

            if (data_recadastro) {
                paramQuery.push(' WHERE data_recadastro >  ? ')
                valueQuery.push(data_recadastro);
            }
            if (limit && limit > 0) {
                paramQuery.push(' LIMIT ? ')
                valueQuery.push(limit);
            }

            let finalSql = sql;
            if (paramQuery.length > 0) {
                finalSql = sql + paramQuery;
            }

            await conn.query(finalSql, valueQuery, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }



    async novaBusca(empresa: string, query: Partial<query>): Promise<ILocal[]> {

        let {
            codigo,
            id,
            descricao,
            limit,
            ativo,
            setor
        } = query;


        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.locais 
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
        if (setor) {
            conditions.push("setor = ?");
            params.push(setor);
        }
        if (id) {
            conditions.push("id = ?");
            params.push(Number(id));
        }

        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
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

            return new Promise<ILocal[]>(async (resolve, reject) => {
                await conn.query(finalSql, params, (err: any, result: ILocal[]) => {
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
            throw new Error("Falha ao buscar locais no banco de dados.");
            // Ou `reject(err)` se estivesse dentro do `new Promise` original, mas com async/await é melhor lançar.
        }
    }



}