import { conn } from "../../database/databaseConfig.ts";
import { type LocationType } from "./types/location-type.ts";

 
type LocationQuery = {
    codigo: number;
    id: string;
    descricao: string;
    limit: number;
    ativo: string;
    setor: number;
};

export class SelectLocation {
    async findAll(dbName: string, limit?: number, dataRecadastro?: string): Promise<LocationType[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.locais `;

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
        return result as LocationType[];
    }

    async findByCode(dbName: string, code: number): Promise<LocationType[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.locais 
           WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as LocationType[];
    }

    async findById(dbName: string, id: string, limit: number): Promise<LocationType[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.locais 
           WHERE id = ?
           LIMIT ? `;

        const [result] = await conn.query(sql, [id, limit]);
        return result as LocationType[];
    }

    async findByDescription(dbName: string, description: string, limit: number): Promise<LocationType[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.locais 
           WHERE descricao LIKE ? `;

        const [result] = await conn.query(sql, [`%${description}%`, limit]);
        return result as LocationType[];
    }

    async findByParams(dbName: string, params: Partial<LocationQuery>): Promise<LocationType[]> {
        const {
            codigo,
            id,
            descricao,
            limit = 20,
            ativo,
            setor
        } = params;

        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.locais `;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push("codigo = ?");
            values.push(codigo);
        }
        if (setor) {
            conditions.push("setor = ?");
            values.push(setor);
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
            values.push(`%${descricao}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' LIMIT ?';
        values.push(Number(limit));

        const [result] = await conn.query(sql, values);
        return result as LocationType[];
    }
}