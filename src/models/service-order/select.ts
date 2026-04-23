import { conn } from "../../database/databaseConfig.ts";
import { type ServiceOrderType } from "./types/service-order-type.ts";

export class SelectServiceOrderType {
    async findAll(dbName: string, dataRecadastro?: string): Promise<ServiceOrderType[]> {
        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.tipos_os`;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ?';
            params.push(dataRecadastro);
        }

        const [result] = await conn.query(sql, params);
        return result as ServiceOrderType[];
    }

    async findByCode(dbName: string, code: number): Promise<ServiceOrderType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.tipos_os
        WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as ServiceOrderType[];
    }

    async findByParams(dbName: string, params: {
        codigo?: number;
        descricao?: string;
        id?: string;
        limit?: number;
        ativo?: string;
          search?:string;
        orderBy?: 'codigo' | 'descricao' | 'data_recadastro' | 'id'
    }): Promise<ServiceOrderType[]> {
        const {
            codigo,
            descricao,
            id,
            limit = 20,
            ativo,
            orderBy,
            search
        } = params;

        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.tipos_os`;

        const conditions: string[] = [];
        const values: any[] = [];

        if (ativo) {
            conditions.push("ativo = ?");
            values.push(ativo);
        }
        if (codigo) {
            conditions.push("codigo = ?");
            values.push(codigo);
        }
        if (id) {
            conditions.push("id = ?");
            values.push(Number(id));
        }
        if (descricao) {
            conditions.push("descricao LIKE ?");
            values.push(`%${descricao}%`);
        }
        if(search){
            conditions.push(" descricao LIKE ? OR id LIKE ? OR codigo LIKE  ?  ");
            values.push(`%${search}%`, `%${search}%`, `%${search}%` );
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
        return result as ServiceOrderType[];
    }
}
