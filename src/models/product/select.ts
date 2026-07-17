import { conn } from "../../database/databaseConfig.ts";
import { type ProductType } from "./types/product-type.ts";

export class SelectProduct {
    async findByCode(dbName: string, code: number): Promise<ProductType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes1 USING utf8) as observacoes1,
            CONVERT(observacoes2 USING utf8) as observacoes2,
            CONVERT(observacoes3 USING utf8) as observacoes3
        FROM ${dbName}.produtos
        WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as ProductType[];
    }

    async findByCodeAndDescription(dbName: string, code: number, descricao: string): Promise<ProductType[]> {
        if (!code) code = 0;
        if (!descricao) descricao = '';

        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes1 USING utf8) as observacoes1,
            CONVERT(observacoes2 USING utf8) as observacoes2,
            CONVERT(observacoes3 USING utf8) as observacoes3
        FROM ${dbName}.produtos
        WHERE codigo LIKE ? OR descricao = ?
        LIMIT 20`;

        const [result] = await conn.query(sql, [code, descricao]);
        return result as ProductType[];
    }

    async findByCodeOrDescription(dbName: string, param: string): Promise<ProductType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes1 USING utf8) as observacoes1,
            CONVERT(observacoes2 USING utf8) as observacoes2,
            CONVERT(observacoes3 USING utf8) as observacoes3
        FROM ${dbName}.produtos
        WHERE codigo LIKE ? OR descricao = ?`;

        const [result] = await conn.query(sql, [param, param]);
        return result as ProductType[];
    }

    async findByCodeOrDescriptionWithLimit(dbName: string, param: string): Promise<ProductType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes1 USING utf8) as observacoes1,
            CONVERT(observacoes2 USING utf8) as observacoes2,
            CONVERT(observacoes3 USING utf8) as observacoes3
        FROM ${dbName}.produtos
        WHERE codigo LIKE ? OR descricao LIKE ?
        LIMIT 15`;

        const [result] = await conn.query(sql, [param, param]);
        return result as ProductType[];
    }

    async findAll(dbName: string, dataRecadastro?: string, limit?:number): Promise<ProductType[]> {
        let sql = `SELECT 
                *,
             COALESCE(caracteristica, 0 ) AS caracteristica,   
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes1 USING utf8) as observacoes1,
            CONVERT(observacoes2 USING utf8) as observacoes2,
            CONVERT(observacoes3 USING utf8) as observacoes3
        FROM ${dbName}.produtos`;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ?';
            params.push(dataRecadastro);
        }
        if(limit){
            sql += '  limit   ?';
            params.push(limit);
            
        }

        const [result] = await conn.query(sql, params);
        return result as ProductType[];
    }

    async findLastInsertedCode(dbName: string): Promise<{ codigo: number }> {
        const sql = `SELECT MAX(codigo) as codigo FROM ${dbName}.produtos`;
        const [result] = await conn.query(sql);
        return (result as any)[0];
    }

    async findByParams(dbName: string, params: {
        codigo?: number;
        id?:string;
        marca?: number;
        grupo?: number;
        descricao?: string;
        limit?: number;
        ativo?: string;
        search?:string;
        num_fabricante?:string,
        num_original?:string,
        sku?:string,
        orderBy?:'codigo' | 'descricao' | 'id'
    }): Promise<ProductType[]> {
        const {
            codigo,
            marca,
            grupo,
            descricao,
            id,
            limit = 20,
            ativo,
            search,
            orderBy,
            num_fabricante,
            num_original,
            sku
        } = params;

        let sql = `SELECT *,
         COALESCE(caracteristica, 0) AS caracteristica,
            COALESCE(origem, '') AS origem,
            COALESCE(class_fiscal, '') AS class_fiscal,
            COALESCE(cst, '') AS cst,
            COALESCE(sku, '') AS sku,
            COALESCE(num_fabricante, '') AS num_fabricante,
            COALESCE(num_original, '') AS num_original,
            COALESCE(unidade_medida, 'UND') AS unidade_medida,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes1 USING utf8) as observacoes1,
            CONVERT(observacoes2 USING utf8) as observacoes2,
            CONVERT(observacoes3 USING utf8) as observacoes3
        FROM ${dbName}.produtos`;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push("codigo = ?");
            values.push(codigo);
        }
        if (marca) {
            conditions.push("marca = ?");
            values.push(Number(marca));
        }
        if (ativo) {
            conditions.push("ativo = ?");
            values.push(ativo);
        }
        if (grupo) {
            conditions.push("grupo = ?");
            values.push(Number(grupo));
        }
        if (descricao) {
            conditions.push("descricao LIKE ?");
            values.push(`%${descricao.toLowerCase()}%`);
        }
        if( id ){
            conditions.push("id = ?");
            values.push(id);
        }

            if(num_fabricante){
               conditions.push(" num_fabricante = ?");
              values.push(num_fabricante);
            } 
            if(num_original){
                 conditions.push(" num_original = ?");
                 values.push(num_original);
            } 
            if(sku){
                  conditions.push(" sku = ?");
                 values.push(sku);
            }

        if( search ){
                const terms = search.trim().split(/\s+/).filter(t => t.length > 0);
        if (terms.length > 0) {
            const termConditions = terms.map(() =>
            '( codigo LIKE ? OR descricao LIKE ? OR id LIKE ?)'
            );
            conditions.push(`(${termConditions.join(' AND ')})`);
            terms.forEach(term => {
            values.push(`%${term}%`, `%${term.toLowerCase()}%`, `%${term}%`);
            });
      }
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        if(orderBy){
            sql += ` ORDER BY ${orderBy} `;
        }
        sql += ' LIMIT ?';
        values.push(Number(limit));
        const [result] = await conn.query(sql, values);
        return result as ProductType[];
    }

        /**
         *  Consulta codigo [ OU ] id do prduto,  
         * @param dbName 
         * @param params 
         * @returns 
         */
    async searchProductByUniqueParams(dbName: string, params: {
        code?: number, id?:string
    }){
        const { code, id } = params;
         let sql = `SELECT  codigo, id FROM ${dbName}.produtos`
         
         const fields=[];
         const values=[];
         if(code != undefined){
            fields.push( ' codigo = ? ');
            values.push(code)
         }

         if(id != undefined){
            fields.push( ' id = ? ');
            values.push(id)
         }

         if(fields.length > 0 ){
            sql += ' WHERE '+ fields.join(' OR ');
         }

        const [result] = await conn.query(sql, values);
         return result as { codigo:number , id:string }[]

    }
}
