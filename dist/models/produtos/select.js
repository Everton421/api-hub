"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select_produtos = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Select_produtos {
    async buscaPorCodigo(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            let sql = `
         select 
            *,
                 DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
             CONVERT(observacoes1 USING utf8) as observacoes1,
             CONVERT(observacoes2 USING utf8) as observacoes2,
             CONVERT(observacoes3 USING utf8) as observacoes3
        from ${empresa}.produtos where codigo = ? `;
            await databaseConfig_1.conn.query(sql, [codigo], (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    async buscaPorCodigoDescricao(empresa, codigo, descricao) {
        if (!codigo)
            codigo = 0;
        if (!descricao)
            descricao = '';
        const sql = `SELECT *, 
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
                  CONVERT(observacoes1 USING utf8) as observacoes1,
                  CONVERT(observacoes2 USING utf8) as observacoes2,
                  CONVERT(observacoes3 USING utf8) as observacoes3

            FROM ${empresa}.produtos 
            WHERE  codigo like ? OR descricao = ?    `;
        return new Promise(async (resolve, reject) => {
            await databaseConfig_1.conn.query(sql, [codigo, descricao], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async buscaPorCodigoOuDescricao(empresa, parametro) {
        const sql = `SELECT *, 
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
                  CONVERT(observacoes1 USING utf8) as observacoes1,
                  CONVERT(observacoes2 USING utf8) as observacoes2,
                  CONVERT(observacoes3 USING utf8) as observacoes3

            FROM ${empresa}.produtos 
            WHERE  codigo like ? OR descricao = ?    `;
        return new Promise(async (resolve, reject) => {
            await databaseConfig_1.conn.query(sql, [parametro, parametro], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    async buscaGeral(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select 
        *,
        DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro, 
             CONVERT(observacoes1 USING utf8) as observacoes1,
             CONVERT(observacoes2 USING utf8) as observacoes2,
             CONVERT(observacoes3 USING utf8) as observacoes3
        from ${empresa}.produtos  `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    async buscaUltimoCodigoInserido(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select MAX(codigo) as codigo  from ${empresa}.produtos `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                resolve(result[0]);
            });
        });
    }
}
exports.Select_produtos = Select_produtos;
