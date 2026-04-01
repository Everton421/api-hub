import { conn } from "../../database/databaseConfig.ts";
import { type ProductMovementType } from "./types/product-movement-type.ts";

type ProductMovementUpdate = Partial<Omit<ProductMovementType, 'codigo'>> & { codigo: number };

export class UpdateProductMovement {
    async update(dbName: string, movement: ProductMovementUpdate): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (movement.setor !== undefined) {
            fields.push("setor = ?");
            values.push(movement.setor);
        }
        if (movement.produto !== undefined) {
            fields.push("produto = ?");
            values.push(movement.produto);
        }
        if (movement.quantidade !== undefined) {
            fields.push("quantidade = ?");
            values.push(movement.quantidade);
        }
        if (movement.unidade_medida !== undefined) {
            fields.push("unidade_medida = ?");
            values.push(movement.unidade_medida);
        }
        if (movement.tipo !== undefined) {
            fields.push("tipo = ?");
            values.push(movement.tipo);
        }
        if (movement.historico !== undefined) {
            fields.push("historico = ?");
            values.push(movement.historico);
        }
        if (movement.data_recadastro !== undefined) {
            fields.push("data_recadastro = ?");
            values.push(movement.data_recadastro);
        }
        if (movement.usuario !== undefined) {
            fields.push("usuario = ?");
            values.push(movement.usuario);
        }
        if (movement.ent_sai !== undefined) {
            fields.push("ent_sai = ?");
            values.push(movement.ent_sai);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        values.push(movement.codigo);

        const sql = `UPDATE ${dbName}.movimentos_produtos SET ${fields.join(', ')} WHERE codigo = ?`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}