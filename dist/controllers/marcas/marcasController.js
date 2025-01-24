"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarcasController = void 0;
const select_1 = require("../../models/marcas/select");
const insert_1 = require("../../models/marcas/insert");
class MarcasController {
    formatarDataEhora(data) {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!regex.test(data)) {
            return null;
        }
        return data;
    }
    formatarData(data) {
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        return `${ano}-${mes}-${dia}`;
    }
    obterDataAtual() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia}`;
    }
    obterDataHoraAtual() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        const hora = dataAtual.getHours();
        const minuto = dataAtual.getMinutes();
        const segundos = dataAtual.getSeconds();
        return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundos}`;
    }
    async buscaGeral(req, res) {
        let empresa = req.headers.cnpj;
        let select = new select_1.Select_Marcas();
        let insert = new insert_1.Insert_Marcas();
        if (!req.headers.cnpj) {
            return res.status(200).json({ erro: "É necessario informar a empresa " });
        }
        let headerCnpj = empresa.replace(/\D/g, '');
        let dbName = `\`${headerCnpj}\``;
        try {
            let resultado = await select.busca_geral(dbName);
            if (resultado.length > 0) {
                return res.status(200).json(resultado);
            }
            else {
                return res.status(404).json({ erro: "Nenhuma marca encontrada." });
            }
        }
        catch (e) {
            console.log("ocorreu um erro ao consultar as marcas", e);
            return res.status(200).json({ erro: true, msg: "ocorreu um erro ao consultar as marcas" });
        }
    }
    async buscaPorDescricao(req, res) {
        let empresa = req.headers.cnpj;
        let select = new select_1.Select_Marcas();
        let insert = new insert_1.Insert_Marcas();
        if (!req.headers.cnpj) {
            return res.status(200).json({ erro: true, msg: "É necessario informar a empresa " });
        }
        let headerCnpj = empresa.replace(/\D/g, '');
        let descricao = req.params.descricao;
        let dbName = `\`${headerCnpj}\``;
        try {
            let resultado = await select.busca_por_descricao(dbName, descricao);
            return res.status(200).json(resultado);
        }
        catch (e) {
            console.log("ocorreu um erro ao consultar as marcas", e);
            return res.status(200).json({ erro: true, msg: "ocorreu um erro ao consultar as marcas" });
        }
    }
    async cadastrar(req, res) {
        let obj = new MarcasController();
        let cnpj = req.headers.cnpj;
        let select = new select_1.Select_Marcas();
        let insert = new insert_1.Insert_Marcas();
        let postMarca = req.body;
        let empresa = `\`${cnpj}\``;
        if (!postMarca.id)
            postMarca.id = "0";
        if (!postMarca.descricao)
            return res.status(200).json({ erro: true, msg: `E necessario informar a descricao da marca!` });
        if (!postMarca.data_cadastro)
            postMarca.data_cadastro = obj.obterDataAtual();
        if (!postMarca.data_recadastro)
            postMarca.data_recadastro = obj.obterDataHoraAtual();
        let validMarca = await select.busca_por_descricao(empresa, postMarca.descricao);
        if (validMarca.length > 0)
            return res.status(200).json({ erro: true, msg: `A marca ${postMarca.descricao} ja foi cadastrada!` });
        let responseMarca;
        try {
            responseMarca = await insert.cadastrar(empresa, postMarca);
            if (responseMarca.insertId > 0) {
                return res.status(200).json({
                    "codigo": responseMarca.insertId,
                    "descricao": postMarca.descricao,
                    "data_cadastro": postMarca.data_cadastro,
                    "data_recadastro": postMarca.data_recadastro,
                });
            }
        }
        catch (e) {
            console.log(e);
            return res.status(200).json({ erro: "ocorreu um erro ao tentar registrar a marca" });
        }
    }
}
exports.MarcasController = MarcasController;
