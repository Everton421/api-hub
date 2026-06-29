import { conn } from "../../database/databaseConfig.ts";
import { type ProductType } from "./types/product-type.ts";

export class UpdateProduct {
    async update(dbName: string, data: ProductType): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.produtos
        SET id = ?,
            estoque = ?,
            ativo = ?,
            preco = ?,
            unidade_medida = ?,
            grupo = ?,
            origem = ?,
            descricao = ?,
            num_fabricante = ?,
            num_original = ?,
            sku = ?,
            marca = ?,
            class_fiscal = ?,
            data_cadastro = ?,
            data_recadastro = ?,
            tipo = ?,
            observacoes1 = ?,
            observacoes2 = ?,
            observacoes3 = ?,
            caracteristica = ?,
            controle_lote_serie = ?
        WHERE codigo = ?`;

        const values = [
            data.id,
            data.estoque,
            data.ativo,
            String(data.preco),
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
            data.caracteristica,
            data.controle_lote_serie,
            data.codigo
        ];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}
