import { conn } from "../../database/databaseConfig.ts";
import { type VehicleType } from "./types/vehicle-type.ts";

export class InsertVehicle {
    async insert(dbName: string, vehicle: VehicleType): Promise<{ insertId: number }> {
        const columns = ['id', 'cliente', 'placa', 'marca', 'modelo', 'ano', 'cor', 'combustivel', 'data_cadastro', 'data_recadastro', 'ativo'];
        const values = [vehicle.id, vehicle.cliente, vehicle.placa, vehicle.marca, vehicle.modelo, vehicle.ano, vehicle.cor, vehicle.combustivel, vehicle.data_cadastro, vehicle.data_recadastro, vehicle.ativo];

        if (vehicle.codigo != null) {
            columns.unshift('codigo');
            values.unshift(vehicle.codigo);
        }

        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${dbName}.veiculos (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
