import { conn } from "../../database/databaseConfig.ts";
import { type ProductSectorType } from "./types/product-sector-type.ts";
   type queryByParams={
            setor:number,
            produto:number,
            search:string,
    }
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

    async findByProduct(dbName: string, productCode: number ): Promise<ProductSectorType[]> {
        let sql = ` SELECT 
            ps.*,
              s.id as id_setor,
            p.id as id_produto,
            COALESCE(DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.produto_setor ps 
         
         JOIN ${dbName}.setores s ON s.codigo = ps.setor
         WHERE produto = ? AND s.ativo = 'S'`;
        
        const [result] = await conn.query(sql, [productCode]);
        return result as ProductSectorType[];
    }

    async findByProductAndSector(dbName: string, productCode?: number, sectorCode?: number): Promise<ProductSectorType[]> {
        let sql = ` SELECT 
            ps.*,
            s.id as id_setor,
            p.id as id_produto,
            COALESCE(DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.produto_setor ps 
         JOIN ${dbName}.setores s ON s.codigo = ps.setor
         JOIN ${dbName}.produtos p ON p.codigo = ps.produto
         WHERE  s.ativo = 'S' `;
          const values =[]

        if(productCode){
            sql += 'AND ps.produto = ? '
            values.push(productCode)
        }

         if(sectorCode){
            sql += ' AND ps.setor = ? '
            values.push(sectorCode)
         }

        const [result] = await conn.query(sql, values);
        return result as ProductSectorType[];
    }

 
     async findByParams(dbName: string, query: Partial<queryByParams>): Promise<ProductSectorType[]> {
        const {   produto, search, setor} =query 

        let sql = ` SELECT 
            ps.*,
            s.id as id_setor,
            p.id as id_produto,
            COALESCE(DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.produto_setor ps 
         JOIN ${dbName}.setores s ON s.codigo = ps.setor
         JOIN ${dbName}.produtos p ON p.codigo = ps.produto
              `;

         const values =[]
         const conditions=[];
              conditions.push('s.ativo = ?')
                values.push('S')

            if(produto){
                conditions.push('ps.produto = ?')
                values.push(produto)
            }
            if(setor){
                conditions.push('ps.setor = ?')
                values.push(setor)
            }

            if( search ){
                    const terms = search.trim().split(/\s+/).filter(t => t.length > 0);
                if (terms.length > 0) {
                        const termConditions = terms.map(() =>
                        '(   s.descricao LIKE ? OR p.descricao LIKE ? )'
                        );
                        conditions.push(`(${termConditions.join(' AND ')})`);
                        terms.forEach(term => {
                        values.push(`%${term.toLocaleLowerCase()}%`, `%${term.toLowerCase()}%` );
                        });
                }
            }
            sql = sql + ' WHERE ' + conditions.join(' AND ')
        const [result] = await conn.query(sql, values);
        return result as ProductSectorType[];
    }

}