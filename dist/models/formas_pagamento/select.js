"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectForma_pagamento = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class SelectForma_pagamento {
    async buscaGeral(empresa) {
        return new Promise(async (resolve, reject) => {
            let sql = ` select *,
         DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        from ${empresa}.forma_pagamento  `;
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err)
                    reject(err);
                resolve(result);
            });
        });
    }
}
exports.SelectForma_pagamento = SelectForma_pagamento;
