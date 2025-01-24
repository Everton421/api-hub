"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insert_Marcas = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Insert_Marcas {
    async cadastrar(empresa, marca) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                    INSERT INTO ${empresa}.marcas ( id, data_cadastro, data_recadastro, descricao ) VALUES
                                                      ( ? , ? , ? , ? ); `;
            const values = [marca.id, marca.data_cadastro, marca.data_recadastro, marca.descricao];
            await databaseConfig_1.conn.query(sql, values, (err, result) => {
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
exports.Insert_Marcas = Insert_Marcas;
