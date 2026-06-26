import { conn } from "../../database/databaseConfig.ts";
import { type BrandType } from "./types/brand-type.ts";

export class InsertBrand {
    async insert(dbName: string, brand: BrandType): Promise<{ insertId: number }> {
        const columns = ['id', 'data_cadastro', 'data_recadastro', 'descricao', 'ativo'];
        const values = [brand.id, brand.data_cadastro, brand.data_recadastro, brand.descricao, brand.ativo];

        if (brand.codigo != null) {
            columns.unshift('codigo');
            values.unshift(brand.codigo);
        }

        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${dbName}.marcas (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}