import { conn } from "../../database/databaseConfig.ts";

export type category = 
{
  codigo:number,
  descricao:string,
  id:number,
  data_cadastro:string,
  data_recadastro:string,
  ativo:string
 }

export class SelectCategories {

     async findAllByLastUpdate(empresa: string, limit?: number, data_recadastro?: string): Promise<category[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.categorias  `;

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
        return result as category[];
    }


    async findByDescription(empresa: string, descricao: string, limit: number): Promise<category[]> {
        let sql = ` SELECT *,
           DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
           DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${empresa}.categorias 
          WHERE descricao like ?  OR codigo like ?
          limit   ?
          `;
        const params = [`%${descricao}%`, `%${descricao}%`, limit];

        const [result] = await conn.query(sql, params);
        return result as category[];
    }

    async findByCode(empresa: string, codigo: number, limit: number): Promise<category[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.categorias
        where codigo = ? limit ?
         `;
        const params = [codigo, limit];
        
        const [result] = await conn.query(sql, params);
        return result as category[];
    }

    async findById(empresa: string, id: number, limit: number): Promise<category[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.categorias
        where id = ? 
        limit   ? 
         `;
        const params = [id, limit];
        
        const [result] = await conn.query(sql, params);
        return result as category[];
    }

    async findByParam(empresa: string, query: any): Promise<category[]> {
        let {
            codigo,
            id,
            descricao,
            ativo,
            limit
        } = query;


        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.categorias 
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
        return result as category[];
    }

}
