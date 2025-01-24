"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select_Categorias = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Select_Categorias {
    async busca_por_descricao(empresa, descricao) {
        return new Promise(async (resolve, reject) => {
            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.categorias 
               WHERE descricao = '${descricao}' `;
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
    async busca_geral(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.categorias `;
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
exports.Select_Categorias = Select_Categorias;
