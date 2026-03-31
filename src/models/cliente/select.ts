import { conn } from "../../database/databaseConfig";
import { Cliente } from "./interface_cliente";


export class Select_clientes {

    async buscaGeral(empresa: any, vendedor?: any, data_recadastro?: string): Promise<Cliente[]> {
        let sql = ` select *,
              DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
              DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
              from ${empresa}.clientes c
              WHERE c.ativo = 'S'   
                        `;

        let paramVendedor = '';
        let paramQuery: string[] = [];
        let valueQuery: any[] = [];

        if (vendedor && vendedor !== undefined) {
            paramVendedor = ' and  ( c.vendedor =  ? OR c.vendedor = 0 or c.vendedor = null)';
            valueQuery.push(vendedor);
        }


        if (data_recadastro) {
            paramQuery.push(' AND data_recadastro >  ? ');
            valueQuery.push(data_recadastro);
        }

        let finalSql = sql;

        if (paramQuery.length > 0) {
            finalSql = sql + paramVendedor + paramQuery.join('');
        }

        const [result] = await conn.query(finalSql, valueQuery);
        return result as Cliente[];
    }

    async buscaPorVendedor(empresa: any, vendedor: number): Promise<Cliente[]> {
        let sql = ` SELECT *,
               DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
              DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
             FROM ${empresa}.clientes WHERE vendedor = ?  `;
        
        const [result] = await conn.query(sql, [vendedor]);
        return result as Cliente[];
    }

    async buscaPorcodigo(empresa: any, codigo: number): Promise<Cliente[]> {
        let sql = ` SELECT   *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
              DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
          FROM ${empresa}.clientes WHERE codigo = ?  `;
        
        const [result] = await conn.query(sql, [codigo]);
        return result as Cliente[];
    }

    async buscaPorCnpj(empresa: any, cnpj: any): Promise<Cliente[]> {
        let sql = ` SELECT  *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        FROM ${empresa}.clientes WHERE cnpj = ?  `;
        
        const [result] = await conn.query(sql, [cnpj]);
        return result as Cliente[];
    }

    async buscaUltimoIdInserido(empresa: any): Promise<{ codigo: number }> {
        let sql = ` SELECT MAX(codigo) as codigo FROM ${empresa}.clientes `;
        const [result] = await conn.query(sql);
        return (result as any)[0];
    }

    async buscaPorCodigoOuDescricaoOuCnpj(empresa: any, param: string): Promise<Cliente[]> {
        let parametro = `%${param}%`;
        let sql = ` SELECT  *,
              DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
            FROM ${empresa}.clientes   where nome like ? or codigo like ? or cnpj like ? limit 50`;
        
        const [result] = await conn.query(sql, [parametro, parametro, parametro]);
        return result as Cliente[];
    }



    async novaBusca(empresa: any, query: any): Promise<Cliente[]> {
        let { nome, cnpj, codigo, limit, ativo } = query;

        let baseSql = ` select *,
                  DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                  DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
                  from ${empresa}.clientes  
                  `;


        const conditions: string[] = [];
        const params: any[] = [];

        if (!limit || isNaN(limit)) {
            limit = 20;
        }


        if (codigo) {
            conditions.push("codigo = ?");
            params.push(Number(codigo));
        }

        if (cnpj) {
            conditions.push("cnpj = ?");
            params.push(cnpj);
        }

        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }

        if (nome) {
            conditions.push("nome LIKE ?");
            params.push(`%${nome}%`);
        }

        let whereClause = "";

        if (conditions.length > 0) {
            whereClause = " WHERE " + conditions.join(" AND ");
        }


        let limitQuery = " LIMIT ? ";



        params.push(Number(limit));

        const finalSql = baseSql + whereClause + limitQuery;

        const [result] = await conn.query(finalSql, params);
        return result as Cliente[];
    }

}
