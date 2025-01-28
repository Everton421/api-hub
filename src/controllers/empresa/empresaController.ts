import { Request, response, Response } from "express";
import { conn, db_api } from "../../database/databaseConfig";
import { UsuarioApi } from "../../models/usuariosApi/interface";
import { UsuariosApi } from "../../models/usuariosApi/usuarios";
import { Insert_UsuarioEmpresa } from "../../models/usuariosEmpresa/insert";
import { Insert_empresa } from "../../models/empresa/insert";

export class CreateEmpresa {
  async create(request: Request, response: Response) {
    type newUser = Omit<UsuarioApi, "codigo">;

    let obj = new CreateEmpresa();
    let objUsuariosApi = new UsuariosApi();
    let objInertUserEmpresa = new Insert_UsuarioEmpresa();
    let insert_empresa = new Insert_empresa();

    let dbName: any;
    let cnpj: string = request.body.cnpj;
    let usuario: string = String(request.body.usuario);
    let email: string = request.body.email;
    let senha: string = request.body.senha;
    let email_empresa: string = request.body.email_empresa;
    let nome_empresa: string = request.body.nome_empresa;
    let telefone_empresa: string = request.body.telefone_empresa;
    let responsavel: string = "S";

    let objUser: newUser = { usuario, email, cnpj, senha, responsavel };

    if (!cnpj) {
      return response.json({
        erro: true,
        msg: "nao informado o cnpj da empresa ",
      });
    }  
  // Regex para remover caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');  // Remove qualquer caractere que não seja número

  if ( cnpj.length < 11 || cnpj.length > 14 ) {
    return response.json({ erro: true, msg: "CPF/CNPJ inválido."  });
  }else{
    if(cnpj.length === 12 || cnpj.length === 13 ){
    return response.json({ erro: true, msg: "CPF/CNPJ inválido."  });
    }
  }


  dbName = `\`${cnpj}\``;  // Usando o CNPJ formatado como nome do banco


    if (!usuario)
      return response.json({ msg: "nao informado o usuario da empresa " });
    if (!senha)
      return response.json({
        msg: `nao foi informado a senha para o usuario ${usuario} da empresa `,
      });

    let validUserApi: UsuarioApi[] = await objUsuariosApi.selectPorEmail(
      objUser.email
    );
    if (validUserApi.length > 0)
      return response
        .status(200)
        .json({
          msg: ` Já existe usuario cadastro com este email ${objUser.email}`,
        });

    const sqlTables = [
      `CREATE TABLE IF NOT EXISTS ${dbName}.produtos (
     codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
   id  int(10) unsigned NOT NULL DEFAULT 0,
   estoque  double DEFAULT 0,
   preco  double DEFAULT 0,
   grupo  int(11) DEFAULT 0,
   origem  char(1) NOT NULL DEFAULT '0',
   descricao  varchar(255) NOT NULL DEFAULT '',
   num_fabricante  varchar(255) NOT NULL DEFAULT '',
   num_original  varchar(255) DEFAULT NULL DEFAULT '',
   sku  varchar(255) NOT NULL DEFAULT '',
   marca  int(11) DEFAULT 0,
   ativo  char(1) NOT NULL DEFAULT 'S',
   class_fiscal  varchar(255) NOT NULL DEFAULT '',
   cst  char(3) DEFAULT '00',
   data_recadastro  datetime DEFAULT NULL,
   data_cadastro  date NOT NULL DEFAULT '0000-00-00',
   observacoes1  blob DEFAULT NULL,
   observacoes2  blob DEFAULT NULL,
   observacoes3  blob DEFAULT NULL,
   tipo  int(10) NOT NULL DEFAULT 0,
  PRIMARY KEY ( codigo )
 
    );`,
      `CREATE TABLE IF NOT EXISTS ${dbName}.servicos (
           codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
   id  int(10) unsigned NOT NULL DEFAULT 0,
        valor REAL DEFAULT 0,
        aplicacao TEXT NOT NULL,
        tipo_serv INTEGER DEFAULT 0,
        data_cadastro  date NOT NULL DEFAULT '0000-00-00',
        data_recadastro  datetime DEFAULT NULL,
         PRIMARY KEY ( codigo)
    );`,
      `CREATE TABLE IF NOT EXISTS ${dbName}.clientes (
     codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
    id  varchar(255) NOT NULL DEFAULT '0',
    celular  varchar(255) DEFAULT NULL,
    nome  varchar(255) NOT NULL DEFAULT '',
    cep  varchar(255) NOT NULL DEFAULT '00000-000',
    endereco  varchar(255) DEFAULT NULL,
    ie  varchar(255) DEFAULT '',
    numero  varchar(255) DEFAULT '',
    cnpj  varchar(255) DEFAULT '',
    ativo  char(1) NOT NULL DEFAULT 'S',
    cidade  varchar(255) DEFAULT NULL,
    data_cadastro  date NOT NULL DEFAULT '0000-00-00',
    data_recadastro  datetime DEFAULT '0000-00-00 00:00:00',
    vendedor  int(11) NOT NULL DEFAULT 0,
    bairro  varchar(255) DEFAULT NULL,
    estado  char(2) DEFAULT NULL,
    PRIMARY KEY ( codigo )
    );`,
      `CREATE TABLE IF NOT EXISTS ${dbName}.forma_pagamento (
        codigo int(11) unsigned NOT NULL AUTO_INCREMENT,
        id int(10) unsigned NOT NULL DEFAULT 0,
        descricao TEXT NOT NULL, 
        desc_maximo INTEGER DEFAULT 0,  
        parcelas INTEGER DEFAULT 0,  
        intervalo INTEGER DEFAULT 0,  
        recebimento INTEGER DEFAULT 0,
    data_cadastro  date NOT NULL DEFAULT '0000-00-00',
         data_recadastro  datetime DEFAULT NULL,
          PRIMARY KEY (codigo)
    );`,

      `CREATE TABLE IF NOT EXISTS ${dbName}.pedidos (
        codigo bigint(20)  unsigned NOT NULL DEFAULT 0,
         id  int(10) unsigned NOT NULL DEFAULT 0,
         vendedor  int(11) NOT NULL DEFAULT 0,
         situacao  char(2) NOT NULL DEFAULT 'EA',
         contato  varchar(255) DEFAULT NULL,
         descontos  double DEFAULT 0,
         forma_pagamento  int(11) DEFAULT 0,
         observacoes  blob DEFAULT NULL,
         quantidade_parcelas  int(11) DEFAULT 0,
         total_geral  double DEFAULT 0,
         total_produtos  double DEFAULT 0,
         total_servicos  double DEFAULT 0,
         cliente  int(11) NOT NULL DEFAULT 0,
         veiculo  int(11) NOT NULL DEFAULT 0,
         data_cadastro  date NOT NULL DEFAULT '0000-00-00',
         data_recadastro  datetime DEFAULT NULL,
         tipo_os  int(11) DEFAULT 0,
         enviado  enum('N','S') NOT NULL DEFAULT 'S',
         tipo  int(11) NOT NULL DEFAULT 1, 
        PRIMARY KEY (codigo),
        KEY id (id) USING BTREE
    );`,
      `CREATE TABLE IF NOT EXISTS ${dbName}.produtos_pedido (
        pedido bigint(20) unsigned NOT NULL DEFAULT 0,
        codigo INTEGER NOT NULL,
        desconto REAL DEFAULT 0.00,
        quantidade REAL DEFAULT 0.00,
        preco REAL DEFAULT 0.00,
        total REAL DEFAULT 0.00 
    );`,
      `CREATE TABLE IF NOT EXISTS ${dbName}.servicos_pedido (
        pedido bigint(20) unsigned NOT NULL DEFAULT 0,
        codigo INTEGER NOT NULL,
        desconto REAL DEFAULT 0.00,
        quantidade REAL DEFAULT 0.00,
        valor REAL DEFAULT 0.00,
        total REAL DEFAULT 0.00  
    );`,
      `CREATE TABLE IF NOT EXISTS ${dbName}.parcelas (
        pedido bigint(20) unsigned NOT NULL DEFAULT 0,
        parcela INTEGER NOT NULL,
        valor REAL NOT NULL DEFAULT 0.00,
        vencimento date NOT NULL DEFAULT '0000-00-00' 

    );`,
      `CREATE TABLE IF NOT EXISTS ${dbName}.usuarios (
        codigo  int(10)  NOT NULL AUTO_INCREMENT,
        nome TEXT NOT NULL,
        senha TEXT NOT NULL,
        email varchar(255),
        cnpj varchar(255),
        responsavel varchar(255) DEFAULT 'N',
        PRIMARY KEY (codigo) USING BTREE 
    );`,
      `CREATE TABLE IF NOT EXISTS ${dbName}.tipos_os (
                codigo  int(11) NOT NULL,
   id  int(10) unsigned NOT NULL DEFAULT 0,

        descricao TEXT NOT NULL,
    data_cadastro  date NOT NULL DEFAULT '0000-00-00',
         data_recadastro  datetime DEFAULT NULL,
          PRIMARY KEY ( codigo )
    );`,

      `CREATE TABLE IF NOT EXISTS ${dbName}.veiculos (
         codigo  int(11) NOT NULL,
        id int(10) unsigned NOT NULL DEFAULT 0,
        cliente INTEGER NOT NULL DEFAULT 0,
        placa TEXT NOT NULL,
        marca INTEGER NOT NULL DEFAULT 0,
        modelo INTEGER NOT NULL DEFAULT 0,
        ano TEXT NOT NULL,
        cor INTEGER NOT NULL DEFAULT 0,
        combustivel TEXT NOT NULL,
    data_cadastro  date NOT NULL DEFAULT '0000-00-00',
        data_recadastro  datetime DEFAULT NULL,
          PRIMARY KEY ( codigo )
    );`,

      `CREATE TABLE IF NOT EXISTS ${dbName}.api_config (
        codigo INTEGER PRIMARY KEY NOT NULL,
        url TEXT NOT NULL,
        porta INTEGER NOT NULL DEFAULT 3000,
        token TEXT NOT NULL 
    );`,

      `CREATE TABLE IF NOT EXISTS ${dbName}.fotos_produtos(
      produto int(10) unsigned NOT NULL DEFAULT 0,
      sequencia  int(10) unsigned NOT NULL DEFAULT 0,
      descricao  varchar(50) DEFAULT NULL,
       link  text NOT NULL,
      foto  longblob DEFAULT NULL,
    data_cadastro  date NOT NULL DEFAULT '0000-00-00',
       data_recadastro  datetime DEFAULT NULL,
         PRIMARY KEY ( produto , sequencia )
      );`,
     ` CREATE TABLE  ${dbName}.categorias  (
         codigo  int(11) NOT NULL AUTO_INCREMENT,
         id  int(10) unsigned NOT NULL DEFAULT 0,
         data_cadastro  date NOT NULL DEFAULT '0000-00-00',
         data_recadastro  datetime DEFAULT NULL,
         descricao  varchar(255) NOT NULL DEFAULT '',
        PRIMARY KEY ( codigo )
      ) ;
      `,
      ` CREATE TABLE  ${dbName}.marcas  (
        codigo  int(11) NOT NULL AUTO_INCREMENT,
        id  int(10) unsigned NOT NULL DEFAULT 0,
        data_cadastro  date NOT NULL DEFAULT '0000-00-00',
        data_recadastro  datetime DEFAULT NULL,
        descricao  varchar(255) NOT NULL DEFAULT '',
       PRIMARY KEY ( codigo )
     ) ;
     `
    ];

    let sql = ` create database if not exists  ${dbName}  ;  `;

    let valid = await obj.consulta_empresas(cnpj);
    console.log(valid);
    if (valid === true) {
      console.log(` a empresa com o cnpj ${cnpj} ja foi cadastrada!`);

      sqlTables.forEach(async (e) => {
        await conn.query(e, (err, result) => {
          if (err) throw err;
          // else console.log(`tabela registrada com sucesso!`)
        });
      });

      return response.status(200).json({
        erro: true,
        msg: ` a empresa com o cnpj ${cnpj} ja foi cadastrada!`,
      });
    } else {
      await conn.query(sql, async (err, result) => {
        if (err) console.log(err);
        else if (result.affectedRows > 0) {
          sqlTables.forEach(async (e) => {
            await conn.query(e, async (err, result) => {
              if (err) throw err;
              else console.log(`tabela registrada com sucesso!`);
            });
          });

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
            };

            codigoEmpresa = await insert_empresa.registrar_empresa(objEmpresa);
          }

          if (userRegister.insertId > 0) {
            codigoUsuario = await objInertUserEmpresa.insert_usuario(
              dbName,
              objUser
            );
            //return  response.status(200).json({  empresa:`Empresa ${cnpj } registrada com sucesso ! `, usuario:` Usuario ${objUser.usuario} registrado com sucesso!`});
            return response.status(200).json({
              ok: true,
              msg: "Empresa registrada com sucesso!",
              codigo_usuario: codigoUsuario.insertId,
              usuario: usuario,
              senha: senha,
              cnpj: cnpj,
              nome_empresa: nome_empresa,
              email_empresa: email_empresa,
              email_usuario: email,
              codigo_empresa: codigoEmpresa.insertId,
            });
          } else {
            let resultDeleteEmpresa: any = await obj.delete_empresa(dbName);
            if (resultDeleteEmpresa.affectedRows > 0) {
              return response
                .status(200)
                .json({
                  erro: true,
                  msg: ` ocorreu um erro ao registrar a empresa ${cnpj}`,
                });
            }
          }
        }
      });
    }
  }

  async validaExistencia(request: Request, response: Response) {
    let obj = new CreateEmpresa();
    let cnpj: string = request.body.cnpj;

    let valid = await obj.consulta_empresas(cnpj);

    let formatCnpj = `'${cnpj}'`;

    if (valid === true) {
      let dados = await obj.consulta_dados_empresa(formatCnpj);
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

      console.log(` a empresa com o cnpj ${cnpj} ja foi cadastrada!`);
      return response
        .status(200)
        .json({
          cadastrada: true,
          msg: `Já existe uma empresa cadastrada com este cnpj !`,
          cnpj: cnpj_empresa,
          email_empresa: email_empresa,
          telefone_empresa: telefone_empresa,
          nome: nome_empresa,
          codigo: codigo,
          responsavel: responsavel,
        });
    } else {
      return response
        .status(200)
        .json({
          cadastrada: false,
          msg: `Não encontramos empresa cadastrada com este cnpj!`,
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
        `select * from ${db_api}.empresas where cnpj = ${empresa}`,
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
