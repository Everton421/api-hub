import { conn } from "../../database/databaseConfig.ts";
import { type BrandType } from "./types/brand-type.ts";

type BrandUpdate = Partial<Omit<BrandType, 'codigo'>> & { codigo: number };

export class UpdateBrand {
    async update(dbName: string, brand: BrandUpdate): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (brand.id !== undefined) {
            fields.push("id = ?");
            values.push(brand.id);
        }
        if (brand.descricao !== undefined) {
            fields.push("descricao = ?");
            values.push(brand.descricao);
        }
        if (brand.data_cadastro !== undefined) {
            fields.push("data_cadastro = ?");
            values.push(brand.data_cadastro);
        }
        if (brand.data_recadastro !== undefined) {
            fields.push("data_recadastro = ?");
            values.push(brand.data_recadastro);
        }
        if (brand.ativo !== undefined) {
            fields.push("ativo = ?");
            values.push(brand.ativo);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        values.push(brand.codigo);

        const sql = `UPDATE ${dbName}.marcas SET ${fields.join(', ')} WHERE codigo = ?`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}