import { conn } from "../../database/databaseConfig";
import { marca } from "../../types/marcaProduto/type-marca";


export class Select_Marcas {


    async busca_por_descricao(empresa: string, descricao: string, limit: number): Promise<marca[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.marcas 
           WHERE descricao like ? `;
        
        let param = [`%${descricao}%`, limit];
        const [result] = await conn.query(sql, param);
        return result as marca[];
    }

    async busca_por_codigo(empresa: string, codigo: number, limit: number): Promise<marca[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.marcas 
           WHERE codigo = ?
           limit ?
           `;
        
        let param = [codigo, limit];
        const [result] = await conn.query(sql, param);
        return result as marca[];
    }

    async buscaPorId(empresa: string, id: number, limit: number): Promise<marca[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.marcas 
           WHERE id = ?
           limit ? 
           `;

        let param = [id, limit];
        const [result] = await conn.query(sql, param);
        return result as marca[];
    }


    async busca_geral(empresa: string, limit?: number, data_recadastro?: string): Promise<marca[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.marcas   
          
         `;

        let paramQuery: string[] = [];
        let valueQuery: any[] = [];

        if (data_recadastro) {
            paramQuery.push(' WHERE data_recadastro >  ? ');
            valueQuery.push(data_recadastro);
        }
        if (limit && limit > 0) {
            paramQuery.push(' LIMIT ? ');
            valueQuery.push(limit);
        }

        let finalSql = sql;
        if (paramQuery.length > 0) {
            finalSql = sql + paramQuery.join('');
        }

        const [result] = await conn.query(finalSql, valueQuery);
        return result as marca[];
    }



    async novaBusca(empresa: string, query: any): Promise<marca[]> {
        let {
            codigo,
            id,
            descricao,
            limit,
            ativo
        } = query;


        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.marcas 
        `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (!limit || isNaN(limit)) {
            limit = 20;
        }

        if (codigo) {
            conditions.push("codigo = ?");
            params.push(codigo);
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

        let limitQuery = " LIMIT ? ";
        params.push(Number(limit));

        const finalSql = baseSql + whereClause + limitQuery;

        const [result] = await conn.query(finalSql, params);
        return result as marca[];
    }

}
