import { Request, Response } from "express";
import { UsuariosApi } from "../../models/usuariosApi/usuarios";
import { Insert_UsuarioEmpresa } from "../../models/usuariosEmpresa/insert";
import { Select_UsuarioEmpresa } from "../../models/usuariosEmpresa/select";
import { DecodedToken } from "../../services/decoded-token/decodedToken";

export class UsuariosController {



    async cadastrar(req: Request, res: Response) {


        let usuarioEmpresa = new Insert_UsuarioEmpresa();
        let selectUserEmpresa = new Select_UsuarioEmpresa();
        let usuarioApi = new UsuariosApi();

        if (!req.headers.token) return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });

        if (!req.body.email) return res.status(400).json({ erro: true, msg: "É necessario informar o email do usuario " })
        if (!req.body.senha) return res.status(400).json({ erro: true, msg: "É necessario informar a senha do usuario " })
        if (!req.body.nome) return res.status(400).json({ erro: true, msg: "É necessario informar o nome do usuario " })

        let email = req.body.email;
        let senha = req.body.senha;
        let nome = req.body.nome;

        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        let dbName = `\`${empresa}\``;


        let user: any = { cnpj: empresa, email: email, senha: senha, nome: nome, responsavel: 'N' };


        let validUserEmpresa = await selectUserEmpresa.buscaPorEmailNome(dbName, nome, email);

        let validUserApi = await usuarioApi.selectPorEmail(email);

        if (validUserEmpresa.length > 0) {
            return res.status(400).json({ erro: true, msg: `O usuario ${email} já foi cadastrado na empresa !` })
        }

        if (validUserApi.length > 0) {
            return res.status(400).json({ erro: true, msg: `O usuario ${email} já foi cadastrado !` })
        }

        let userCad: any = await usuarioEmpresa.insert_usuario(dbName, user)
        if (userCad.insertId > 0) {
            let userApi: any = {
                nome: req.body.nome,
                email: req.body.email,
                cnpj: empresa,
                senha: req.body.senha,
                responsavel: 'N'
            }

            await usuarioApi.insertUsuario(userApi)
            return res.status(200).json(
                {
                    codigo: userCad.insertId,
                    usuario: user.nome,
                    senha: user.senha
                }
            )
        }

    }



    async busca(req: Request, res: Response) {
        let selectUserEmpresa = new Select_UsuarioEmpresa();
        if (!req.headers.token) return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });

        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        let dbName = `\`${empresa}\``;
        try {

            let resultado: any = await selectUserEmpresa.buscaGeral(dbName)
            console.log(resultado)
            if (resultado.length > 0) {
                return res.status(200).json(resultado)
            } else {
                return res.status(404).json({ erro: "Nenhum usuario encontrado." });
            }

        } catch (e) {
            console.log("ocorreu um erro ao consultar os usuarios", e)
            return res.status(400).json({ erro: true, msg: "ocorreu um erro ao consultar os usuarios" })
        }
    }
}