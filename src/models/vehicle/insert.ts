import { conn } from "../../database/databaseConfig.ts";
import { type VehicleInsert } from "./types/vehicle-type.ts";

export class InsertVehicle {
    async insert(dbName: string, vehicle: VehicleInsert): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.veiculos
            (id, cliente, placa, marca, modelo, ano, cor, combustivel, data_cadastro, data_recadastro, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            vehicle.id,
            vehicle.cliente,
            vehicle.placa,
            vehicle.marca,
            vehicle.modelo,
            vehicle.ano,
            vehicle.cor,
            vehicle.combustivel,
            vehicle.data_cadastro,
            vehicle.data_recadastro,
            vehicle.ativo
        ];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
