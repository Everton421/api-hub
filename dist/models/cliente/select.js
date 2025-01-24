"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select_clientes = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class Select_clientes {
    async buscaGeral(empresa, vendedor) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select *,
             DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
            from ${empresa}.clientes c
            WHERE c.ativo = 'S' and 
                       ( c.vendedor = ${vendedor} OR c.vendedor = 0 or c.vendedor = null)
                       order by c.vendedor    `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    async buscaPorVendedor(empresa, vendedor) {
        return new Promise(async (resolve, reject) => {
            let sql = ` SELECT *,
             DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
           FROM ${empresa}.clientes WHERE vendedor = ?  `;
            await databaseConfig_1.conn.query(sql, [vendedor], (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    async buscaPorcodigo(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            let sql = ` SELECT  codigo, nome, cnpj, celular ,
          DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        FROM ${empresa}.clientes WHERE codigo = ?  `;
            await databaseConfig_1.conn.query(sql, [codigo], (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    async buscaPorCnpj(empresa, cnpj) {
        return new Promise(async (resolve, reject) => {
            let sql = ` SELECT  *,
        DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
          DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
      FROM ${empresa}.clientes WHERE cnpj = ?  `;
            await databaseConfig_1.conn.query(sql, [cnpj], (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
    async buscaUltimoIdInserido(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` SELECT MAX(codigo) as codigo FROM ${empresa}.clientes `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}
exports.Select_clientes = Select_clientes;
