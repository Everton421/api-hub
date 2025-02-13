"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteItensPedido = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class DeleteItensPedido {
    async deleteProdutosPedido(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            let sql2 = ` delete from ${empresa}.produtos_pedido
                                        where pedido = ${codigo}
                                    `;
            await databaseConfig_1.conn.query(sql2, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log(`produto deletado do pedido ${codigo}  `, result);
                    resolve(result);
                }
            });
        });
    }
    async deleteServicosPedido(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            let sql2 = ` delete from ${empresa}.servicos_pedido
                                        where pedido = ${codigo}
                                    `;
            await databaseConfig_1.conn.query(sql2, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async deleteParcelasPedido(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            let sql2 = ` delete from ${empresa}.parcelas
                                        where pedido = ${codigo}
                                    `;
            await databaseConfig_1.conn.query(sql2, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
exports.DeleteItensPedido = DeleteItensPedido;
