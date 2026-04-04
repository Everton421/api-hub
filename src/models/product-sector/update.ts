import { conn } from "../../database/databaseConfig.ts";
import { type ProductSectorType } from "./types/product-sector-type.ts";

type ProductSectorUpdate = Partial<Omit<ProductSectorType, 'id_produto' | 'id_setor'>> & { produto: number; setor: number };

export class UpdateProductSector {
    async update(dbName: string, productSector: ProductSectorUpdate): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (productSector.estoque !== undefined) {
            fields.push("estoque = ?");
            values.push(productSector.estoque);
        }
        if (productSector.local_produto !== undefined) {
            fields.push("local_produto = ?");
            values.push(productSector.local_produto);
        }
        if (productSector.local1_produto !== undefined) {
            fields.push("local1_produto = ?");
            values.push(productSector.local1_produto);
        }
        if (productSector.local2_produto !== undefined) {
            fields.push("local2_produto = ?");
            values.push(productSector.local2_produto);
        }
        if (productSector.local3_produto !== undefined) {
            fields.push("local3_produto = ?");
            values.push(productSector.local3_produto);
        }
        if (productSector.local4_produto !== undefined) {
            fields.push("local4_produto = ?");
            values.push(productSector.local4_produto);
        }
        if (productSector.data_recadastro !== undefined) {
            fields.push("data_recadastro = ?");
            values.push(productSector.data_recadastro);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        values.push(productSector.produto);
        values.push(productSector.setor);

        const sql = `UPDATE ${dbName}.produto_setor 
                     SET ${fields.join(', ')} 
                     WHERE produto = ? AND setor = ?`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }

    async updateStock(dbName: string, params: { produto: number; setor: number; estoque: number; data_recadastro: string }): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.produto_setor 
                     SET estoque = ?, data_recadastro = ?
                     WHERE produto = ? AND setor = ?`;

        const [result] = await conn.query(sql, [params.estoque, params.data_recadastro, params.produto, params.setor]);
        return { affectedRows: (result as any).affectedRows };
    }
}