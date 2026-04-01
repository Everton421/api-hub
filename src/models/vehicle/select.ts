import { conn } from "../../database/databaseConfig.ts";
import { type VehicleType } from "./types/vehicle-type.ts";

export class SelectVehicle {
    async findAll(dbName: string, dataRecadastro?: string): Promise<VehicleType[]> {
        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.veiculos`;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ?';
            params.push(dataRecadastro);
        }

        const [result] = await conn.query(sql, params);
        return result as VehicleType[];
    }

    async findByClient(dbName: string, clientId: number): Promise<VehicleType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.veiculos
        WHERE cliente = ?`;

        const [result] = await conn.query(sql, [clientId]);
        return result as VehicleType[];
    }

    async findByCode(dbName: string, code: number): Promise<VehicleType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.veiculos
        WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as VehicleType[];
    }

    async findByParams(dbName: string, params: {
        codigo?: number;
        cliente?: number;
        id?: number;
        limit?: number;
        placa?: string;
        marca?: string;
        modelo?: string;
        ano?: string;
        ativo?: string;
    }): Promise<VehicleType[]> {
        const {
            codigo,
            cliente,
            id,
            limit = 20,
            placa,
            marca,
            modelo,
            ano,
            ativo
        } = params;

        let sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
        FROM ${dbName}.veiculos`;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push("codigo = ?");
            values.push(codigo);
        }
        if (id) {
            conditions.push("id = ?");
            values.push(Number(id));
        }
        if (cliente) {
            conditions.push("cliente = ?");
            values.push(Number(cliente));
        }
        if (ativo) {
            conditions.push("ativo = ?");
            values.push(ativo);
        }
        if (placa) {
            conditions.push("placa LIKE ?");
            values.push(`%${placa}%`);
        }
        if (marca) {
            conditions.push("marca LIKE ?");
            values.push(`%${marca}%`);
        }
        if (modelo) {
            conditions.push("modelo LIKE ?");
            values.push(`%${modelo}%`);
        }
        if (ano) {
            conditions.push("ano LIKE ?");
            values.push(`%${ano}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' LIMIT ?';
        values.push(Number(limit));

        const [result] = await conn.query(sql, values);
        return result as VehicleType[];
    }
}
