"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fotosController = void 0;
const select_1 = require("../../models/fotos/select");
const delete_1 = require("../../models/fotos/delete");
const insert_1 = require("../../models/fotos/insert");
class fotosController {
    async buscaGeral(req, res) {
        let empresa = req.headers.cnpj;
        let select = new select_1.Select_fotos();
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
                return res.status(200).json({ erro: "Nenhuma foto encontrada." });
            }
        }
        catch (e) {
            console.log("ocorreu um erro ao consultar as fotos dos produtos", e);
            return res.status(200).json({ erro: true, msg: "ocorreu um erro ao consultar as fotos dos produtos" });
        }
    }
    async cadastrar_deletarFotos(req, res) {
        let empresa = req.headers.cnpj;
        const select = new select_1.Select_fotos();
        const deletar = new delete_1.Delete_fotos();
        const insert = new insert_1.Insert_fotos();
        if (!req.headers.cnpj) {
            return res.status(200).json({ erro: "É necessario informar a empresa " });
        }
        let headerCnpj = empresa.replace(/\D/g, '');
        let dbName = `\`${headerCnpj}\``;
        if (!req.body.fotos)
            return res.status(200).json({ erro: "é necessario informar as fotos do produto" });
        if (!req.body.codigo)
            return res.status(200).json({ erro: "é necessario informar o codigo do produto" });
        let dados = req.body.fotos;
        let codigo_produto = req.body.codigo;
        try {
            let validItems = await select.buscaPorProduto(dbName, codigo_produto);
            if (validItems.length > 0) {
                await deletar.delete(dbName, codigo_produto);
                for (let i of dados) {
                    await insert.cadastrar(dbName, i);
                }
            }
            res.status(200).json({ erro: false, msg: 'fotos alteradas com sucesso' });
        }
        catch (e) {
            res.status(200).json({ erro: true, msg: 'erro ao registrar as fotos do produto', codigo_produto });
        }
    }
}
exports.fotosController = fotosController;
