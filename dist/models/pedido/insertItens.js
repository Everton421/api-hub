"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertitensPedido = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
class InsertitensPedido {
    async cadastraProdutosDoPedido(produtos, empresa, codigoPedido) {
        return new Promise(async (resolve, reject) => {
            let i = 1;
            for (let p of produtos) {
                let { codigo, preco, quantidade, desconto, total, } = p;
                if (!preco)
                    preco = 0;
                if (!quantidade)
                    quantidade = 0;
                if (!desconto)
                    desconto = 0;
                if (!total)
                    total = 0;
                const sql = ` INSERT INTO ${empresa}.produtos_pedido ( pedido ,  codigo ,  desconto ,  quantidade ,  preco ,  total ) VALUES (? , ?, ?, ?, ?, ?) `;
                let dados = [codigoPedido, codigo, desconto, quantidade, preco, total];
                await databaseConfig_1.conn.query(sql, dados, (error, resultado) => {
                    if (error) {
                        reject(" erro ao inserir produto do orcamento " + error);
                    }
                    else {
                        resolve(resultado);
                        console.log(`produto  inserido com sucesso`);
                    }
                });
                if (i === produtos.length) {
                    return;
                }
                i++;
            }
        });
    }
    async cadastraParcelasDoPedido(parcelas, empresa, codigoPedido) {
        return new Promise(async (resolve, reject) => {
            parcelas.forEach(async (p) => {
                let { pedido, parcela, valor, vencimento } = p;
                let sql = `  INSERT INTO ${empresa}.parcelas ( pedido ,  parcela ,  valor, vencimento ) VALUES ( ?  , ?,  ?, ?  )`;
                let dados = [codigoPedido, parcela, valor, vencimento];
                await databaseConfig_1.conn.query(sql, dados, (err, resultParcelas) => {
                    if (err) {
                        console.log("erro ao inserir parcelas !" + err);
                    }
                    else {
                        console.log('  Parcela inserida com sucesso ');
                        resolve(codigoPedido);
                    }
                });
            });
        });
    }
    async cadastraServicosDoPedido(servicos, codigoPedido, empresa) {
        return new Promise(async (resolve, reject) => {
            if (servicos.length > 0) {
                let i = 1;
                for (let s of servicos) {
                    let { codigo, preco, quantidade, desconto, total, valor, } = s;
                    if (!preco)
                        preco = 0;
                    if (!quantidade)
                        quantidade = 0;
                    if (!desconto)
                        desconto = 0;
                    if (!total)
                        total = 0;
                    const sql = ` INSERT INTO    ${empresa}.servicos_pedido  ( pedido ,  codigo ,  desconto ,  quantidade ,  valor ,  total ) VALUES ( ?, ?, ?, ?, ?, ?)   `;
                    let dados = [codigoPedido, codigo, desconto, quantidade, valor, total];
                    await databaseConfig_1.conn.query(sql, dados, (error, resultado) => {
                        if (error) {
                            console.log(" erro ao inserir servico do orcamento " + error);
                            reject(" erro ao inserir servico do orcamento " + error);
                        }
                        else {
                            resolve(resultado);
                            console.log(`servico  inserido com sucesso`);
                        }
                    });
                    if (i === servicos.length) {
                        return;
                    }
                    i++;
                }
            }
        });
    }
}
exports.InsertitensPedido = InsertitensPedido;
