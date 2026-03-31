import { conn } from "../../database/databaseConfig";
import { formaPagamentoBanco, queryFpgt } from "../../types/formas_pagamento/type-formas-pagamento";



export class SelectForma_pagamento {


    async buscaGeral(empresa: any, data_recadastro?: string): Promise<formaPagamentoBanco[]> {
        let sql = ` select *,
     DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    from ${empresa}.forma_pagamento  `;


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
        return result as formaPagamentoBanco[];
    }


    async novaBusca(empresa: string, query: Partial<queryFpgt>): Promise<formaPagamentoBanco[]> {
        let {
            codigo,
            id,
            limit,
            descricao,
            parcelas,
            ativo,
        } = query;

        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.forma_pagamento 
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

        if (parcelas) {
            conditions.push("parcelas = ?");
            params.push(Number(parcelas));
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
        return result as formaPagamentoBanco[];
    }


}
