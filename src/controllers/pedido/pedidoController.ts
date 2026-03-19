import { Request, Response } from "express";
import { Select_clientes } from "../../models/cliente/select";
import { InsertPedido } from "../../models/pedido/insertPedido";
import { SelectPedido } from "../../models/pedido/selectPedido";
import { UpdatePedido } from "../../models/pedido/updatePedido";

import { SelectItensPedido } from "../../models/pedido/selectItens";
import { publishMessage } from "../../services/broker/publish-message";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { DateService } from "../../utils/dateService";
export class pedidoController {


    formatarData(data: Date, comHorario = false) {
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


    async insert(req: Request, res: Response) {

        let obj = new pedidoController();

        const insertPedido = new InsertPedido();
        const selectPedido = new SelectPedido();
        const updatePedido = new UpdatePedido();
        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        if (!decodToken.payload?.cnpj) return res.status(400).json({ erro: true, msg: "Identifiador unico da empresa nao foi informado" });

        let cnpj = decodToken.payload?.cnpj.replace(/\D/g, '');

        const empresa = `\`${cnpj}\``;

        const source = req.headers.source || 'api_internal' as string;

        if (!req.body || req.body.length === 0) return res.status(400).json({ erro: "É necessario informar os pedidos! " })

        //    try{

        let dadosPedidos = req.body;
        const results = await Promise.all(dadosPedidos.map(async (p: any) => {
            let status: string;

            const validPedido: any = await selectPedido.validaExistencia(empresa, p.codigo);

            if (validPedido.length > 0) {
                const pedidoEncontrado = validPedido[0];
                // const data_recad = obj.formatarData(new Date(pedidoEncontrado.data_recadastro), true)

                if (p.data_recadastro > pedidoEncontrado.data_recadastro) {
                    console.log(`atualizando pedido ${p.codigo} ${p.data_recadastro} > ${pedidoEncontrado.data_recadastro} `)
                    await updatePedido.update(empresa, p, p.codigo)

                    await publishMessage(cnpj, 'pedido.atualizado', p, source as string)

                    status = 'atualizado';
                } else {
                    status = ` O pedido ${p.codigo} se encontra atualizado, data mobile: ${p.data_recadastro} data servidor: ${pedidoEncontrado.data_recadastro}`;
                    console.log(status)

                }
            } else {
                await insertPedido.create(empresa, p);
                await publishMessage(cnpj, 'pedido.inserido', p,  source as string)

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


    async select(req: Request, res: Response) {
        let obj = new pedidoController();
        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

        if (!req.query.data) return res.status(400).json({ erro: `é necessario informar uma data` });
        //if (!req.query.vendedor) return res.status(400).json({ erro: `é necessario informar o vendedor` });
        const dateService = new DateService();


        empresa = `\`${empresa}\``;

        let vendedor = Number(req.query.vendedor);
        let data = req.query.data

            if (req.query.data) {

                if (!dateService.isValidDate(req.query.data as string)) {
                    return res.status(400).json({
                        erro: true,
                        msg: "Informe a data no formato YYYY-MM-DD HH:mm:ss"
                    });
                    }

                data = String(req.query.data);
            }


        let selectOrcamento = new SelectPedido();
        let select_clientes = new Select_clientes();
        const selectItensPedido = new SelectItensPedido();

        try {

            const dados_orcamentos: any = await selectOrcamento.buscaPordata(empresa, data, vendedor);
            if (dados_orcamentos.length === 0) return res.status(200).json([]);
            const orcamentos_registrados = await Promise.all(dados_orcamentos.map(async (i: any) => {
                let produtos: any = [];
                let servicos: any = [];
                let parcelas: any = [];
                let cliente: any;

                i.data_recadastro = obj.formatarData(new Date(i.data_recadastro), true);
                // i.data_cadastro = obj.formatarData(new Date(i.data_cadastro));

                try {
                    const resultCliente = await select_clientes.buscaPorcodigo(empresa, i.cliente);
                    cliente = resultCliente.length > 0 ? resultCliente[0] : {};
                } catch (e) { console.log(`erro ao buscar os produtos do pedido ${i.codigo}`) }

                try {
                    produtos = await selectItensPedido.buscaProdutosDoOrcamento(empresa, i.codigo);
                } catch (e) { console.log(`erro ao buscar os produtos do pedido ${i.codigo}`) }

                try {
                    servicos = await selectItensPedido.buscaServicosDoOrcamento(empresa, i.codigo);
                } catch (e) { console.log(`erro ao buscar os servicos do pedido ${i.codigo}`) }

                try {
                    parcelas = await selectItensPedido.buscaParcelasDoOrcamento(empresa, i.codigo);
                } catch (e) { console.log(`erro ao buscar as parcelas do pedido ${i.codigo}`) }

                return {
                    ...i,
                    produtos,
                    servicos,
                    parcelas,
                    cliente
                }
            }))

            return res.status(200).json(orcamentos_registrados);

        } catch (error) {
            console.error("Erro ao buscar orcamentos:", error);
            return res.status(500).json({ error: "Erro interno ao buscar orcamentos." });
        }

    }

    async selectTotais(req: Request, res: Response) {
        let selectOrcamento = new SelectPedido();
        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        empresa = `\`${empresa}\``;

        if (!req.query.vendedor) return res.status(400).json({ erro: `é necessario informar o vendedor` });
        let vendedor = Number(req.query.vendedor);

        try {
            let result = await selectOrcamento.totaisMedia(empresa, vendedor)
            return res.status(200).json(result);
        } catch (e) {
            return res.status(500).json({ error: "Erro interno ao buscar os dados dos orcamentos." });
        }
    }

    async selectUltimosInseridos(req: Request, res: Response) {
        let selectOrcamento = new SelectPedido();
        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        empresa = `\`${empresa}\``;

        if (!req.query.vendedor) return res.status(400).json({ erro: `é necessario informar o vendedor` });
        let vendedor = Number(req.query.vendedor);

        let limit = 7;

        if (req.query.limit) {
            limit = Number(req.query.limit)
        }

        try {
            let result = await selectOrcamento.ultimosInseridos(empresa, vendedor, limit)
            return res.status(200).json(result);
        } catch (e) {
            return res.status(500).json({ error: "Erro interno ao buscar os dados dos orcamentos." });
        }
    }



    async selectTotaiPorData(req: Request, res: Response) {
        let selectOrcamento = new SelectPedido();
        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        empresa = `\`${empresa}\``;

        if (!req.query.vendedor) return res.status(400).json({ erro: `é necessario informar o vendedor` });
        let vendedor = Number(req.query.vendedor);



        try {
            let result = await selectOrcamento.totalPedidosAgrupData(empresa, vendedor)
            return res.status(200).json(result);
        } catch (e) {
            return res.status(500).json({ error: "Erro interno ao buscar os dados dos orcamentos." });
        }
    }

}