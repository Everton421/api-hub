import { conn } from "../../database/databaseConfig.ts";
import { type SupplierType } from "./types/supplier-type.ts";

export class SelectSupplier {
    async findAll(dbName: string, dataRecadastro?: string): Promise<SupplierType[]> {
        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.fornecedores
        WHERE ativo = 'S'`;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' AND data_recadastro > ?';
            params.push(dataRecadastro);
        }

        const [result] = await conn.query(sql, params);
        return result as SupplierType[];
    }

    async findByCode(dbName: string, code: number): Promise<SupplierType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.fornecedores
        WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as SupplierType[];
    }

    async findByCnpj(dbName: string, cnpj: string): Promise<SupplierType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.fornecedores
        WHERE cnpj = ?`;

        const [result] = await conn.query(sql, [cnpj]);
        return result as SupplierType[];
    }

    async findLastInsertedCode(dbName: string): Promise<{ codigo: number }> {
        const sql = `SELECT MAX(codigo) as codigo FROM ${dbName}.fornecedores`;
        const [result] = await conn.query(sql);
        return (result as any)[0];
    }

    async findByCodeOrNameOrCnpj(dbName: string, param: string): Promise<SupplierType[]> {
        const searchParam = `%${param}%`;
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.fornecedores
        WHERE nome LIKE ? OR codigo LIKE ? OR cnpj LIKE ?
        LIMIT 50`;

        const [result] = await conn.query(sql, [`%${param.toLowerCase()}%`, searchParam, searchParam]);
        return result as SupplierType[];
    }

    async findByParams(dbName: string, params: {
        nome?: string;
        cnpj?: string;
        codigo?: number;
        ativo?: string;
        id?: string;
        limit?: number;
        orderBy?: 'codigo' | 'nome' | 'id',
        search?: string
    }): Promise<SupplierType[]> {
        const { nome, cnpj, codigo, ativo, id, limit = 20, orderBy, search } = params;

        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.fornecedores`;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push("codigo = ?");
            values.push(Number(codigo));
        }
        if (cnpj) {
            conditions.push("cnpj = ?");
            values.push(cnpj);
        }
        if (ativo) {
            conditions.push("ativo = ?");
            values.push(ativo);
        }
        if (id) {
            conditions.push("id = ?");
            values.push(id);
        }
        if (nome) {
            conditions.push("nome LIKE ?");
            values.push(`%${nome.toLowerCase()}%`);
        }
        if (search) {
            conditions.push("   codigo LIKE ? OR nome LIKE ? OR cnpj = ? OR id = ? ");
            values.push(`%${search.toLowerCase()}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        if (orderBy) {
            sql += ` ORDER BY ${orderBy} `;
        }
        sql += ' LIMIT ?';
        values.push(Number(limit));
        const [result] = await conn.query(sql, values);
        return result as SupplierType[];
    }
}
