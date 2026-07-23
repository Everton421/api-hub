import { conn } from "../../database/databaseConfig.ts";
import { type BrandType } from "./types/brand-type.ts";

type BrandQuery = {
    codigo: number;
    id: string;
    descricao: string;
    limit: number;
    ativo: string;
    search:string
    orderBy: 'codigo' | 'id' | 'descricao' |  'data_recadastro'
};

export class SelectBrand {
    async findAll(dbName: string, limit?: number, dataRecadastro?: string): Promise<BrandType[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.marcas `;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ?';
            params.push(dataRecadastro);
        }

        if (limit && limit > 0) {
            sql += ' LIMIT ?';
            params.push(limit);
        }

        const [result] = await conn.query(sql, params);
        return result as BrandType[];
    }

    async findByCode(dbName: string, code: number): Promise<BrandType[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.marcas 
           WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as BrandType[];
    }

    async findById(dbName: string, id: string, limit: number): Promise<BrandType[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.marcas 
           WHERE id = ?
           LIMIT ? `;

        const [result] = await conn.query(sql, [id, limit]);
        return result as BrandType[];
    }

    async findByDescription(dbName: string, description: string, limit: number): Promise<BrandType[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.marcas 
           WHERE descricao LIKE ? limit ?  `;

        const [result] = await conn.query(sql, [`%${description.toLowerCase()}%`, limit]);
        return result as BrandType[];
    }

    async findByParams(dbName: string, params: Partial<BrandQuery>): Promise<BrandType[]> {
        const {
            codigo,
            id,
            descricao,
            limit = 20,
            ativo,
            orderBy,
            search
        } = params;

        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.marcas `;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push("codigo = ?");
            values.push(codigo);
        }
        if (id) {
            conditions.push("id = ?");
            values.push( id );
        }
        if (ativo) {
            conditions.push("ativo = ?");
            values.push(ativo);
        }
        if (descricao) {
            conditions.push("descricao LIKE ?");
            values.push(`%${descricao.toLowerCase()}%`);
        }
        if(search){
            conditions.push(" descricao LIKE ? OR id LIKE ? OR codigo LIKE  ?  ");
            values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%` );
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ') ;
        }
   if(orderBy){
            sql+= ` ORDER BY ${orderBy} `
        }
        sql += ' LIMIT ?';
        values.push(Number(limit));

        const [result] = await conn.query(sql, values);
        return result as BrandType[];
    }

    async findLastInsertedCode(dbName: string): Promise<{ codigo: number }> {
        const sql = `SELECT MAX(codigo) as codigo FROM ${dbName}.marcas`;
        const [result] = await conn.query(sql);
        return (result as any)[0];
    }
}