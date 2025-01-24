"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fotosController = void 0;
const select_1 = require("../../models/fotos/select");
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
}
exports.fotosController = fotosController;
