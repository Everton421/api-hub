import { Request, Response } from "express";
import { SelectSetor } from "../../models/setor/select";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { ISetor } from "../../models/setor/types/setor";
import { UpdateSetor } from "../../models/setor/update";
import { InsertSetor } from "../../models/setor/insert";
import { DateService } from "../../utils/dateService";
import { publishMessage } from "../../services/broker/publish-message";

type query = {
  codigo: number,
  descricao: string,
  limit: number,
  id: number,
  ativo: 'S' | 'N'
}

export class SetorController {



  async findAll(req: Request, res: Response) {
    let select = new SelectSetor();

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

    let data_recadastro: string = '';
    if (req.query.data_recadastro) {
      data_recadastro = String(req.query.data_recadastro);
    }


    let dbName = `\`${empresa}\``;
    let setores: ISetor[]
    try {
      setores = await select.findAll(dbName, data_recadastro)
      return res.status(200).json(setores);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: "Erro ao buscar setores." });
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

    let update = new UpdateSetor();

    const dateService = new DateService();
    const source = String(req.headers.source) || 'api_internal';

    if (!req.body.codigo) return res.status(400).json({ erro: true, msg: "É necessario informar o codigo para atualizar o setor!" });
    if (!req.body.data_recadastro) {
      req.body.data_recadastro = dateService.obterDataHoraAtual();
    }
    if (!req.body.data_cadastro) {
      req.body.data_cadastro = dateService.obterDataAtual();
    }
    let objInsert = {
      codigo: req.body.codigo,
      descricao: req.body.descricao,
      data_cadastro: req.body.data_cadastro,
      data_recadastro: dateService.obterDataHoraAtual(),

    }

    try {
      let result = await update.update(dbName, objInsert);
      if (result.affectedRows > 0) {

        await publishMessage(empresa, 'setor.atualizado', objInsert, source)

        return res.status(200).json(
          {
            msg: `Setor ${req.body.codigo} atualizado com sucesso!`
          })
      }

    } catch (e) {
      return res.status(400).json({ erro: true, msg: `Ocorreu um erro ao atualizar o setor!` });
    }


  }
  async insert(req: Request, res: Response) {
    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    if (!decodToken.payload?.cnpj) return res.status(400).json({ erro: true, msg: "Identifiador unico da empresa nao foi informado" });

    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
    let dbName = `\`${empresa}\``;

    let insert = new InsertSetor();
    let dateService = new DateService();
    const source = String(req.headers.source) || 'api_internal';


    if (!req.body.descricao) return res.status(400).json({ erro: true, msg: "É necessario informar a descrição para registrar o setor!" });
    if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual();

    req.body.data_recadastro = dateService.obterDataHoraAtual();


    try {
      let resultinsertId = await insert.cadastrarSetor(dbName, req.body);
      const item = {
        "codigo": resultinsertId.insertId,
        "descricao": req.body.descricao,
        "data_cadastro": req.body.data_cadastro,
        "data_recadastro": req.body.data_recadastro,
      }
      await publishMessage(empresa, 'setor.inserido', item, source)

      return res.status(200).json( item)

    } catch (e) {
      return res.status(400).json({ erro: true, msg: `Ocorreu um erro ao cadastrar setor !` });

    }
  }
  async findByParam(req: Request, res: Response) {

    let select = new SelectSetor();

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
    let dbName = `\`${empresa}\``;

    let servicos;

    let query: Partial<query> = req.query
    try {
      if (req.query) {
        servicos = await select.findByDescription(dbName, query)
      }
      return res.status(200).json(servicos);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: true, msg: "Erro ao buscar os serviços." });
    }
  }

}