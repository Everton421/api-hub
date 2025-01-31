import { conn } from "../../database/databaseConfig";

export class SelectItensPedido{

    
        async   buscaProdutosDoOrcamento(empresa:any, codigo: number) {
            return new Promise( async (resolve, reject) => {
                const sql = ` select *  from ${empresa}.produtos_pedido where pedido = ? `
               await conn.query(sql, [codigo], async (err:any, result:any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        }
        async   buscaServicosDoOrcamento( empresa:any,codigo: number) {
            return new Promise( async (resolve, reject) => {
                const sql = ` select *  from ${empresa}.servicos_pedido where pedido = ? `
             await   conn.query(sql, [codigo], async (err:any, result:any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        }
        async   buscaParcelasDoOrcamento(empresa:any,codigo: number) {
            return new Promise( async (resolve, reject) => {
                const sql = ` select *,  DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento   from ${empresa}.parcelas where pedido = ? `
             await   conn.query(sql, [codigo], async (err:any, result:any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            })
        }
}