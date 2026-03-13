import { conn } from "../../database/databaseConfig";
import { InsertitensPedido } from "./insertItens";

export class InsertPedido {


    converterData(data: string): string {
        const [dia, mes, ano] = data.split('/');
        return `${ano}-${mes}-${dia}`;
    }
    obterDataAtual() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia}`;
    }


    async create(empresa: any, orcamento: any) {
        return new Promise(async (resolve, reject) => {

            const dataAtual = this.obterDataAtual();

            let insertitensPedido = new InsertitensPedido();

            let codigo_pedido;
            let {
                codigo,
                forma_pagamento,
                descontos,
                observacoes,
                observacoes2,
                quantidade_parcelas,
                total_geral,
                total_produtos,
                total_servicos,
                totalSemDesconto,
                situacao,
                situacao_separacao,
                tipo,
                vendedor,
                data_cadastro,
                data_recadastro,
                veiculo,
                tipo_os,
                contato,
                just_ipi,
                just_icms,
                just_subst,
                enviado,
                id,
                id_externo,
                id_interno
            } = orcamento;

            enviado = 'S';

            const servicos = orcamento.servicos;
            const parcelas = orcamento.parcelas;
            const produtos = orcamento.produtos;
            const cliente = orcamento.cliente;

            if (!id) id = 0;
            if (!id_externo) id_externo = 0;

            if (!situacao) situacao = 'EA';
            if (!vendedor) vendedor = 1;
            if (!tipo_os) tipo_os = 0;
            if (!tipo) tipo = 1;
            if (!veiculo) veiculo = 0;
            if (!data_cadastro) data_cadastro = dataAtual;
            if (!data_recadastro) data_recadastro = dataAtual;
            if (!total_servicos) total_servicos = 0;
            if (!contato) contato = '';
            if (!observacoes) observacoes = '';
            if (!observacoes2) observacoes2 = '';
            if (!just_ipi) just_ipi = '';
            if (!just_icms) just_icms = '';
            if (!just_subst) just_subst = '';
            if (!forma_pagamento) forma_pagamento = 0
            if (!descontos) descontos = 0
            if (!quantidade_parcelas) quantidade_parcelas = 0;


            let sql = `INSERT INTO 
      ${empresa}.pedidos 
      ( codigo ,  id , id_externo, id_interno,  vendedor , situacao, situacao_separacao, contato ,  descontos ,  forma_pagamento ,  quantidade_parcelas ,  total_geral ,  total_produtos ,  total_servicos ,  cliente ,  veiculo ,  data_cadastro ,  data_recadastro ,  tipo_os ,  enviado, tipo, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)  
        `
            await conn.query(
                sql,
                [codigo, id, id_externo, id_interno, vendedor, situacao,situacao_separacao, contato, descontos, forma_pagamento, quantidade_parcelas, total_geral, total_produtos, total_servicos, cliente.codigo, veiculo, data_cadastro, data_recadastro, tipo_os, enviado, tipo, observacoes],
                async (err: any, result: any) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {

                        let status = null;
                        if (servicos.length > 0) {
                            try {
                                await insertitensPedido.cadastraServicosDoPedido(servicos, codigo, empresa);
                                status == true

                            } catch (e) { console.log(e) }
                        }
                        if (produtos.length > 0) {
                            try {
                                await insertitensPedido.cadastraProdutosDoPedido(produtos, empresa, codigo,);
                                status = true
                            } catch (e) { console.log(e) }
                        }

                        if (parcelas.length > 0) {
                            try {
                                await insertitensPedido.cadastraParcelasDoPedido(parcelas, empresa, codigo);
                                status == true
                            } catch (e) {
                                console.log(e)
                            }
                        }
                        resolve({ codigo: codigo, status: status });
                    }
                }
            )

        })

    }



}
