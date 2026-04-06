import { conn } from "../../database/databaseConfig.ts";
import { type typeAnuncios } from "../../types/anuncios/type-anuncio.ts";

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

    async findAll(empresa: string, dataRecadastro?: string, limit?: number): Promise<typeAnuncios[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.anuncios `;

        let params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ? ';
            params.push(dataRecadastro);
        }
        
        if (limit && limit > 0) {
            sql += ' LIMIT ? ';
            params.push(limit);
        }

        const [result] = await conn.query(sql, params);
        return result as typeAnuncios[];
    }

    async findById(empresa: string, id: number): Promise<typeAnuncios[]> {
        let sql = ` SELECT an.*,
            DATE_FORMAT(an.data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(an.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.anuncios an
         where an.id = ? 
         `;

        const [result] = await conn.query(sql, [id]);
        return result as typeAnuncios[];
    }

    async findByParams(empresa: string, query: queryAnuncio): Promise<typeAnuncios[]> {
        const {
            id,
            codigo_produto,
            plataforma,
            ativo,
            id_externo,
            descricao,
            titulo,
            sku_externo,
            num_fabricante,
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