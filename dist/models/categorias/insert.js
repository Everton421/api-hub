"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insert_Categorias = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Insert_Categorias {
    async cadastrar(empresa, categoria) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                    INSERT INTO ${empresa}.categorias ( id, data_cadastro, data_recadastro, descricao ) VALUES
                                                      ( ? , ? , ? , ? ); `;
            const values = [categoria.id, categoria.data_cadastro, categoria.data_recadastro, categoria.descricao];
            await databaseConfig_1.conn.query(sql, values, (err, result) => {
                if (err) {
                    reject(err);
                    console.log(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
exports.Insert_Categorias = Insert_Categorias;
