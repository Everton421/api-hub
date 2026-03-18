import { conn } from "../../database/databaseConfig";

import { DeleteItensPedido } from "./deleteItems";
import { InsertitensPedido } from "./insertItens";
import { SelectItensPedido } from "./selectItens";

type orderReceived =
    {
        codigo_cliente: number
            cliente: { codigo:number}
        total_geral: number
        total_produtos: number
        total_servicos: number
        tipo_os: number
        tipo: number
        quantidade_parcelas: number
        contato: string
        veiculo: number
        forma_pagamento: number
        frete:number 
        observacoes: string
        data_cadastro: string
        data_recadastro: string
        situacao: string
        situacao_separacao: 'N' | 'P' | 'I'
        id_interno:string
        id_externo:string
    }

export class UpdatePedido {


    async updateTabelaPedido(empresa: any, orcamento: orderReceived, codigo: number) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                UPDATE ${empresa}.pedidos  
                set 
                cliente             =  ${orcamento.cliente.codigo},
                total_geral         =  ${orcamento.total_geral} ,
                total_produtos      =  ${orcamento.total_produtos} ,
                total_servicos      =  ${orcamento.total_servicos} ,
                tipo_os             =  ${orcamento.tipo_os},
                tipo                =  ${orcamento.tipo},
                quantidade_parcelas =  ${orcamento.quantidade_parcelas} ,
                contato             = '${orcamento.contato}',
                veiculo             =  ${orcamento.veiculo},
                frete               = ${orcamento.frete},
                forma_pagamento     =  ${orcamento.forma_pagamento},
                observacoes         = '${orcamento.observacoes}',
                data_cadastro       = '${orcamento.data_cadastro}',
                data_recadastro     = '${orcamento.data_recadastro}',
                enviado             = 'S',
                situacao            = '${orcamento.situacao}',
                situacao_separacao  = '${orcamento.situacao_separacao}',
                id_interno = '${orcamento.id_interno}',
                id_externo = '${orcamento.id_externo}' 
                where codigo = ${codigo}
            `
            console.log(sql)
            conn.query(sql, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.affectedRows);
                }
            })
        })
    }


    async update(empresa: any, orcamento: any, codigoOrcamento: number) {
        return new Promise(async (resolve, reject) => {


            let objUpdate = new UpdatePedido();

            let deleteItensPedido = new DeleteItensPedido();
            let selectItensPedido = new SelectItensPedido();
            let insertitensPedido = new InsertitensPedido();

            const servicos = orcamento.servicos;
            const parcelas = orcamento.parcelas;
            const produtos = orcamento.produtos;

            let statusAtualizacao: any;
            let statusDeletePro_orca: any;
            let statusDeletePar_orca: any;

            try {
                statusAtualizacao = await objUpdate.updateTabelaPedido(empresa, orcamento, codigoOrcamento);
            } catch (err) {
                reject(err)
                return;
            }

            let validaServicos: any
            try {
                validaServicos = await selectItensPedido.buscaServicosDoOrcamento(empresa, codigoOrcamento)
            } catch (e) { console.log(e) }

            if (validaServicos.length > 0) {

                try {
                    await deleteItensPedido.deleteServicosPedido(empresa, codigoOrcamento)
                } catch (err) {
                    console.log(err)
                    reject(err);
                    return;
                }
            }

            if (servicos.length > 0) {
                try {
                    await insertitensPedido.cadastraServicosDoPedido(servicos, codigoOrcamento, empresa)
                } catch (err) {
                    console.log(err)
                    reject(err);
                    return;
                }

            }

            let validaProdutos: any
            try {
                validaProdutos = await selectItensPedido.validaProdutosPedido(empresa, codigoOrcamento)
            } catch (e) { console.log(e) }

            if (validaProdutos.length > 0) {
                try {
                    statusDeletePro_orca = await deleteItensPedido.deleteProdutosPedido(empresa, codigoOrcamento);
                } catch (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
            }

            if (produtos.length > 0) {
                try {
                    await insertitensPedido.cadastraProdutosDoPedido(produtos, empresa, codigoOrcamento, orcamento.total_produtos, orcamento.frete);
                } catch (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
            }


            const validaParcelas: any = await selectItensPedido.buscaParcelasDoOrcamento(empresa, codigoOrcamento)

            if (validaParcelas.length > 0) {
                //  if(statusAtualizacao ){
                try {
                    statusDeletePar_orca = await deleteItensPedido.deleteParcelasPedido(empresa, codigoOrcamento);
                } catch (err) {
                    console.log(err)
                    reject(err)
                    return;
                }
                //     } 
            }

            try {
                await insertitensPedido.cadastraParcelasDoPedido(parcelas, empresa, codigoOrcamento);
            } catch (err) {
                console.log(err)
                reject(err)
                return;
            }
            resolve(codigoOrcamento)

            resolve(codigoOrcamento)
        })

    }


}