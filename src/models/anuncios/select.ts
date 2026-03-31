import { conn } from "../../database/databaseConfig";
import { typeAnuncios } from "../../types/anuncios/type-anuncio";

export type queryAnuncio = {
    id?: number
    link?: string
    codigo_produto?: number
    integration_id?: string
    plataforma?: string
    descricao?: string
    titulo?: string
    num_fabricante?: string
    ativo?: 'S' | 'N'
    sku_externo?: string
    id_externo?: string
    limit?: number
}



export class SelectAnuncios {

    async findAll(empresa: string, data_recadastro?: string, limit?: number): Promise<typeAnuncios[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.anuncios `;

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
        return result as typeAnuncios[];
    }

    async findById(empresa: string, id: number): Promise<typeAnuncios[]> {
        let sqlAnuncios = ` SELECT an.*,
            DATE_FORMAT(an.data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(an.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.anuncios an
         where an.id = ? 
         `;

        const params = [id];
        const [result] = await conn.query(sqlAnuncios, params);
        return result as typeAnuncios[];
    }

    async findByParams(empresa: string, query: queryAnuncio): Promise<typeAnuncios[]> {
        let {
            id,
            codigo_produto,
            integration_id,
            plataforma,
            descricao,
            titulo,
            num_fabricante,
            sku_externo,
            id_externo,
            ativo,
            limit
        } = query;


        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.anuncios 
        `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (id) {
            conditions.push("id = ?");
            params.push(id);
        }

        if (codigo_produto) {
            conditions.push("codigo_produto = ?");
            params.push(codigo_produto);
        }

        if (integration_id) {
            conditions.push("integration_id = ?");
            params.push(integration_id);
        }

        if (plataforma) {
            conditions.push("plataforma = ?");
            params.push(plataforma);
        }

        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }

        if (id_externo) {
            conditions.push("id_externo = ?");
            params.push(id_externo);
        }

        if (descricao) {
            conditions.push("descricao LIKE ?");
            params.push(`%${descricao}%`);
        }

        if (titulo) {
            conditions.push("titulo LIKE ?");
            params.push(`%${titulo}%`);
        }

        if (sku_externo) {
            conditions.push("sku_externo LIKE ?");
            params.push(`%${sku_externo}%`);
        }

        if (num_fabricante) {
            conditions.push("num_fabricante LIKE ?");
            params.push(`%${num_fabricante}%`);
        }

        if (conditions.length > 0) {
            baseSql += " WHERE " + conditions.join(" AND ");
        }

        const limitValue = (limit && Number(limit) > 0) ? Number(limit) : 20;
        baseSql += " LIMIT ?";
        params.push(limitValue);

        const [result] = await conn.query(baseSql, params);
        return result as typeAnuncios[];
    }

}
