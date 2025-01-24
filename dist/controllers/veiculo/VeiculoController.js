"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeiculoController = void 0;
const select_1 = require("../../models/veiculo/select");
class VeiculoController {
    async busca(req, res) {
        let selectVeiculos = new select_1.Select_veiculos();
        if (!req.headers.cnpj) {
            return res.status(200).json({ erro: "É necessario informar a empresa " });
        }
        let headerCnpj = req.headers.cnpj;
        let empresa = headerCnpj.replace(/\D/g, '');
        let dbName = `\`${empresa}\``;
        try {
            let dados = await selectVeiculos.buscaGeral(dbName);
            if (dados.length > 0) {
                return res.status(200).json(dados);
            }
            else {
                return res.status(200).json({ "msg": "Nenhum veiculo encontrado!" });
            }
        }
        catch (err) {
            return res.status(500).json({ erro: "Erro ao buscar veiculos." });
        }
    }
}
exports.VeiculoController = VeiculoController;
