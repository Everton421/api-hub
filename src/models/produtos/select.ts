import { conn } from "../../database/databaseConfig";
import { ProdutoBanco } from "../../types/produto/type-produto";


type queryProd = {
    codigo: number;
    marca: number;
    grupo: number;
    descricao: string;
}

export class Select_produtos {

    async buscaPorCodigo(empresa: any, codigo: number): Promise<ProdutoBanco[]> {
        let sql = `
         select 
            *,
                 DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
             CONVERT(observacoes1 USING utf8) as observacoes1,
             CONVERT(observacoes2 USING utf8) as observacoes2,
             CONVERT(observacoes3 USING utf8) as observacoes3
        from ${empresa}.produtos where codigo = ? `;
        
        const [result] = await conn.query(sql, [codigo]);
        return result as ProdutoBanco[];
    }

    async buscaPorCodigoDescricao(empresa: any, codigo: number, descricao: string): Promise<ProdutoBanco[]> {
        if (!codigo) codigo = 0;
        if (!descricao) descricao = '';

        const sql = `SELECT *, 
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
                  CONVERT(observacoes1 USING utf8) as observacoes1,
                  CONVERT(observacoes2 USING utf8) as observacoes2,
                  CONVERT(observacoes3 USING utf8) as observacoes3

            FROM ${empresa}.produtos 
            WHERE  codigo like ? OR descricao = ?  limit  20  `;
        
        const [result] = await conn.query(sql, [codigo, descricao]);
        return result as ProdutoBanco[];
    }

    async buscaPorCodigoOuDescricao(empresa: any, parametro: string): Promise<ProdutoBanco[]> {
        const sql = `SELECT *, 
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
                  CONVERT(observacoes1 USING utf8) as observacoes1,
                  CONVERT(observacoes2 USING utf8) as observacoes2,
                  CONVERT(observacoes3 USING utf8) as observacoes3

            FROM ${empresa}.produtos 
            WHERE  codigo like ? OR descricao = ?    `;
        
        const [result] = await conn.query(sql, [parametro, parametro]);
        return result as ProdutoBanco[];
    }

    async buscaPorCodigoOuDescricaoLimit(empresa: any, parametro: string): Promise<ProdutoBanco[]> {
        const sql = `SELECT *, 
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
                  CONVERT(observacoes1 USING utf8) as observacoes1,
                  CONVERT(observacoes2 USING utf8) as observacoes2,
                  CONVERT(observacoes3 USING utf8) as observacoes3

            FROM ${empresa}.produtos 
            WHERE  codigo like ? OR descricao like ?   limit 15 `;
        
        const [result] = await conn.query(sql, [parametro, parametro]);
        return result as ProdutoBanco[];
    }

    async buscaGeral(empresa: any, data_recadastro?: string): Promise<ProdutoBanco[]> {
        let sql = ` select 
        *,
        DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro, 
             CONVERT(observacoes1 USING utf8) as observacoes1,
             CONVERT(observacoes2 USING utf8) as observacoes2,
             CONVERT(observacoes3 USING utf8) as observacoes3
        from ${empresa}.produtos  `;

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
        return result as ProdutoBanco[];
    }

    async buscaUltimoCodigoInserido(empresa: any): Promise<{ codigo: number }> {
        let sql = ` select MAX(codigo) as codigo  from ${empresa}.produtos `;
        const [result] = await conn.query(sql);
        return (result as any)[0];
    }

    async novaBusca(empresa: string, query: any): Promise<ProdutoBanco[]> {
        let {
            codigo,
            marca,
            grupo,
            descricao,
            limit,
            ativo
        } = query;

        let baseSql = `
            SELECT
                *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro, 
            CONVERT(observacoes1 USING utf8) as observacoes1,
            CONVERT(observacoes2 USING utf8) as observacoes2,
            CONVERT(observacoes3 USING utf8) as observacoes3
            FROM  ${empresa}.produtos
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
        if (marca) {
            conditions.push("marca = ?");
            params.push(Number(marca));
        }

        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }

        if (grupo) {
            conditions.push("grupo = ?");
            params.push(Number(grupo));
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
        return result as ProdutoBanco[];
    }

}
