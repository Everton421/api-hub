import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { UsuariosApi } from "../../models/usuariosApi/usuarios";
import { Select_UsuarioEmpresa } from "../../models/usuariosEmpresa/select";
import { validaContratoLogin } from "../../services/validaContrato/validaContrato";

export class Login {
    async login(req: Request, res: Response) {
        let selectUserApi = new UsuariosApi();
        let selectUserEmpresa = new Select_UsuarioEmpresa();

        if (!req.body.email) return res.status(400).json({ erro: true, msg: `É Necessario Informar o Email` });

        if (!req.body.senha || req.body.senha === '') return res.status(400).json({ erro: true, msg: `É Necessario Informar a Senha` });

        let { email, senha } = req.body

        let validUserEmail = await selectUserApi.selectPorEmail(email);

        if (validUserEmail.length > 0) {
            let validPassword = validUserEmail[0].senha
            if (validPassword !== String(senha)) {
                return res.status(400).json({ erro: true, msg: `Senha Incorreta!` });
            }

        } else {
            return res.status(400).json({ erro: true, msg: `Usuário não Encontrado!` });

        }


        let validUserApi = await selectUserApi.selectPorEmailSenha(email, senha);

        if (validUserApi.length > 0) {

            //     let empresa = `\`${validUserApi[0].cnpj }\``;

            let empresa = validUserApi[0].cnpj.replace(/\D/g, '');
            empresa = `\`${empresa}\``;


            let resultValidContrato = await validaContratoLogin(validUserApi[0].cnpj)

            if (resultValidContrato.valido === false) {
                return res.status(400).json(
                    {
                        erro: true,
                        tipo_contrato: resultValidContrato.tipo_contrato,
                        msg: resultValidContrato.tipo_contrato === 'T' ? 'Período de teste Expirado.' : `${resultValidContrato.motivo}`
                    });

            }

            //   console.log(resultValidContrato)


            let arrUser = await selectUserEmpresa.buscaPorEmailSenha(empresa, email, senha);
            if (arrUser.length > 0) {

                let useLogin: any = arrUser[0];
                return res.status(200).json(
                    {
                        status: {
                            ok: true
                        },
                        data: {
                            email: useLogin.email,
                            senha: useLogin.senha,
                            empresa: validUserApi[0].cnpj,
                            codigo: useLogin.codigo,
                            nome: useLogin.nome,
                            tipo_contrato: useLogin.tipo_contrato,
                            data_contrato: useLogin.data_contrato,
                            dias_contrato: useLogin.dias_contrato
                        }
                    })
            }

        }


        //  return res.status(200).json(req.body)
    }


    async login2(req: Request, res: Response) {
        let selectUserApi = new UsuariosApi();
        let selectUserEmpresa = new Select_UsuarioEmpresa();

        if (!req.body.email) return res.status(400).json({ erro: true, msg: `É Necessario Informar o Email` });

        if (!req.body.senha || req.body.senha === '') return res.status(400).json({ erro: true, msg: `É Necessario Informar a Senha` });

        let { email, senha } = req.body
    
        let validUserEmail =  await selectUserApi.selectPorEmail(email);


        if (validUserEmail.length > 0) {
            let validPassword = validUserEmail[0].senha
            if (validPassword !== String(senha)) {
                return res.status(400).json({ erro: true, msg: `Senha Incorreta!` });
            }

        } else {
            return res.status(400).json({ erro: true, msg: `Usuário não Encontrado!` });
        }

        try {
            let validUserApi = await selectUserApi.selectPorEmailSenha(email, senha);
            let nomeUsuario = '';
            let codigoUsuario;
            if (validUserApi.length > 0) {

                let cnpj = validUserApi[0].cnpj;
                nomeUsuario = validUserApi[0].nome
                let databaseName = validUserApi[0].cnpj.replace(/\D/g, '');

               let empresa = `\`${databaseName}\``;
                
                    let resultUserEmpr = await selectUserEmpresa.buscaPorEmail(empresa, email);
                    if(resultUserEmpr.length === 0 ){
                        console.log(`Não foi encontrado usuario com o email :${email} no banco de dados da empresa ` );
                        return res.status(500).json({ msg: "Erro interno do servidor durante a autenticação!" })
                    }

                    codigoUsuario = resultUserEmpr[0].codigo

                let resultValidContrato = await validaContratoLogin(validUserApi[0].cnpj)

                if (resultValidContrato.valido === false) {
                    return res.status(400).json(
                        {
                            erro: true,
                            tipo_contrato: resultValidContrato.tipo_contrato,
                            msg: resultValidContrato.tipo_contrato === 'T' ? 'Período de teste Expirado.' : `${resultValidContrato.motivo}`
                        });

                }

                const secret = process.env.SECRET
                const payload = {
                    cnpj: cnpj,
                    email: email,
                    senha: senha,
                    codigo: codigoUsuario
                }

                if (!secret) {
                    console.error("Erro crítico: JWT_SECRET não está definido!");
                    return res.status(500).json({ msg: "Erro interno do servidor [JWT Secret Missing]." });
                }

                const token = jwt.sign(
                    payload, secret
                )
                return res.json({
                    msg: "Autenticação bem sucedida!",
                    token: token,
                    usuario: nomeUsuario,
                    codigo: codigoUsuario
                })

            }else{
                console.log("Usuario não encontrado.")
            }
        } catch (e) {
            console.log('ocorreu um erro ao tentar fazer o login!');
            return res.status(500).json({ msg: "Erro interno do servidor durante a autenticação!" })
        }
    }
}