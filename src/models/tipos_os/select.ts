import { conn } from "../../database/databaseConfig";
import { tipo_os } from "../../types/tipo_os/type-tipo-os";

export class SelectTipo_os {


    async buscaGeral(empresa: any, data_recadastro?: string): Promise<tipo_os[]> {
        let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro  from ${empresa}.tipos_os  `;

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
        return result as tipo_os[];
    }

    async buscaPorCodigo(empresa: any, codigo: number): Promise<tipo_os[]> {
        let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro  from ${empresa}.tipos_os 
            where codigo = ?
            `;
        
        const [result] = await conn.query(sql, [codigo]);
        return result as tipo_os[];
    }

    async novaBusca(empresa: string, query: any): Promise<tipo_os[]> {
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
            conditions.push("codigo = ?");
            params.push(codigo);
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

        let limitQuery = " LIMIT ? ";
        params.push(Number(limit));

        const finalSql = baseSql + whereClause + limitQuery;

        const [result] = await conn.query(finalSql, params);
        return result as tipo_os[];
    }

}
