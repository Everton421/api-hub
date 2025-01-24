"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update_UsuarioEmpresa = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Update_UsuarioEmpresa {
    async updateSenha(empresa, senha, email) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                  update ${empresa}.usuarios
                    set senha= '${senha}' 
                  where email = '${email}'   
            `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
exports.Update_UsuarioEmpresa = Update_UsuarioEmpresa;
