"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidoController = void 0;
const selectPedido_1 = require("../../models/pedido/selectPedido");
const updatePedido_1 = require("../../models/pedido/updatePedido");
const insertPedido_1 = require("../../models/pedido/insertPedido");
const select_1 = require("../../models/cliente/select");
const selectItens_1 = require("../../models/pedido/selectItens");
class pedidoController {
    formatarData(data, comHorario = false) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        let formattedDate = `${ano}-${mes}-${dia}`;
        if (comHorario) {
            const hora = String(data.getHours()).padStart(2, '0');
            const minuto = String(data.getMinutes()).padStart(2, '0');
            const segundo = String(data.getSeconds()).padStart(2, '0');
            formattedDate = `${formattedDate} ${hora}:${minuto}:${segundo}`;
        }
        return formattedDate;
    }
    async insert(req, res) {
        let obj = new pedidoController();
        const insertPedido = new insertPedido_1.InsertPedido();
        const selectPedido = new selectPedido_1.SelectPedido();
        const updatePedido = new updatePedido_1.UpdatePedido();
        if (!req.headers.cnpj)
            return res.status(400).json({ erro: "É necessario informar o codigo da empresa " });
        let headerCnpj = String(req.headers.cnpj);
        let empresa = headerCnpj.replace(/\D/g, '');
        empresa = `\`${empresa}\``;
        if (!req.body || req.body.length === 0)
            return res.status(400).json({ erro: "É necessario informar os pedidos! " });
        //    try{
        let dadosPedidos = req.body;
        const results = await Promise.all(dadosPedidos.map(async (p) => {
            let status;
            const validPedido = await selectPedido.validaExistencia(empresa, p.codigo);
            if (validPedido.length > 0) {
                const pedidoEncontrado = validPedido[0];
                const data_recad = obj.formatarData(new Date(pedidoEncontrado.data_recadastro), true);
                if (p.data_recadastro > data_recad) {
                    console.log(`atualizando pedido ${p.codigo} ${p.data_recadastro} > ${data_recad} `);
                    await updatePedido.update(empresa, p, p.codigo);
                    status = 'atualizado';
                }
                else {
                    status = ` O pedido ${p.codigo} se encontra atualizado`;
                    console.log(status);
                }
            }
            else {
                await insertPedido.create(empresa, p);
                status = 'inserido';
            }
            return { codigo: p.codigo, status };
        }));
        return res.status(200).json({ results });
        // } catch (error) {
        //     console.error("Erro ao processar pedidos:", error);
        //     return res.status(500).json({ error: "Erro interno ao processar pedidos." });
        //}
    }
    async select(req, res) {
        let obj = new pedidoController();
        if (!req.query.data)
            return res.status(400).json({ erro: `é necessario informar uma data` });
        if (!req.query.vendedor)
            return res.status(400).json({ erro: `é necessario informar o vendedor` });
        if (!req.headers.cnpj)
            return res.status(400).json({ erro: "É necessario informar o codigo da empresa " });
        let headerCnpj = String(req.headers.cnpj);
        let empresa = headerCnpj.replace(/\D/g, '');
        empresa = `\`${empresa}\``;
        let vendedor = Number(req.query.vendedor);
        let data = req.query.data;
        let selectOrcamento = new selectPedido_1.SelectPedido();
        let select_clientes = new select_1.Select_clientes();
        const selectItensPedido = new selectItens_1.SelectItensPedido();
        try {
            const dados_orcamentos = await selectOrcamento.buscaPordata(empresa, data, vendedor);
            if (dados_orcamentos.length === 0)
                return res.status(200).json([]);
            const orcamentos_registrados = await Promise.all(dados_orcamentos.map(async (i) => {
                let produtos = [];
                let servicos = [];
                let parcelas = [];
                let cliente;
                i.data_recadastro = obj.formatarData(new Date(i.data_recadastro), true);
                i.data_cadastro = obj.formatarData(new Date(i.data_cadastro));
                try {
                    const resultCliente = await select_clientes.buscaPorcodigo(empresa, i.cliente);
                    cliente = resultCliente.length > 0 ? resultCliente[0] : {};
                }
                catch (e) {
                    console.log(`erro ao buscar os produtos do pedido ${i.codigo}`);
                }
                try {
                    produtos = await selectItensPedido.buscaProdutosDoOrcamento(empresa, i.codigo);
                }
                catch (e) {
                    console.log(`erro ao buscar os produtos do pedido ${i.codigo}`);
                }
                try {
                    servicos = await selectItensPedido.buscaServicosDoOrcamento(empresa, i.codigo);
                }
                catch (e) {
                    console.log(`erro ao buscar os servicos do pedido ${i.codigo}`);
                }
                try {
                    parcelas = await selectItensPedido.buscaParcelasDoOrcamento(empresa, i.codigo);
                }
                catch (e) {
                    console.log(`erro ao buscar as parcelas do pedido ${i.codigo}`);
                }
                return {
                    ...i,
                    produtos,
                    servicos,
                    parcelas,
                    cliente
                };
            }));
            return res.status(200).json(orcamentos_registrados);
        }
        catch (error) {
            console.error("Erro ao buscar orcamentos:", error);
            return res.status(500).json({ error: "Erro interno ao buscar orcamentos." });
        }
    }
}
exports.pedidoController = pedidoController;
