import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { conn, db_api } from "../../database/databaseConfig";
import { registerDados } from "../../database/seeds/dados-teste/dadosTeste";
import { Insert_empresa } from "../../models/empresa/insert";
import { UsuarioApi } from "../../models/usuariosApi/interface";
import { UsuariosApi } from "../../models/usuariosApi/usuarios";
import { Insert_UsuarioEmpresa } from "../../models/usuariosEmpresa/insert";
import { DateService } from "../../utils/dateService";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { CompanyStructure } from "../../database/tables-structures/company-structure";

export class CreateEmpresa {

  async create(request: Request, response: Response) {
    type newUserOmitCode = Omit<UsuarioApi, "codigo">;
    type ativo = { ativo: 'S' | 'N' }
    type newUser = newUserOmitCode & ativo
    let obj = new CreateEmpresa();
    let objUsuariosApi = new UsuariosApi();
    let objInertUserEmpresa = new Insert_UsuarioEmpresa();
    let insert_empresa = new Insert_empresa();
    let dateService = new DateService();
    const companyStructure = new CompanyStructure();

    if (!request.body.usuario) return response.status(400).json({ erro: true, msg: "nao informado o usuario da empresa " });

    if (!request.body.empresa)
      return response.status(400).json({
        erro: true,
        msg: `nao foi informado os dados da empresa `,
      });

    if (!request.body.empresa.cnpj) return response.status(400).json({ erro: true, msg: "nao informado o cnpj da empresa " });
    if (!request.body.empresa.email_empresa) return response.status(400).json({ erro: true, msg: "nao informado o email da empresa " });
    if (!request.body.empresa.nome_empresa) return response.status(400).json({ erro: true, msg: "nao informado o nome da empresa " });
    if (!request.body.empresa.telefone_empresa) return response.status(400).json({ erro: true, msg: "nao informado o telefone da empresa " });

    if (!request.body.usuario.nome) return response.status(400).json({ erro: true, msg: "nao informado o nome do usuario reponsavel pela empresa " });
    if (!request.body.usuario.senha) return response.status(400).json({ erro: true, msg: "nao informado a senha do usuario reponsavel pela empresa " });
    if (!request.body.usuario.email) return response.status(400).json({ erro: true, msg: "nao informado o email do usuario reponsavel pela empresa " });
    if (!request.body.usuario.telefone) return response.status(400).json({ erro: true, msg: "nao informado o telefone do usuario reponsavel pela empresa " });


    let dbName: any;
    let cnpj: string = request.body.empresa.cnpj;

    let nome: string = String(request.body.usuario.nome);
    let email: string = request.body.usuario.email;
    let senha: string = request.body.usuario.senha;
    let telefone: string = String(request.body.usuario.telefone)

    let email_empresa: string = request.body.empresa.email_empresa;
    let nome_empresa: string = request.body.empresa.nome_empresa;
    let telefone_empresa: string = request.body.empresa.telefone_empresa;
    const ativo = 'S'
    const dadosTeste: boolean = request.body.empresa.dados_teste;

    let responsavel: string = "S";

    let tipo_contrato = request.body.empresa.tipo_contrato  || 'T'
    let data_contrato = dateService.obterDataAtual();
    let dias_contrato = 30;
    let inicio_contrato = dateService.obterDataAtual();
    let fim_contrato = '0000-00-00'

    cnpj = cnpj.replace(/\D/g, '');  // Remove qualquer caractere que não seja número

    let objUser: newUser = { nome, email, cnpj, senha, responsavel, telefone, ativo };

    // Regex para remover caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');  // Remove qualquer caractere que não seja número

    if (cnpj.length < 11 || cnpj.length > 14) {
      return response.status(400).json({ erro: true, msg: "CPF/CNPJ inválido." });
    } else {
      if (cnpj.length === 12 || cnpj.length === 13) {
        return response.status(400).json({ erro: true, msg: "CPF/CNPJ inválido." });
      }
    }

    dbName = `\`${cnpj}\``;  // Usando o CNPJ formatado como nome do banco

    let validUserApi: UsuarioApi[] = await objUsuariosApi.selectPorEmail(
      objUser.email
    );
    if (validUserApi.length > 0)
      return response
        .status(400)
        .json({
          erro: true,
          msg: ` Já existe usuario cadastro com este email ${objUser.email}`,
        });

    let valid = await obj.consulta_empresas(cnpj);
    console.log(valid);
    if (valid === true) {
      console.log(` a empresa com o cnpj ${cnpj} ja foi cadastrada!`);
      return response.status(400).json({
        erro: true,
        msg: ` a empresa com o cnpj ${cnpj} ja foi cadastrada!`,
      });
      
    } else {
        const resultcompanyStructure =  await companyStructure.createStructure(cnpj);
        console.log(resultcompanyStructure);
        
         let codigoUsuario: any;
                  let userRegister: any = await objUsuariosApi.insertUsuario(objUser);
                  let codigoEmpresa: any;
        
                  if (userRegister.insertId > 0) {
                    let objEmpresa = {
                      responsavel: userRegister.insertId,
                      cnpj: cnpj,
                      nome_empresa: nome_empresa,
                      email_empresa: email_empresa,
                      telefone_empresa: telefone_empresa,
                      tipo_contrato: tipo_contrato,
                      data_contrato: data_contrato,
                      dias_contrato: dias_contrato,
                      inicio_contrato: inicio_contrato,
                      fim_contrato: fim_contrato
                    };
        
                    codigoEmpresa = await insert_empresa.registrar_empresa(objEmpresa);
                    if (request.body.empresa.dados_teste && dadosTeste === true) {
        
                      let resutl = await registerDados(dbName);
                      if (resutl.sucess === false) {
                        return response.status(500).json({ msg: resutl.message });
                      }
        
                    }
                  }
        
                  if (userRegister.insertId > 0) {
                    codigoUsuario = await objInertUserEmpresa.insert_usuario(dbName, objUser);
        
                    const secret = process.env.SECRET
        
                    if (!secret) {
                      console.error("Erro crítico: JWT_SECRET não está definido!");
                      return response.status(500).json({ msg: "Erro interno do servidor [JWT Secret Missing]." });
                    }
        
                    const payload = {
                      cnpj: cnpj,
                      email: email,
                      senha: senha
                    }
                    const token = jwt.sign(
                      payload, secret
                    )
        
                    return response.status(200).json(
                      {
                        "status": {
                          ok: true,
                          msg: "Empresa registrada com sucesso!",
        
                        },
                        "data": {
                          "usuario": {
                            codigo_usuario: codigoUsuario.insertId,
                            usuario: nome,
                            senha: senha,
                            token: token,
                            email_usuario: email,
                          },
                          "empresa": {
                            cnpj: cnpj,
                            nome_empresa: nome_empresa,
                            email_empresa: email_empresa,
        
                            codigo_empresa: codigoEmpresa.insertId,
                          }
        
                        }
                      }
        
                    );
                  } else {
                    let resultDeleteEmpresa: any = await obj.delete_empresa(dbName);
                    if (resultDeleteEmpresa.affectedRows > 0) {
                      return response
                        .status(400)
                        .json({
                          erro: true,
                          msg: ` ocorreu um erro ao registrar a empresa ${cnpj}`,
                        });
                    }
                  }
                }
    }

  async validaExistencia(request: Request, response: Response) {
    if (!request.headers.token) {
      return response.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(request.headers.token))
    let empresa = String(decodToken.payload?.cnpj.replace(/\D/g, ''));

    let obj = new CreateEmpresa();
    let formatCnpj = `'${empresa}'`;

    let valid = await obj.consulta_empresas(empresa);

    if (valid === true) {
      let dados = await obj.consulta_dados_empresa(empresa);
      let nome_empresa;
      let telefone_empresa;
      let email_empresa;
      let cnpj_empresa;
      let codigo;
      let responsavel;

      if (dados.length > 0) {
        cnpj_empresa = dados[0].cnpj;
        email_empresa = dados[0].email;
        telefone_empresa = dados[0].telefone;
        nome_empresa = dados[0].nome;
        codigo = dados[0].codigo;
        responsavel = dados[0].responsavel;
      }

      return response
        .status(200)
        .json(
          {
            status: {
              cadastrada: true,
              msg: `Já existe uma empresa cadastrada com este cnpj !`,
            },
            data: {
              cnpj: cnpj_empresa,
              email_empresa: email_empresa,
              telefone_empresa: telefone_empresa,
              nome: nome_empresa,
              codigo: codigo,
              responsavel: responsavel,
            }
          }
        );
    } else {
      return response
        .status(200)
        .json({
          status: {
            cadastrada: false,
            msg: `Não encontramos empresa cadastrada com este cnpj!`,
          },
          data: {}
        });
    }
  }

  async consulta_empresas(empresa: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      await conn.query(`SHOW DATABASES`, (err, result) => {
        if (err) reject(err);
        else if (result.length > 0) {
          let valid = result.some((e: any) => e.Database === empresa);
          resolve(valid);
        }
      });
    });
  }
  async consulta_dados_empresa(empresa: string) {
    console.log(`select * from ${db_api}.empresas where cnpj = ${empresa}`);
    return new Promise<any[]>(async (resolve, reject) => {
      await conn.query(
        `select 
        *,
                DATE_FORMAT(data_contrato, '%Y-%m-%d') as data_contrato,
                DATE_FORMAT(inicio_contrato, '%Y-%m-%d') as inicio_contrato,
                DATE_FORMAT(fim_contrato, '%Y-%m-%d') as fim_contrato 
         from ${db_api}.empresas where cnpj = ${empresa}`,

        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async delete_empresa(empresa: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      await conn.query(`DROP DATABASE ${empresa}`, (err, result) => {
        if (err) reject(err);
        else console.log(result);
        // if( result.length > 0 ){
        //  let valid = result.some(( e:any ) => e.Database === empresa   );
        //     resolve(valid)
        // }
      });
    });
  }
}
