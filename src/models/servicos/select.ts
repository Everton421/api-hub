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

    async buscaPorCodigo(empresa: any, codigo: number): Promise<service[]> {
        let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        from ${empresa}.servicos where codigo = ? `;
        
        const [result] = await conn.query(sql, [codigo]);
        return result as service[];
    }

    async buscaPorCodigoDescricao(empresa: any, param: string): Promise<service[]> {
        let parametro = `%${param}%`;

        const sql = `SELECT *,
       DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
      DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    FROM ${empresa}.servicos
    WHERE  codigo like ? OR aplicacao like ?  limit  20  `;
        
        const [result] = await conn.query(sql, [parametro, parametro]);
        return result as service[];
    }


    async buscaGeral(empresa: any, data_recadastro?: string): Promise<service[]> {
        let sql = ` select *,
      DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    from ${empresa}.servicos  `;
        
        let paramQuery: string[] = [];
        let valueQuery: any[] = [];

        if (data_recadastro) {
            paramQuery.push(' WHERE data_recadastro >  ? ');
            valueQuery.push(data_recadastro);
        }
        
        let finalSql = sql;
        if (paramQuery.length > 0) {
            finalSql = sql + paramQuery.join('');
        }

        const [result] = await conn.query(finalSql, valueQuery);
        return result as service[];
    }


    async novaBusca(empresa: string, query: any): Promise<service[]> {
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
            conditions.push("codigo = ?");
            params.push(codigo);
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

        let limitQuery = " LIMIT ? ";
        params.push(Number(limit));

        const finalSql = baseSql + whereClause + limitQuery;

        const [result] = await conn.query(finalSql, params);
        return result as service[];
    }

}
