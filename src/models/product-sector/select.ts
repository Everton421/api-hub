import { conn } from "../../database/databaseConfig";
import { ProductSectorType } from "./types/product-sector-type";

export class SelectProductSector {
    async findAll(dbName: string, dataRecadastro?: string): Promise<ProductSectorType[]> {
        let sql = ` SELECT 
            ps.*,
            s.id as id_setor,
            p.id as id_produto,
            COALESCE(DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.produto_setor ps
         JOIN ${dbName}.setores s ON s.codigo = ps.setor  
         JOIN ${dbName}.produtos p ON p.codigo = ps.produto `;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE ps.data_recadastro > ?';
            params.push(dataRecadastro);
        } else {
            sql += ' WHERE s.ativo = ?';
            params.push('S');
        }

        const [result] = await conn.query(sql, params);
        return result as ProductSectorType[];
    }

    async findByProduct(dbName: string, productCode: number): Promise<ProductSectorType[]> {
        const sql = ` SELECT 
            ps.*,
            COALESCE(DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.produto_setor ps 
         JOIN ${dbName}.setores s ON s.codigo = ps.setor
         WHERE produto = ? AND s.ativo = 'S'`;

        const [result] = await conn.query(sql, [productCode]);
        return result as ProductSectorType[];
    }

    async findByProductAndSector(dbName: string, productCode: number, sectorCode: number): Promise<ProductSectorType[]> {
        const sql = ` SELECT 
            ps.*,
            s.id as id_setor,
            p.id as id_produto,
            COALESCE(DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.produto_setor ps 
         JOIN ${dbName}.setores s ON s.codigo = ps.setor
         JOIN ${dbName}.produtos p ON p.codigo = ps.produto
         WHERE ps.produto = ? AND ps.setor = ? AND s.ativo = 'S'`;

        const [result] = await conn.query(sql, [productCode, sectorCode]);
        return result as ProductSectorType[];
    }
}