"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrcamento = void 0;
const express_1 = require("express");
const databaseConfig_1 = require("../../database/databaseConfig");
const insert_1 = require("./insert");
class UpdateOrcamento {
    async updateTabelaPedido(empresa, orcamento, codigo) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                UPDATE ${empresa}.pedidos  
                set 
                cliente             =  ${orcamento.codigo_cliente},
                total_geral         =  ${orcamento.total_geral} ,
                total_produtos      =  ${orcamento.total_produtos} ,
                total_servicos      =  ${orcamento.total_servicos} ,
                tipo_os             =  ${orcamento.tipo_os},
                tipo                =  ${orcamento.tipo},
                quantidade_parcelas =  ${orcamento.quantidade_parcelas} ,
                contato             = '${orcamento.contato}',
                veiculo             =  ${orcamento.veiculo},
                forma_pagamento     =  ${orcamento.forma_pagamento},
                observacoes         = '${orcamento.observacoes}',
                data_cadastro       = '${orcamento.data_cadastro}',
                data_recadastro     = '${orcamento.data_recadastro}',
                enviado             = 'S',
                observacoes         =  '${orcamento.observacoes}',
                situacao            = '${orcamento.situacao}'
                where codigo = ${codigo}
            `;
            databaseConfig_1.conn.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    // console.log(result);
                    resolve(result.affectedRows);
                }
            });
        });
    }
    async deleteProdutosPedido(empresa, codigo) {
        return new Promise((resolve, reject) => {
            let sql2 = ` delete from ${empresa}.produtos_pedido
                                    where pedido = ${codigo}
                                `;
            databaseConfig_1.conn.query(sql2, (err, result) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(result);
                    resolve(result);
                    // statusAtualizacao = result.serverStatus ;
                }
            });
        });
    }
    async deleteServicosPedido(empresa, codigo) {
        return new Promise((resolve, reject) => {
            let sql2 = ` delete from ${empresa}.servicos_pedido
                                    where pedido = ${codigo}
                                `;
            databaseConfig_1.conn.query(sql2, (err, result) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(" servico deletado com sucesso ", result);
                    resolve(result);
                    // statusAtualizacao = result.serverStatus ;
                }
            });
        });
    }
    async deleteParcelasPedido(empresa, codigo) {
        return new Promise((resolve, reject) => {
            let sql2 = ` delete from ${empresa}.parcelas
                                    where pedido = ${codigo}
                                `;
            databaseConfig_1.conn.query(sql2, (err, result) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(" parcela deletada com sucesso ", result);
                    resolve(result);
                    // statusAtualizacao = result.serverStatus ;
                }
            });
        });
    }
    async buscaProdutosDoOrcamento(empresa, codigo) {
        return new Promise((resolve, reject) => {
            const sql = ` select *  from ${empresa}.produtos_pedido where pedido = ? `;
            databaseConfig_1.conn.query(sql, [codigo], async (err, result) => {
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
    async buscaServicosDoOrcamento(empresa, codigo) {
        return new Promise((resolve, reject) => {
            const sql = ` select *  from ${empresa}.servicos_pedido where pedido = ? `;
            databaseConfig_1.conn.query(sql, [codigo], async (err, result) => {
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
    async buscaParcelasDoOrcamento(empresa, codigo) {
        return new Promise((resolve, reject) => {
            const sql = ` select *,  DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento   from ${empresa}.parcelas where pedido = ? `;
            databaseConfig_1.conn.query(sql, [codigo], async (err, result) => {
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
    async update(empresa, orcamento, codigoOrcamento) {
        let objUpdate = new UpdateOrcamento();
        let objInsert = new insert_1.CreateOrcamento();
        function converterData(data) {
            const [dia, mes, ano] = data.split('/');
            return `${ano}/${mes}/${dia}`;
        }
        function obterDataAtual() {
            const dataAtual = new Date();
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const ano = dataAtual.getFullYear();
            return `${ano}-${mes}-${dia}`;
        }
        function formatarData(data) {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            return `${ano}-${mes}-${dia}`;
        }
        function formatarDataHora(data) {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            const hora = String(data.getHours()).padStart(2, '0');
            const minuto = String(data.getMinutes()).padStart(2, '0');
            const segundo = String(data.getSeconds()).padStart(2, '0');
            return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
        }
        const dataAtual = obterDataAtual();
        const servicos = orcamento.servicos;
        const parcelas = orcamento.parcelas;
        const produtos = orcamento.produtos;
        let aux;
        let statusAtualizacao;
        let statusDeletePro_orca;
        let statusDeletePar_orca;
        try {
            statusAtualizacao = await objUpdate.updateTabelaPedido(empresa, orcamento, codigoOrcamento);
        }
        catch (err) {
            console.log(err);
        }
        if (statusAtualizacao) {
            const validaProdutos = await objUpdate.buscaProdutosDoOrcamento(empresa, codigoOrcamento);
            if (validaProdutos.length > 0) {
                try {
                    statusDeletePro_orca = await objUpdate.deleteProdutosPedido(empresa, codigoOrcamento);
                }
                catch (err) {
                    console.log(err);
                }
                if (produtos.length > 0) {
                    if (statusDeletePro_orca) {
                        try {
                            await objInsert.cadastraProdutosDoPedido(produtos, empresa, codigoOrcamento);
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                }
            }
            const validaServicos = await objUpdate.buscaServicosDoOrcamento(empresa, codigoOrcamento);
            if (validaServicos.length > 0) {
                try {
                    await objUpdate.deleteServicosPedido(empresa, codigoOrcamento);
                }
                catch (e) {
                    console.log(e);
                }
                if (servicos.length > 0) {
                    try {
                        await objInsert.cadastraServicosDoPedido(servicos, codigoOrcamento, empresa);
                    }
                    catch (e) {
                        console.log(` erro ao inserir os servicos`, e);
                    }
                }
            }
            const validaParcelas = await objUpdate.buscaParcelasDoOrcamento(empresa, codigoOrcamento);
            if (validaParcelas.length > 0) {
                if (statusAtualizacao) {
                    try {
                        statusDeletePar_orca = await objUpdate.deleteParcelasPedido(empresa, codigoOrcamento);
                    }
                    catch (err) {
                        console.log(err);
                        return express_1.response.status(500).json({ "msg": err });
                    }
                }
                if (statusDeletePar_orca) {
                    try {
                        await objInsert.cadastraParcelasDoPeidido(parcelas, empresa, codigoOrcamento);
                    }
                    catch (err) {
                        console.log(err);
                        return express_1.response.status(500).json({ "msg": err });
                    }
                }
            }
            return codigoOrcamento;
        }
        else {
            console.log('nao foi encontrado orcamento com este codigo');
        }
    }
}
exports.UpdateOrcamento = UpdateOrcamento;
