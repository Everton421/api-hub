"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select_veiculos = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Select_veiculos {
    async buscaGeral(dbName) {
        return new Promise(async (resolve, reject) => {
            let sql = `select *,
                  DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
            from ${dbName}.veiculos;
                `;
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
exports.Select_veiculos = Select_veiculos;
