"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectItensPedido = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class SelectItensPedido {
    async buscaProdutosDoOrcamento(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            const sql = ` select *  from ${empresa}.produtos_pedido where pedido = ? `;
            await databaseConfig_1.conn.query(sql, [codigo], async (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async buscaServicosDoOrcamento(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            const sql = ` select *  from ${empresa}.servicos_pedido where pedido = ? `;
            await databaseConfig_1.conn.query(sql, [codigo], async (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async buscaParcelasDoOrcamento(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            const sql = ` select *,  DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento   from ${empresa}.parcelas where pedido = ? `;
            await databaseConfig_1.conn.query(sql, [codigo], async (err, result) => {
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
exports.SelectItensPedido = SelectItensPedido;
