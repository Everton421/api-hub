"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoOsController = void 0;
const select_1 = require("../../models/tipos_os/select");
class TipoOsController {
    async buscaGeral(req, res) {
        let empresa = req.headers.cnpj;
        let select = new select_1.SelectTipo_os();
        if (!empresa) {
            return res.json(400).json({ erro: "É necessario informar a empresa " });
        }
        let headerCnpj = String(req.headers.cnpj);
        empresa = headerCnpj.replace(/\D/g, '');
        let dbName = `\`${empresa}\``;
        let tipoOS;
        try {
            tipoOS = await select.buscaGeral(dbName);
            if (tipoOS.length === 0) {
                return res.status(404).json({ erro: "Nenhum tipo de os encontrado." });
            }
            return res.status(200).json(tipoOS);
        }
        catch (e) {
            console.error(e);
            return res.status(500).json({ erro: "Erro ao buscar  tipos de os pagamento." });
        }
    }
}
exports.TipoOsController = TipoOsController;
