"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Insert_UsuarioEmpresa = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Insert_UsuarioEmpresa {
    async insert_usuario(empresa, usuario) {
        let sql = `  INSERT INTO ${empresa}.usuarios
        (
            nome,
            email,
            cnpj,
            senha,
            responsavel
        )VALUES
         ( ?, ?, ?, ?, ? )
        `;
        return new Promise(async (resolve, reject) => {
            await databaseConfig_1.conn.query(sql, [usuario.usuario, usuario.email, usuario.cnpj, usuario.senha, usuario.responsavel], (err, result) => {
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
exports.Insert_UsuarioEmpresa = Insert_UsuarioEmpresa;
