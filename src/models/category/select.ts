import { conn } from "../../database/databaseConfig.ts";
import { type CategoryType } from "./types/category-type.ts";

export class SelectCategory {
    async findAll(dbName: string, limit?: number, lastUpdate?: string): Promise<CategoryType[]> {
        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.categorias`;

        const params: any[] = [];

        if (lastUpdate) {
            sql += ' WHERE data_recadastro > ?';
            params.push(lastUpdate);
        }
        if (limit && limit > 0) {
            sql += ' LIMIT ?';
            params.push(limit);
        }

        const [result] = await conn.query(sql, params);
        return result as CategoryType[];
    }

    async findByDescription(dbName: string, description: string, limit: number): Promise<CategoryType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.categorias 
        WHERE descricao LIKE ? OR codigo LIKE ?
        LIMIT ?`;

        const [result] = await conn.query(sql, [`%${description.toLowerCase()}%`, `%${description.toLowerCase()}%`, limit]);
        return result as CategoryType[];
    }

    async findByCode(dbName: string, code: number, limit: number): Promise<CategoryType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.categorias
        WHERE codigo = ?
        LIMIT ?`;

        const [result] = await conn.query(sql, [code, limit]);
        return result as CategoryType[];
    }

    async findById(dbName: string, id: string, limit: number): Promise<CategoryType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.categorias
        WHERE id = ?
        LIMIT ?`;

        const [result] = await conn.query(sql, [id, limit]);
        return result as CategoryType[];
    }

    async findByParams(dbName: string, params: {
        codigo?: number;
        id?: string;
        descricao?: string;
        ativo?: string;
        limit?: number;
        search?:string
        orderBy?: 'codigo' | 'id' | 'descricao' |  'data_recadastro'
    }): Promise<CategoryType[]> {
        const { codigo, id, descricao, ativo, limit = 20 ,search, orderBy} = params;

        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.categorias`;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push(" codigo = ? ");
            values.push(codigo);
        }
        if (id) {
            conditions.push(" id = ? ");
            values.push(Number(id));
        }
        if (ativo) {
            conditions.push(" ativo = ? ");
            values.push(ativo);
        }
        if (descricao) {
            conditions.push(" descricao LIKE ? ");
            values.push(`%${descricao.toLowerCase()}%`);
        }

        if(search){
            conditions.push(" descricao LIKE ? OR id LIKE ? OR codigo LIKE ?  ");
            values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%` );
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        if(orderBy){
            sql+= ` ORDER BY ${orderBy} `
        }
        sql += ' LIMIT ?';
        values.push(Number(limit));
        const [result] = await conn.query(sql, values);

        return result as CategoryType[];
    }

    async findLastInsertedCode(dbName: string): Promise<{ codigo: number }> {
        const sql = `SELECT MAX(codigo) as codigo FROM ${dbName}.categorias`;
        const [result] = await conn.query(sql);
        return (result as any)[0];
    }
}
