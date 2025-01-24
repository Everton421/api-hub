"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosController = void 0;
const insert_1 = require("../../models/usuariosEmpresa/insert");
const select_1 = require("../../models/usuariosEmpresa/select");
const usuarios_1 = require("../../models/usuariosApi/usuarios");
class UsuariosController {
    async cadastrar(req, res) {
        let objInsertUser = new insert_1.Insert_UsuarioEmpresa();
        let selectUserEmpresa = new select_1.Select_UsuarioEmpresa();
        let objUserApi = new usuarios_1.UsuariosApi();
        if (!req.body.email)
            return res.status(200).json({ erro: "É necessario informar o email do usuario " });
        if (!req.body.senha)
            return res.status(200).json({ erro: "É necessario informar a senha do usuario " });
        if (!req.body.usuario)
            return res.status(200).json({ erro: "É necessario informar o nome do usuario " });
        if (!req.headers.cnpj)
            res.status(200).json({ erro: "É necessario informar o cnpj da empresa " });
        let email = req.body.email;
        let senha = req.body.senha;
        let usuario = req.body.usuario;
        let headerCnpj = String(req.headers.cnpj);
        let cnpjF = req.headers.cnpj;
        let empresa = headerCnpj.replace(/\D/g, '');
        let cnpj = `\`${empresa}\``;
        let user = { cnpj: cnpjF, email: email, senha: senha, usuario: usuario, responsavel: 'N' };
        let validUserEmpresa = await selectUserEmpresa.buscaPorEmailNome(cnpj, usuario, email);
        let validUserApi = await objUserApi.selectPorEmail(email);
        if (validUserEmpresa.length > 0) {
            return res.status(200).json({ ok: false, msg: `O usuario ${email} já foi cadastrado na empresa !` });
        }
        if (validUserApi.length > 0) {
            return res.status(200).json({ ok: false, msg: `O usuario ${email} já foi cadastrado !` });
        }
        let userCad = await objInsertUser.insert_usuario(cnpj, user);
        if (userCad.insertId > 0) {
            let userApi = {
                usuario: req.body.usuario,
                email: req.body.email,
                cnpj: String(req.headers.cnpj),
                senha: req.body.senha,
                responsavel: 'N'
            };
            await objUserApi.insertUsuario(userApi);
            return res.status(200).json({
                ok: true,
                msg: `usuario registrado com sucesso!`,
                codigo: userCad.insertId,
                usuario: user.usuario,
                senha: user.senha
            });
        }
    }
}
exports.UsuariosController = UsuariosController;
