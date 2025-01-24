"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertProdutos = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class InsertProdutos {
    async insert(empresa, produto) {
        return new Promise(async (resolve, reject) => {
            let { ativo, class_fiscal, cst, data_cadastro, data_recadastro, descricao, estoque, grupo, marca, num_original, origem, preco, sku, tipo, num_fabricante, observacoes1, observacoes2, observacoes3 } = produto;
            const sql = ` INSERT INTO  ${empresa}.produtos  
                             (
                            estoque ,
                            preco ,
                            grupo ,
                            origem ,
                            descricao ,
                            num_fabricante ,
                            num_original ,
                            sku ,
                            marca ,
                            class_fiscal ,
                            data_cadastro ,
                            data_recadastro ,
                            tipo,
                            observacoes1,
                            observacoes2,
                            observacoes3
                                ) VALUES (
                                    ${estoque} ,
                                    ${preco} ,
                                    ${grupo} ,
                                    ${origem} ,
                                    '${descricao}',
                                    '${num_fabricante}' ,
                                    '${num_original}' ,
                                    '${sku}' ,
                                    ${marca} ,
                                    '${class_fiscal}',
                                    '${data_cadastro}',
                                    '${data_recadastro}',  
                                    ${tipo}, 
                                    '${observacoes1}',
                                    '${observacoes2}',
                                    '${observacoes3}'  
                                  )
                            `;
            let dados = [estoque, preco, grupo, origem, descricao, num_fabricante, num_original, sku, marca, class_fiscal, data_cadastro, data_recadastro, tipo, observacoes1, observacoes2, observacoes3];
            await databaseConfig_1.conn.query(sql, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    console.log(`produto cadastrado com sucesso `);
                    resolve(result);
                }
            });
        });
    }
}
exports.InsertProdutos = InsertProdutos;
