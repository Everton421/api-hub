import { conn } from "../../database/databaseConfig";
import { IProdutoSetor } from "./types/produto-setor";

type query = {
    setor: string,
    produto: string,
    local_produto: string,
    local1_produto: string,
    local2_produto: string,
    local3_produto: string,
    local4_produto: string
}
export class SelectProdutoSetor {

    async findAll(empresa: any, data_recadastro: string) {
        return new Promise<IProdutoSetor[]>(async (resolve, reject) => {

            let sql = ` select 
            ps.*,
            s.id  as id_setor,
            p.id as id_produto,
               coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps
            join ${empresa}.setores s on s.codigo = ps.setor  
            join ${empresa}.produtos p on p.codigo = ps.produto

            `

            let paramQuery = [];
            let valueQuery = [];
            if (data_recadastro) {
                paramQuery.push(` WHERE ps.data_recadastro >  ? `)
                valueQuery.push(data_recadastro);
            }
            let finalSql = sql;

            if (paramQuery.length > 0) {
                finalSql = sql + paramQuery;
            } else {
                finalSql = sql + ` WHERE  s.ativo ='S'   ;`;
            }
            await conn.query(finalSql, valueQuery, (err: any, result: IProdutoSetor[]) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }

 
    async findByCode(empresa: any, produto: number) {
        return new Promise<IProdutoSetor[]>(async (resolve, reject) => {

            let sql = ` select 
            ps.*,
                 coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps 
            join setores s on s.codigo = ps.setor
            where produto = ? and s.ativo = 'S'; `

            await conn.query(sql, produto, (err: any, result: IProdutoSetor[]) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }
    async findByProdSector(empresa: any, produto: number, setor: number) {
        return new Promise<IProdutoSetor[]>(async (resolve, reject) => {
            let sql = ` select 
            ps.*,
            s.id  as id_setor,
            p.id as id_produto,
                 coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps 
            join ${empresa}.setores s  on s.codigo = ps.setor
            join ${empresa}.produtos p on p.codigo = ps.produto
            where ps.produto = ${produto}  and ps.setor = ${setor} 
            and s.ativo = 'S';
            `
            await conn.query(sql, (err: any, result: IProdutoSetor[]) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }
}