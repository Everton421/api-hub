import { conn } from "../../database/databaseConfig.ts";
import { type ProductMovementType } from "./types/product-movement-type.ts";

type ProductMovementWithoutCode = Omit<ProductMovementType, 'codigo'>;

export class InsertProductMovement {
    async insert(dbName: string, movement: ProductMovementWithoutCode): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.movimentos_produtos 
            (setor, produto, quantidade, unidade_medida, tipo, historico, data_recadastro, usuario, ent_sai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            movement.setor,
            movement.produto,
            movement.quantidade,
            movement.unidade_medida,
            movement.tipo,
            movement.historico,
            movement.data_recadastro,
            movement.usuario,
            movement.ent_sai
        ];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }

    async insertWithCode(dbName: string, movement: ProductMovementType): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.movimentos_produtos 
            (codigo, setor, produto, quantidade, unidade_medida, tipo, historico, data_recadastro, usuario, ent_sai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            movement.codigo,
            movement.setor,
            movement.produto,
            movement.quantidade,
            movement.unidade_medida,
            movement.tipo,
            movement.historico,
            movement.data_recadastro,
            movement.usuario,
            movement.ent_sai
        ];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}