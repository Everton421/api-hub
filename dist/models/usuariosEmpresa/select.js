"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select_UsuarioEmpresa = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Select_UsuarioEmpresa {
    async buscaGeral(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select * from ${empresa}.usuarios;`;
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
    async buscaPorEmail(empresa, email) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select * from ${empresa}.usuarios where email = ? ;`;
            await databaseConfig_1.conn.query(sql, [email], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async buscaPorCodigo(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select * from ${empresa}.usuarios where codigo = ? ;`;
            await databaseConfig_1.conn.query(sql, [codigo], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async buscaPorEmailSenha(empresa, email, senha) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select * from ${empresa}.usuarios where email = ? and senha = ?    ;`;
            await databaseConfig_1.conn.query(sql, [email, senha], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async buscaPorEmailNome(empresa, email, usuario) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select * from ${empresa}.usuarios where email = ? and nome = ?    ;`;
            await databaseConfig_1.conn.query(sql, [email, usuario], (err, result) => {
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
exports.Select_UsuarioEmpresa = Select_UsuarioEmpresa;
