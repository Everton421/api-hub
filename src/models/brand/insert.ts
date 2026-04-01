import { conn } from "../../database/databaseConfig.ts";
import { type BrandType } from "./types/brand-type.ts";

type BrandWithoutCode = Omit<BrandType, 'codigo'>;

export class InsertBrand {
    async insert(dbName: string, brand: BrandWithoutCode): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.marcas (id, data_cadastro, data_recadastro, descricao, ativo)
                      VALUES (?, ?, ?, ?, ?)`;

        const values = [
            brand.id,
            brand.data_cadastro,
            brand.data_recadastro,
            brand.descricao,
            brand.ativo
        ];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}