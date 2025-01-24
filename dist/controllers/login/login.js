"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const select_1 = require("../../models/usuariosEmpresa/select");
const usuarios_1 = require("../../models/usuariosApi/usuarios");
class Login {
    async login(req, res) {
        let selectUserApi = new usuarios_1.UsuariosApi();
        let selectUserEmpresa = new select_1.Select_UsuarioEmpresa();
        if (!req.body.email) {
            return res.status(200).json({ msg: `É necessario informar o email` });
        }
        ;
        if (!req.body.senha) {
            return res.status(200).json({ msg: `É necessario informar a senha` });
        }
        ;
        let { email, senha } = req.body;
        let validUserEmail = await selectUserApi.selectPorEmail(email);
        if (validUserEmail.length > 0) {
            let validPassword = validUserEmail[0].senha;
            if (validPassword !== senha) {
                return res.status(200).json({ msg: ` senha incorreta!` });
            }
        }
        else {
            return res.status(200).json({ msg: `usuario nao encontrado!` });
        }
        let validUserApi = await selectUserApi.selectPorEmailSenha(email, senha);
        if (validUserApi.length > 0) {
            //     let empresa = `\`${validUserApi[0].cnpj }\``;
            let empresa = validUserApi[0].cnpj.replace(/\D/g, '');
            empresa = `\`${empresa}\``;
            let arrUser = await selectUserEmpresa.buscaPorEmailSenha(empresa, email, senha);
            if (arrUser.length > 0) {
                let useLogin = arrUser[0];
                return res.status(200).json({
                    ok: true,
                    email: useLogin.email,
                    senha: useLogin.senha,
                    empresa: validUserApi[0].cnpj,
                    codigo: useLogin.codigo,
                    nome: useLogin.nome
                });
            }
        }
        return res.status(200).json(req.body);
    }
}
exports.Login = Login;
