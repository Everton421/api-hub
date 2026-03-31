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

    async findAll(empresa: any, data_recadastro?: string): Promise<ISetor[]> {
        let sql = ` select 
            *,
            coalesce( DATE_FORMAT(data_cadastro, '%Y-%m-%d') , '0000-00-00') AS data_cadastro,
           coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro   
            from ${empresa}.setores  `;

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
        return result as ISetor[];
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
            conditions.push(" codigo = ? ");
            params.push(codigo);
        }
        if (id) {
            conditions.push(" id = ? ");
            params.push(id);
        }
        if (ativo) {
            conditions.push(" ativo = ? ");
            params.push(ativo);
        }


        if (descricao) {
            conditions.push(" descricao LIKE ? ");
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
        return result as ISetor[];
    }

    async findByCode(empresa: any, codigo: number): Promise<ISetor[]> {
        let sql = ` select 
            *,
            coalesce( DATE_FORMAT(data_cadastro, '%Y-%m-%d') , '0000-00-00') AS data_cadastro,
           coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro   
            from ${empresa}.setores where codigo = ? and ativo = 'S';`;


        const [result] = await conn.query(sql, [codigo]);
        return result as ISetor[];
    }

}
