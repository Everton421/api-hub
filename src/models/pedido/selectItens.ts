import { conn } from "../../database/databaseConfig";

export class SelectItensPedido {


    async buscaProdutosDoOrcamento(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {
            const sql = ` select pp.*, p.descricao , p.id
                from ${empresa}.produtos_pedido pp 
                join ${empresa}.produtos p on pp.codigo = p.codigo
                where pp.pedido = ? `
            await conn.query(sql, [codigo], async (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

       async validaProdutosPedido(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {
            const sql = ` select pp.* 
                from ${empresa}.produtos_pedido pp 
                where pp.pedido = ? `
            await conn.query(sql, [codigo], async (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

    async buscaServicosDoOrcamento(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {
            const sql = ` select 
                 sp.*, 
                 s.aplicacao,
                 s.id
                   from ${empresa}.servicos_pedido sp 
                join ${empresa}.servicos s on s.codigo = sp.codigo
                where sp.pedido = ? `
            await conn.query(sql, [codigo], async (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
    async buscaParcelasDoOrcamento(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {
            const sql = ` select *,  DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento   from ${empresa}.parcelas where pedido = ? `
            await conn.query(sql, [codigo], async (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
}