import { conn } from "../../database/databaseConfig.ts";
import { type LocationType } from "./types/location-type.ts";

 
type LocationUpdate = Partial<Omit<LocationType, 'codigo'>> & { codigo: number };

export class UpdateLocation {
    async update(dbName: string, location: LocationUpdate): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (location.id !== undefined) {
            fields.push("id = ?");
            values.push(location.id);
        }
        if (location.descricao !== undefined) {
            fields.push("descricao = ?");
            values.push(location.descricao);
        }
        if (location.setor !== undefined) {
            fields.push("setor = ?");
            values.push(location.setor);
        }
        if (location.data_cadastro !== undefined) {
            fields.push("data_cadastro = ?");
            values.push(location.data_cadastro);
        }
        if (location.data_recadastro !== undefined) {
            fields.push("data_recadastro = ?");
            values.push(location.data_recadastro);
        }
        if (location.ativo !== undefined) {
            fields.push("ativo = ?");
            values.push(location.ativo);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        values.push(location.codigo);

        const sql = `UPDATE ${dbName}.locais SET ${fields.join(', ')} WHERE codigo = ?`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }

    async updateByCondition(dbName: string, location: Partial<LocationUpdate>, condition: Partial<LocationUpdate>): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (location.id !== undefined) {
            fields.push("id = ?");
            values.push(location.id);
        }
        if (location.descricao !== undefined) {
            fields.push("descricao = ?");
            values.push(location.descricao);
        }
        if (location.setor !== undefined) {
            fields.push("setor = ?");
            values.push(location.setor);
        }
        if (location.data_cadastro !== undefined) {
            fields.push("data_cadastro = ?");
            values.push(location.data_cadastro);
        }
        if (location.data_recadastro !== undefined) {
            fields.push("data_recadastro = ?");
            values.push(location.data_recadastro);
        }
        if (location.ativo !== undefined) {
            fields.push("ativo = ?");
            values.push(location.ativo);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        const conditions: string[] = [];
        if (condition.codigo !== undefined) {
            conditions.push("codigo = ?");
            values.push(condition.codigo);
        }
        if (condition.setor !== undefined) {
            conditions.push("setor = ?");
            values.push(condition.setor);
        }
        if (condition.id !== undefined) {
            conditions.push("id = ?");
            values.push(condition.id);
        }

        if (conditions.length === 0) {
            throw new Error("No condition provided for update.");
        }

        const sql = `UPDATE ${dbName}.locais SET ${fields.join(', ')} WHERE ${conditions.join(' AND ')}`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}