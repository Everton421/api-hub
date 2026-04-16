import { conn } from "../../database/databaseConfig.ts";
import { type ServiceType } from "./types/service-type.ts";

export class SelectService {
    async findAll(dbName: string, dataRecadastro?: string, limit?:number): Promise<ServiceType[]> {
        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.servicos`;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ?';
            params.push(dataRecadastro);
        }
        if(limit){
            sql += '  LIMIT ? ';
            params.push(limit);

        }

        const [result] = await conn.query(sql, params);
        return result as ServiceType[];
    }

    async findByCode(dbName: string, code: number): Promise<ServiceType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.servicos
        WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as ServiceType[];
    }

    async findByCodeOrDescription(dbName: string, param: string): Promise<ServiceType[]> {
        const searchParam = `%${param}%`;

        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.servicos
        WHERE codigo LIKE ? OR aplicacao LIKE ?
        LIMIT 20`;

        const [result] = await conn.query(sql, [searchParam, searchParam]);
        return result as ServiceType[];
    }

    async findByParams(dbName: string, params: {
        codigo?: number;
        id?: string;
        aplicacao?: string;
        tipo?: number;
        ativo?: string;
        limit?: number;
    }): Promise<ServiceType[]> {
        const {
            codigo,
            id,
            aplicacao,
            tipo,
            ativo,
            limit = 20
        } = params;

        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.servicos`;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push("codigo = ?");
            values.push(codigo);
        }
        if (id) {
            conditions.push("id = ?");
            values.push(String(id));
        }
        if (tipo) {
            conditions.push("tipo_serv = ?");
            values.push(Number(tipo));
        }
        if (ativo) {
            conditions.push("ativo = ?");
            values.push(ativo);
        }
        if (aplicacao) {
            conditions.push("aplicacao LIKE ?");
            values.push(`%${aplicacao}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' LIMIT ?';
        values.push(Number(limit));

        const [result] = await conn.query(sql, values);
        return result as ServiceType[];
    }
}
