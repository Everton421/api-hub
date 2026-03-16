import { Request, Response } from "express";
import { InsertServico } from "../../models/servicos/insert";
import { Select_servicos } from "../../models/servicos/select";
import { updateServico } from "../../models/servicos/update";
import { publishMessage } from "../../services/broker/publish-message";
import { DateService } from "../../utils/dateService";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
type service = {
  codigo: number,
  id: number,
  valor: number,
  aplicacao: string,
  tipo_serv: number,
  data_cadastro: string,
  data_recadastro: string
}

export class ServicosController {



  async findAll(req: Request, res: Response) {

    let select = new Select_servicos();


    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
    let dbName = `\`${empresa}\``;

    let servicos: any
    let data_recadastro: string = '';
    if (req.query.data_recadastro) {
      data_recadastro = String(req.query.data_recadastro);
    }

    try {
      servicos = await select.buscaGeral(dbName, data_recadastro)
      return res.status(200).json(servicos);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: true, msg: "Erro ao buscar servico." });
    }

  }

  async findByCode(req: Request, res: Response) {

    let select = new Select_servicos();
    let codigo = Number(req.query.codigo);

    if (!req.query.codigo) {
      return res.json(400).json({ erro: "É necessario informar o codigo do servico " });
    }

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
    let dbName = `\`${empresa}\``;


    let servicos: any

    try {
      servicos = await select.buscaPorCodigo(dbName, codigo)

      if (servicos.length === 0) {
        return res.status(200).json({ msg: "Nenhum servico encontrado." });
      }
      return res.status(200).json(servicos);

    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: "Erro ao buscar servico." });
    }

  }



  async insert(req: Request, res: Response) {

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    if (!decodToken.payload?.cnpj) return res.status(400).json({ erro: true, msg: "Identifiador unico da empresa nao foi informado" });

    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
    const source = String(req.headers.source) || 'api_internal';

    let dbName = `\`${empresa}\``;

    let insert = new InsertServico();
    let dateService = new DateService();


    if (!req.body.tipo_serv) req.body.tipo_serv = 0
    if (!req.body.valor) req.body.valor = 0
    if (!req.body.ativo) req.body.ativo = 'S'
    if (!req.body.id) return res.status(400).json({ erro: true, msg: "É necessario informar o id registrar o servico!" });

    if (!req.body.aplicacao) return res.status(400).json({ erro: true, msg: "É necessario informar a descrição para registrar o servico!" });
    if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual();
    if (!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();

    let servico = {
        "id": req.body.id,
      "valor": req.body.valor,
      "aplicacao": req.body.aplicacao,
      "tipo_serv": req.body.tipo_serv,
      "data_cadastro": req.body.data_cadastro,
      "data_recadastro": req.body.data_recadastro,
      "ativo": req.body.ativo

    }

    try {
      let resultinsertId: any = await insert.insert(dbName, servico);

      const item = {

        "codigo": resultinsertId.insertId,
        "id": req.body.id,
        "valor": req.body.valor,
        "aplicacao": req.body.aplicacao,
        "tipo_serv": req.body.tipo_serv,
        "data_cadastro": req.body.data_cadastro,
        "data_recadastro": req.body.data_recadastro,
        "ativo": req.body.ativo
      }
      await publishMessage(empresa, 'servico.inserido', item, source)

      return res.status(200).json(item);
    } catch (e) {
      console.log('Ocorreu um erro ao cadastrar o servico!', e);
      return res.status(400).json({ erro: true, msg: `Ocorreu um erro ao cadastrar o servico!` });

    }

  }



  async buscaServicosNext(req: Request, res: Response) {


    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

    let dbName = `\`${empresa}\``;

    let select = new Select_servicos();
    let servico: service[] = [];

    const parametro = req.params.servico;

    try {
      servico = await select.buscaPorCodigoDescricao(dbName, parametro)
      if (servico.length === 0) {
        return res.status(400).json({ erro: true, msg: "Nenhum servico encontrado." });
      }
      return res.status(200).json(servico);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: true, msg: "Erro ao buscar servicos." });
    }
  }

  async findByParam(req: Request, res: Response) {

    let select = new Select_servicos();

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
    let dbName = `\`${empresa}\``;

    let servicos;

    try {
      if (req.query) {
        servicos = await select.novaBusca(dbName, req.query)
      }
      return res.status(200).json(servicos);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: true, msg: "Erro ao buscar os serviços." });
    }
  }


  async update(req: Request, res: Response) {

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    if (!decodToken.payload?.cnpj) return res.status(400).json({ erro: true, msg: "Identifiador unico da empresa nao foi informado" });
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
    let dbName = `\`${empresa}\``;
    const source = String(req.headers.source) || 'api_internal';

    let update = new updateServico();
    let dateService = new DateService();



    if (!req.body.tipo_serv) req.body.tipo_serv = 0
    if (!req.body.id) req.body.id = 0;
    if (!req.body.valor) req.body.valor = 0
    if (!req.body.codigo) return res.status(400).json({ erro: true, msg: "É necessario informar o codigo para atualizar o servico!" });
    if (!req.body.ativo) req.body.ativo = 'S';
    if (!req.body.aplicacao) return res.status(400).json({ erro: true, msg: "É necessario informar a descrição para atualizar o servico!" });
    if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual();
    req.body.data_recadastro = dateService.obterDataHoraAtual();

    let servico = {
      "codigo": req.body.codigo,
      "id": req.body.id,
      "valor": req.body.valor,
      "aplicacao": req.body.aplicacao,
      "tipo_serv": req.body.tipo_serv,
      "data_cadastro": req.body.data_cadastro,
      "data_recadastro": req.body.data_recadastro,
      "ativo": req.body.ativo
    }

    try {
      let resultinsertId: any = await update.update(dbName, servico);
      const item = {
        "codigo": req.body.codigo,
        "id": req.body.id,
        "valor": req.body.valor,
        "aplicacao": req.body.aplicacao,
        "tipo_serv": req.body.tipo_serv,
        "data_cadastro": req.body.data_cadastro,
        "data_recadastro": req.body.data_recadastro,
        "ativo": req.body.ativo
      }
      await publishMessage(empresa, 'servico.atualizado', item, source)

      return res.status(200).json(item)
    } catch (e) {
      return res.status(400).json({ erro: true, msg: `Ocorreu um erro ao atualizar o servico!` });

    }


  }



}