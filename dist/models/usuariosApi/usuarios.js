"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosApi = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class UsuariosApi {
    async insertUsuario(usuario) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                        INSERT INTO ${databaseConfig_1.db_api}.usuarios
                        (
                            nome, email, cnpj, senha, responsavel
                        ) values( ?, ?, ?, ? , ? )
                    `;
            await databaseConfig_1.conn.query(sql, [usuario.usuario, usuario.email, usuario.cnpj, usuario.senha, usuario.responsavel], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    async selectPorNome(nome) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                    select * from ${databaseConfig_1.db_api}.usuarios where nome = ?
                `;
            await databaseConfig_1.conn.query(sql, [nome], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    async selectPorEmail(email) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                select * from ${databaseConfig_1.db_api}.usuarios where email ='${email}'
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
    async selectPorEmailCodigoValidador(email, codigoRecuperador) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                select * from ${databaseConfig_1.db_api}.usuarios where email = ? and cod_recuperador = ? 
            `;
            await databaseConfig_1.conn.query(sql, [email, codigoRecuperador], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    async selectPorEmailSenha(email, senha) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                select * from ${databaseConfig_1.db_api}.usuarios where email = ? and senha = ? 
            `;
            await databaseConfig_1.conn.query(sql, [email, senha], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    async updateCodigoValidador(codigo, data, email) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                  update ${databaseConfig_1.db_api}.usuarios
                    set cod_recuperador= '${codigo}',
                        data_expiracao='${data}'
                  where email = '${email}'   
            `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    async updateSenha(senha, email) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                  update ${databaseConfig_1.db_api}.usuarios
                    set senha = '${senha}' 
                  where email = '${email}'   
            `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
}
exports.UsuariosApi = UsuariosApi;
