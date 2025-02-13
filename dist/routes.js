"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.versao = void 0;
const express_1 = require("express");
const databaseConfig_1 = require("./database/databaseConfig");
require("dotenv/config");
const cheqtoken_1 = require("./middleware/cheqtoken");
const produtoController_1 = require("./controllers/produtos/produtoController");
const clienteController_1 = require("./controllers/cliente/clienteController");
const empresaController_1 = require("./controllers/empresa/empresaController");
const login_1 = require("./controllers/login/login");
const usuariosController_1 = require("./controllers/usuariosController/usuariosController");
const pedidoController_1 = require("./controllers/pedido/pedidoController");
const servicosController_1 = require("./controllers/servicos/servicosController");
const formasController_1 = require("./controllers/formas_pagamento/formasController");
const tipoOsController_1 = require("./controllers/tipos_os/tipoOsController");
const VeiculoController_1 = require("./controllers/veiculo/VeiculoController");
const EnvioCodigoValidador_1 = require("./controllers/recuperarConta/EnvioCodigoValidador");
const alterarSenha_1 = require("./controllers/recuperarConta/alterarSenha");
const categoriaController_1 = require("./controllers/categorias/categoriaController");
const marcasController_1 = require("./controllers/marcas/marcasController");
const fotosController_1 = require("./controllers/fotos/fotosController");
const crypt = require('crypt');
const router = (0, express_1.Router)();
exports.router = router;
exports.versao = '/v1';
router.get(`${exports.versao}/`, async (req, res) => {
    await databaseConfig_1.conn.getConnection(async (err) => {
        if (err) {
            return res.json({ "erro": "falha ao se conectar ao banco de dados1 " });
        }
        else {
            return res.json({ "ok": true });
        }
    });
});
router.get(`${exports.versao}/teste`, cheqtoken_1.checkToken, (req, res) => {
    return res.json({ "ok": true });
});
router.get(`${exports.versao}/offline/produtos`, cheqtoken_1.checkToken, new produtoController_1.ProdutoController().buscaGeral);
router.post(`${exports.versao}/produtos`, cheqtoken_1.checkToken, new produtoController_1.ProdutoController().cadastrar);
router.get(`${exports.versao}/offline/fotos`, cheqtoken_1.checkToken, new fotosController_1.fotosController().buscaGeral);
router.post(`${exports.versao}/offline/fotos`, cheqtoken_1.checkToken, new fotosController_1.fotosController().cadastrar_deletarFotos);
router.get(`${exports.versao}/offline/clientes`, cheqtoken_1.checkToken, new clienteController_1.ClienteController().buscaGeral);
router.post(`${exports.versao}/clientes`, cheqtoken_1.checkToken, new clienteController_1.ClienteController().cadastrar);
router.get(`${exports.versao}/offline/servicos`, cheqtoken_1.checkToken, new servicosController_1.ServicosController().buscaGeral);
router.post(`${exports.versao}/servicos`, cheqtoken_1.checkToken, new servicosController_1.ServicosController().cadastrar);
router.get(`${exports.versao}/offline/formas_pagamento`, cheqtoken_1.checkToken, new formasController_1.FormasController().buscaGeral);
router.post(`${exports.versao}/formas_pagamento`, cheqtoken_1.checkToken, new formasController_1.FormasController().cadastrar);
router.get(`${exports.versao}/offline/tipo_os`, cheqtoken_1.checkToken, new tipoOsController_1.TipoOsController().buscaGeral);
router.get(`${exports.versao}/offline/veiculos`, cheqtoken_1.checkToken, new VeiculoController_1.VeiculoController().busca);
router.get(`${exports.versao}/pedidos`, cheqtoken_1.checkToken, new pedidoController_1.pedidoController().select);
////////
router.post(`${exports.versao}/enviar_codigo`, cheqtoken_1.checkToken, new EnvioCodigoValidador_1.EnvioCodigoValidador().main);
router.post(`${exports.versao}/alterar_senha`, cheqtoken_1.checkToken, new alterarSenha_1.Alterar_senha().main);
router.post(`${exports.versao}/empresa`, cheqtoken_1.checkToken, new empresaController_1.CreateEmpresa().create);
router.post(`${exports.versao}/empresa/validacao`, cheqtoken_1.checkToken, new empresaController_1.CreateEmpresa().validaExistencia);
//
router.post(`${exports.versao}/login`, cheqtoken_1.checkToken, new login_1.Login().login);
router.post(`${exports.versao}/registrar_usuario`, cheqtoken_1.checkToken, new usuariosController_1.UsuariosController().cadastrar);
/////
router.post(`${exports.versao}/pedidos`, cheqtoken_1.checkToken, new pedidoController_1.pedidoController().insert);
////
router.post(`${exports.versao}/offline/categorias`, new categoriaController_1.CategoriaController().cadastrar);
router.get(`${exports.versao}/offline/categorias`, new categoriaController_1.CategoriaController().buscaGeral);
router.get(`${exports.versao}/offline/categorias/:descricao`, new categoriaController_1.CategoriaController().buscaPorDescricao);
////
router.post(`${exports.versao}/offline/marcas`, new marcasController_1.MarcasController().cadastrar);
router.get(`${exports.versao}/offline/marcas`, new marcasController_1.MarcasController().buscaGeral);
router.get(`${exports.versao}/offline/marcas/:descricao`, new marcasController_1.MarcasController().buscaPorDescricao);
//////////// rotas next
router.get(`${exports.versao}/next/produtos/:produto`, cheqtoken_1.checkToken, new produtoController_1.ProdutoController().buscaProdutoNext);
