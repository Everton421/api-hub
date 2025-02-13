"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePedido = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
const deleteItems_1 = require("./deleteItems");
const selectItens_1 = require("./selectItens");
const insertItens_1 = require("./insertItens");
class UpdatePedido {
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
                    resolve(result.affectedRows);
                }
            });
        });
    }
    async update(empresa, orcamento, codigoOrcamento) {
        return new Promise(async (resolve, reject) => {
            let objUpdate = new UpdatePedido();
            let deleteItensPedido = new deleteItems_1.DeleteItensPedido();
            let selectItensPedido = new selectItens_1.SelectItensPedido();
            let insertitensPedido = new insertItens_1.InsertitensPedido();
            const servicos = orcamento.servicos;
            const parcelas = orcamento.parcelas;
            const produtos = orcamento.produtos;
            let statusAtualizacao;
            let statusDeletePro_orca;
            let statusDeletePar_orca;
            try {
                statusAtualizacao = await objUpdate.updateTabelaPedido(empresa, orcamento, codigoOrcamento);
            }
            catch (err) {
                reject(err);
                return;
            }
            let validaServicos;
            try {
                validaServicos = await selectItensPedido.buscaServicosDoOrcamento(empresa, codigoOrcamento);
            }
            catch (e) {
                console.log(e);
            }
            if (validaServicos.length > 0) {
                try {
                    await deleteItensPedido.deleteServicosPedido(empresa, codigoOrcamento);
                }
                catch (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
            }
            if (servicos.length > 0) {
                try {
                    await insertitensPedido.cadastraServicosDoPedido(servicos, codigoOrcamento, empresa);
                }
                catch (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
            }
            let validaProdutos;
            try {
                validaProdutos = await selectItensPedido.buscaProdutosDoOrcamento(empresa, codigoOrcamento);
            }
            catch (e) {
                console.log(e);
            }
            if (validaProdutos.length > 0) {
                try {
                    statusDeletePro_orca = await deleteItensPedido.deleteProdutosPedido(empresa, codigoOrcamento);
                }
                catch (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
            }
            if (produtos.length > 0) {
                try {
                    await insertitensPedido.cadastraProdutosDoPedido(produtos, empresa, codigoOrcamento);
                }
                catch (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
            }
            const validaParcelas = await selectItensPedido.buscaParcelasDoOrcamento(empresa, codigoOrcamento);
            if (validaParcelas.length > 0) {
                //  if(statusAtualizacao ){
                try {
                    statusDeletePar_orca = await deleteItensPedido.deleteParcelasPedido(empresa, codigoOrcamento);
                }
                catch (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
                //     } 
            }
            try {
                await insertitensPedido.cadastraParcelasDoPedido(parcelas, empresa, codigoOrcamento);
            }
            catch (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(codigoOrcamento);
            resolve(codigoOrcamento);
        });
    }
}
exports.UpdatePedido = UpdatePedido;
