import { conn } from "../../database/databaseConfig.ts";
import { type ProductType } from "./types/product-type.ts";

export class InsertProduct {
    async insert(dbName: string, data: ProductType): Promise<{ insertId: number }> {
        const columns = [
            'id',
            'estoque',
            'preco',
            'unidade_medida',
            'grupo',
            'origem',
            'descricao',
            'num_fabricante',
            'num_original',
            'sku',
            'marca',
            'class_fiscal',
            'data_cadastro',
            'data_recadastro',
            'tipo',
            'observacoes1',
            'observacoes2',
            'observacoes3',
            'caracteristica'
        ];

        const values = [
            data.id,
            data.estoque,
            data.preco,
            data.unidade_medida,
            data.grupo,
            data.origem,
            data.descricao,
            data.num_fabricante,
            data.num_original,
            data.sku,
            data.marca,
            data.class_fiscal,
            data.data_cadastro,
            data.data_recadastro,
            data.tipo,
            data.observacoes1,
            data.observacoes2,
            data.observacoes3,
            data.caracteristica
        ];

        if (data.codigo != null) {
            columns.unshift('codigo');
            values.unshift(data.codigo);
        }

        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${dbName}.produtos (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
