"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectPedido = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class SelectPedido {
    async validaExistencia(empresa, codigo) {
        return new Promise(async (resolve, reject) => {
            const code = codigo;
            const sql = ` select * from ${empresa}.pedidos where codigo =  ?  `;
            await databaseConfig_1.conn.query(sql, [code], (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    // console.log(result)
                    resolve(result);
                }
            });
        });
    }
    async buscaPordata(empresa, queryData, vendedor) {
        let objSelect = new SelectPedido();
        let param_data;
        if (!queryData) {
            param_data = objSelect.obterDataAtualSemHoras();
        }
        else {
            param_data = objSelect.formatarData(queryData);
            if (!param_data) {
                return;
            }
        }
        return new Promise(async (resolve, reject) => {
            const sql = `select *, CONVERT(observacoes USING utf8) as observacoes from ${empresa}.pedidos as co
                where   co.data_recadastro >= '${param_data}' and co.vendedor = ${vendedor}
            `;
            await databaseConfig_1.conn.query(sql, async (err, result) => {
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
    obterDataAtualSemHoras() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia} 00:00:00`;
    }
    formatarData(data) {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!regex.test(data)) {
            return null;
        }
        return data;
    }
    async buscaCompleta() {
    }
}
exports.SelectPedido = SelectPedido;
