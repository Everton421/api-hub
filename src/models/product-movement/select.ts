import { conn } from "../../database/databaseConfig.ts";
import { type ProductMovementType } from "./types/product-movement-type.ts";

type ProductMovementQuery = {
    setor: number;
    produto: number;
    quantidade: number;
    tipo: string;
    historico: string;
    data_recadastro: string;
    codigo: number;
    usuario: number;
    ent_sai: string;
    search:string
};

export class SelectProductMovement {
    async findAll(dbName: string, params: { data_recadastro?: string; usuario?: number }): Promise<ProductMovementType[]> {
        let sql = ` SELECT 
            mp.*,
            p.id as id_produto,
            s.id as id_setor,
            COALESCE(DATE_FORMAT(mp.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.movimentos_produtos as mp 
         JOIN ${dbName}.produtos p ON mp.produto = p.codigo
         JOIN ${dbName}.setores s ON s.codigo = mp.setor `;

        const conditions: string[] = [];
        const values: any[] = [];

        if (params.usuario && params.usuario !== 0) {
            conditions.push("mp.usuario = ?");
            values.push(params.usuario);
        }

        if (params.data_recadastro) {
            conditions.push("mp.data_recadastro > ?");
            values.push(params.data_recadastro);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
  
        const [result] = await conn.query(sql, values);
        return result as ProductMovementType[];
    }

    async findByCode(dbName: string, code: number): Promise<ProductMovementType[]> {
        const sql = ` SELECT 
            mp.*,
            p.id as id_produto,
            s.id as id_setor,
            COALESCE(DATE_FORMAT(mp.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.movimentos_produtos as mp 
         JOIN ${dbName}.produtos p ON mp.produto = p.codigo
         JOIN ${dbName}.setores s ON s.codigo = mp.setor
         WHERE mp.codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as ProductMovementType[];
    }
    async findByCodeAndUser(dbName: string, code: number, user:number ): Promise<ProductMovementType[]> {
        const sql = ` SELECT 
            mp.*,
         
            COALESCE(DATE_FORMAT(mp.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.movimentos_produtos as mp 
         WHERE mp.codigo = ? AND mp.usuario =  ? ;`;

        const [result] = await conn.query(sql, [ code, user]);
        return result as ProductMovementType[];
    }

    async findByProduct(dbName: string, productCode: number): Promise<ProductMovementType[]> {
        const sql = ` SELECT 
            *,
            COALESCE(DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.movimentos_produtos 
         WHERE produto = ?`;

        const [result] = await conn.query(sql, [productCode]);
        return result as ProductMovementType[];
    }

    async findByProductAndSector(dbName: string, productCode: number, sectorCode: number): Promise<ProductMovementType[]> {
        const sql = ` SELECT 
            *,
            COALESCE(DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.movimentos_produtos 
         WHERE produto = ? AND setor = ?`;

        const [result] = await conn.query(sql, [productCode, sectorCode]);
        return result as ProductMovementType[];
    }

    async findByParams(dbName: string, params: Partial<ProductMovementQuery>): Promise<ProductMovementType[]> {
        const {
            setor,
            produto,
            quantidade,
            tipo,
            historico,
            data_recadastro,
            codigo,
            usuario,
            ent_sai,
            search
        } = params;

        let sql = ` SELECT 
            mp.*,
            s.id as id_setor,
            p.id as id_produto,
            COALESCE(DATE_FORMAT(mp.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
         FROM ${dbName}.movimentos_produtos as mp
         JOIN ${dbName}.produtos as p ON mp.produto = p.codigo
         JOIN ${dbName}.setores s ON s.codigo = mp.setor `;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push("mp.codigo = ?");
            values.push(codigo);
        }
        if (setor !== undefined) {
            conditions.push("mp.setor = ?");
            values.push(setor);
        }
        if (produto !== undefined) {
            conditions.push("mp.produto = ?");
            values.push(produto);
        }
        if (quantidade !== undefined) {
            conditions.push("mp.quantidade = ?");
            values.push(quantidade);
        }
        if (tipo) {
            conditions.push("mp.tipo = ?");
            values.push(tipo);
        }
        if (usuario !== undefined) {
            conditions.push("mp.usuario = ?");
            values.push(usuario);
        }
        if (ent_sai != '*') {
            conditions.push("mp.ent_sai = ?");
            values.push(ent_sai);
        }
        if (historico) {
            conditions.push("mp.historico LIKE ?");
            values.push(`%${historico.toLowerCase()}%`);
        }

       
    if (search) {
      const terms = search.trim().split(/\s+/).filter(t => t.length > 0);
      if (terms.length > 0) {
        const termConditions = terms.map(() =>
          '(mp.historico LIKE ? OR p.descricao LIKE ? OR p.num_original LIKE ? OR p.num_fabricante LIKE ?)'
        );
        conditions.push( termConditions.join(' AND ')  );
        terms.forEach(term => {
          values.push(`%${term.toLocaleLowerCase()}%`, `%${term}%`, `%${term}%`, `%${term}%`);
        });
      }
    }

        if (data_recadastro) {
            conditions.push("mp.data_recadastro > ?");
            values.push(data_recadastro);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        const [result] = await conn.query(sql, values);
        return result as ProductMovementType[];
    }
}