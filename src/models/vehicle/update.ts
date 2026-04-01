import { conn } from "../../database/databaseConfig.ts";
import { type VehicleType } from "./types/vehicle-type.ts";

export class UpdateVehicle {
    async update(dbName: string, vehicle: VehicleType): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.veiculos
            SET id = ?, cliente = ?, placa = ?, marca = ?, modelo = ?, ano = ?, cor = ?, combustivel = ?, data_cadastro = ?, data_recadastro = ?, ativo = ?
            WHERE codigo = ?`;

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
            vehicle.ativo,
            vehicle.codigo
        ];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}
