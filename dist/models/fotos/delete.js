"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete_fotos = void 0;
const databaseConfig_1 = require("../../database/databaseConfig");
const select_1 = require("./select");
class Delete_fotos {
    async delete(empresa, codigoProduto) {
        const select = new select_1.Select_fotos();
        try {
            await databaseConfig_1.conn.query(`DELETE FROM ${empresa}.fotos_produtos WHERE produto=${codigoProduto}`);
            console.log('imagens deletadas com sucesso!');
        }
        catch (e) {
            console.log('erro ao deletar as imagens do produto:', codigoProduto);
        }
    }
}
exports.Delete_fotos = Delete_fotos;
