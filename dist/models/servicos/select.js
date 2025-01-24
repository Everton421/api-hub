"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select_servicos = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Select_servicos {
    async buscaPorCodigo(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select *,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        from ${empresa}.servicos where codigo = ? `;
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
      DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    FROM ${empresa}.servicos
    WHERE  codigo like ? OR aplicacao = ?    `;
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
    async buscaGeral(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select *,
      DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
    from ${empresa}.servicos  `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}
exports.Select_servicos = Select_servicos;
