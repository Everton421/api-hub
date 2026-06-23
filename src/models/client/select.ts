import { conn } from "../../database/databaseConfig.ts";
import { type ClientType } from "./types/client-type.ts";

export class SelectClient {
    async findAll(dbName: string, vendedor?: number, dataRecadastro?: string): Promise<ClientType[]> {
        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.clientes
        WHERE ativo = 'S'`;

        const params: any[] = [];

        if (vendedor !== undefined) {
            sql += ' AND (vendedor = ? OR vendedor = 0 OR vendedor IS NULL)';
            params.push(vendedor);
        }

        if (dataRecadastro) {
            sql += ' AND data_recadastro > ?';
            params.push(dataRecadastro);
        }

        const [result] = await conn.query(sql, params);
        return result as ClientType[];
    }

    async findBySeller(dbName: string, sellerId: number): Promise<ClientType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.clientes
        WHERE vendedor = ?`;

        const [result] = await conn.query(sql, [sellerId]);
        return result as ClientType[];
    }

    async findByCode(dbName: string, code: number): Promise<ClientType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.clientes
        WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as ClientType[];
    }

    async findByCnpj(dbName: string, cnpj: string): Promise<ClientType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.clientes
        WHERE cnpj = ?`;

        const [result] = await conn.query(sql, [cnpj]);
        return result as ClientType[];
    }

    async findLastInsertedCode(dbName: string): Promise<{ codigo: number }> {
        const sql = `SELECT MAX(codigo) as codigo FROM ${dbName}.clientes`;
        const [result] = await conn.query(sql);
        return (result as any)[0];
    }

    async findByCodeOrNameOrCnpj(dbName: string, param: string): Promise<ClientType[]> {
        const searchParam = `%${param}%`;
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.clientes
        WHERE nome LIKE ? OR codigo LIKE ? OR cnpj LIKE ?
        LIMIT 50`;

        const [result] = await conn.query(sql, [searchParam, searchParam, searchParam]);
        return result as ClientType[];
    }

    async findByParams(dbName: string, params: {
        nome?: string;
        cnpj?: string;
        codigo?: number;
        ativo?: string;
        id?: string;
        limit?: number;
        orderBy?: 'codigo' | 'nome' | 'id',
        search?:string
    }): Promise<ClientType[]> {
        const { nome, cnpj, codigo, ativo, id, limit = 20, orderBy, search } = params;

        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.clientes`;

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
        if(id){
            conditions.push("id = ?");
            values.push(id);
        
        }
        if (nome) {
            conditions.push("nome LIKE ?");
            values.push(`%${nome.toLowerCase()}%`);
        }
      
        if( search ){
           conditions.push("   codigo LIKE ? OR nome LIKE ? OR cnpj = ? OR id = ? ");
            values.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%` , `%${search.toLowerCase()}%` , `%${search.toLowerCase()}%`);
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
        return result as ClientType[];
    }
}
