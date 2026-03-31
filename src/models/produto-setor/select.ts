import { conn } from "../../database/databaseConfig";
import { IProdutoSetor } from "./types/produto-setor";

export class SelectProdutoSetor {

    async findAll(empresa: any, data_recadastro?: string): Promise<IProdutoSetor[]> {
        let sql = ` select 
            ps.*,
            s.id  as id_setor,
            p.id as id_produto,
               coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps
            join ${empresa}.setores s on s.codigo = ps.setor  
            join ${empresa}.produtos p on p.codigo = ps.produto

            `;

        let paramQuery: string[] = [];
        let valueQuery: any[] = [];
        
        if (data_recadastro) {
            paramQuery.push(` WHERE ps.data_recadastro >  ? `);
            valueQuery.push(data_recadastro);
        }
        
        let finalSql = sql;

        if (paramQuery.length > 0) {
            finalSql = sql + paramQuery.join('');
        } else {
            finalSql = sql + ` WHERE  s.ativo ='S'   ;`;
        }
        
        const [result] = await conn.query(finalSql, valueQuery);
        return result as IProdutoSetor[];
    }

    async findByCode(empresa: any, produto: number): Promise<IProdutoSetor[]> {
        let sql = ` select 
            ps.*,
                 coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps 
            join setores s on s.codigo = ps.setor
            where produto = ? and s.ativo = 'S'; `;

        const [result] = await conn.query(sql, [produto]);
        return result as IProdutoSetor[];
    }

    async findByProdSector(empresa: any, produto: number, setor: number): Promise<IProdutoSetor[]> {
        let sql = ` select 
            ps.*,
            s.id  as id_setor,
            p.id as id_produto,
                 coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps 
            join ${empresa}.setores s  on s.codigo = ps.setor
            join ${empresa}.produtos p on p.codigo = ps.produto
            where ps.produto = ?  and ps.setor = ? 
            and s.ativo = 'S';
            `;
        
        const [result] = await conn.query(sql, [produto, setor]);
        return result as IProdutoSetor[];
    }
}
