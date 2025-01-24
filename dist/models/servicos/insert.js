"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertServico = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class InsertServico {
    async insert(empresa, servico) {
        return new Promise(async (resolve, reject) => {
            let { codigo, valor, aplicacao, tipo_serv, data_cadastro, data_recadastro, } = servico;
            const sql = ` INSERT INTO  ${empresa}.servicos  
                             (
                            valor ,
                            aplicacao,
                            tipo_serv,
                            data_cadastro,
                            data_recadastro 
                                ) VALUES (
                                     ${valor},
                                    '${aplicacao}',
                                    ${tipo_serv},
                                   '${data_cadastro}',
                                   '${data_recadastro}' 
                                  )
                            `;
            let dados = [valor, aplicacao, tipo_serv, data_cadastro, data_recadastro];
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(`servico cadastrado com sucesso `);
                    resolve(result);
                }
            });
        });
    }
}
exports.InsertServico = InsertServico;
