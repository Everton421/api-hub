"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectTipo_os = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class SelectTipo_os {
    async buscaGeral(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro  from ${empresa}.tipos_os  `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}
exports.SelectTipo_os = SelectTipo_os;
