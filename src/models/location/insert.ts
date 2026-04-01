import { conn } from "../../database/databaseConfig.ts";
import { type LocationType } from "./types/location-type.ts";

 
type LocationWithoutCode = Omit<LocationType, 'codigo'>;

export class InsertLocation {
    async insert(dbName: string, location: LocationWithoutCode): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.locais (id, descricao, setor, data_cadastro, data_recadastro, ativo)
                      VALUES (?, ?, ?, ?, ?, ?)`;

        const values = [
            location.id,
            location.descricao,
            location.setor,
            location.data_cadastro,
            location.data_recadastro,
            location.ativo
        ];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}