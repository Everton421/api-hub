"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select_fotos = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Select_fotos {
    async busca_geral(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` SELECT *,
               DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
               DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
            FROM ${empresa}.fotos_produtos   `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async buscaPorProduto(codigoProduto) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select * from fotos_produtos where produto = ${codigoProduto}`;
            await databaseConfig_1.conn.query(sql, (err, result) => {
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
exports.Select_fotos = Select_fotos;
