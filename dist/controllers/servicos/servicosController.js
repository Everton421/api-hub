"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicosController = void 0;
const select_1 = require("../../models/servicos/select");
const insert_1 = require("../../models/servicos/insert");
class ServicosController {
    async buscaGeral(req, res) {
        let empresa = req.headers.cnpj;
        let select = new select_1.Select_servicos();
        if (!empresa) {
            return res.json(400).json({ erro: "É necessario informar a empresa " });
        }
        let headerCnpj = String(req.headers.cnpj);
        empresa = headerCnpj.replace(/\D/g, '');
        let dbName = `\`${empresa}\``;
        let servicos;
        try {
            servicos = await select.buscaGeral(dbName);
            if (servicos.length === 0) {
                return res.status(404).json({ erro: "Nenhum servico encontrado." });
            }
            return res.status(200).json(servicos);
        }
        catch (e) {
            console.error(e);
            return res.status(500).json({ erro: "Erro ao buscar servico." });
        }
    }
    async cadastrar(req, res) {
        let empresa = req.headers.cnpj;
        if (!empresa) {
            return res.json(400).json({ erro: "É necessario informar a empresa " });
        }
        let dbName = `\`${empresa}\``;
        let insert = new insert_1.InsertServico();
        function obterDataAtual() {
            const dataAtual = new Date();
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const ano = dataAtual.getFullYear();
            return `${ano}-${mes}-${dia}`;
        }
        function obterDataHoraAtual() {
            const dataAtual = new Date();
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const ano = dataAtual.getFullYear();
            const hora = dataAtual.getHours();
            const minuto = dataAtual.getMinutes();
            const segundos = dataAtual.getSeconds();
            return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundos}`;
        }
        console.log(req.body);
        if (!req.body.tipo_serv)
            req.body.tipo_serv = 0;
        if (!req.body.valor)
            req.body.valor = 0;
        if (!req.body.aplicacao)
            return res.status(200).json({ erro: true, msg: "É necessario informar a descrição para registrar o servico!" });
        if (!req.body.data_cadastro)
            req.body.data_cadastro = obterDataAtual();
        if (!req.body.data_recadastro)
            req.body.data_recadastro = obterDataHoraAtual();
        let servico = {
            "valor": req.body.valor,
            "aplicacao": req.body.aplicacao,
            "tipo_serv": req.body.tipo_serv,
            "data_cadastro": req.body.data_cadastro,
            "data_recadastro": req.body.data_recadastro,
        };
        try {
            let resultinsertId = await insert.insert(dbName, servico);
            return res.status(200).json({
                "codigo": resultinsertId.insertId,
                "valor": req.body.valor,
                "aplicacao": req.body.aplicacao,
                "tipo_serv": req.body.tipo_serv,
                "data_cadastro": req.body.data_cadastro,
                "data_recadastro": req.body.data_recadastro,
            });
        }
        catch (e) {
            return res.status(200).json({ erro: true, msg: `Ocorreu um erro ao cadastrar o servico!` });
        }
    }
}
exports.ServicosController = ServicosController;
