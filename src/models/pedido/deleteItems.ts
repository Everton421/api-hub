import { conn } from "../../database/databaseConfig";

export class DeleteItensPedido {

    async deleteProdutosPedido(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {

            let sql2 = ` delete from ${empresa}.produtos_pedido
                                        where pedido = ${codigo}
                                    `
            await conn.query(sql2, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`produto deletado do pedido ${codigo}  `, result)
                    resolve(result);
                }
            })
        })

    }

    async deleteServicosPedido(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {

            let sql2 = ` delete from ${empresa}.servicos_pedido
                                        where pedido = ${codigo}
                                    `
            await conn.query(sql2, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

    }

    async deleteParcelasPedido(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {

            let sql2 = ` delete from ${empresa}.parcelas
                                        where pedido = ${codigo}
                                    `
            await conn.query(sql2, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

    }
}