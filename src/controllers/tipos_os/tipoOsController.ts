import { Request, Response } from "express";
import { Insert_tipos_os } from "../../models/tipos_os/insert";
import { SelectTipo_os } from "../../models/tipos_os/select";
import { Update_tipo_os } from "../../models/tipos_os/update";
import { publishMessage } from "../../services/broker/publish-message";
import { DateService } from "../../utils/dateService";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { tipo_os } from "../../types/tipo_os/type-tipo-os";

export class TipoOsController {


  async findAll(req: Request, res: Response) {

    let select = new SelectTipo_os();
    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

    let dbName = `\`${empresa}\``;
    let tipoOS: any;
    let data_recadastro: string = '';
    if (req.query.data_recadastro) {
      data_recadastro = String(req.query.data_recadastro);
    }

    try {
      tipoOS = await select.buscaGeral(dbName, data_recadastro)

      return res.status(200).json(tipoOS);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: "Erro ao buscar  tipos de os pagamento." });
    }
  }


  async findByParam(req: Request, res: Response) {

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

    let dbName = `\`${empresa}\``;

    let select = new SelectTipo_os();

    let tiposDeOs;
    try {
      if (req.query) {
        tiposDeOs = await select.novaBusca(dbName, req.query)
      }
      return res.status(200).json(tiposDeOs);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: true, msg: "Erro ao buscar tipo de OS." });
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
    const source = String(req.headers.source) || 'api_internal';

    let insert = new Insert_tipos_os();
    let dateService = new DateService();

    if (!req.body.id) req.body.id = 0;
    if (!req.body.ativo) req.body.ativo = 'S';
    if (!req.body.descricao) return res.status(400).json({ erro: true, msg: "É necessario informar a descrição para registrar o tipo de OS!" });
    if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual();
    if (!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();


    try {
      let resultinsertId: any = await insert.cadastrar(dbName, req.body);
      const item = {
        "codigo": resultinsertId.insertId,
        "descricao": req.body.descricao,
        "data_cadastro": req.body.data_cadastro,
        "data_recadastro": req.body.data_recadastro,
        "ativo": req.body.ativo

      }
      await publishMessage(empresa, 'tipoos.inserido', item, source)

      return res.status(200).json(item)

    } catch (e) {
      return res.status(200).json({ erro: true, msg: `Ocorreu um erro ao cadastrar tipo de OS !` });

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

    let select = new SelectTipo_os();
    let dateService = new DateService();
    let update = new Update_tipo_os();

    if (!req.body.codigo) {
      return res.status(400).json({ erro: true, msg: `E necessario informar o codigo do tipo de OS!` })
    } else {
      req.body.codigo = Number(req.body.codigo)
    }
    if (!req.body.id) req.body.id = "0";
    if (!req.body.ativo) req.body.ativo = 'S';
    if (!req.body.descricao) return res.status(400).json({ erro: true, msg: `E necessario informar a descricao do tipo de OS!` })
    if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual();
    if (!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();

    let resultTipo_os: tipo_os[] = []

    if (Number(req.body.codigo) > 0) {
      resultTipo_os = await select.buscaPorCodigo(dbName, req.body.codigo);
    }
    if (resultTipo_os.length > 0) {
      let result: any = await update.update(dbName, req.body);

      if (result.affectedRows > 0) {

        const item = {
          "codigo": req.body.codigo,
          "id": req.body.id,
          "descricao": req.body.descricao,
          "data_cadastro": req.body.data_cadastro,
          "data_recadastro": req.body.data_recadastro,
          "ativo": req.body.ativo

        }
        await publishMessage(empresa, 'tipoos.atualizado', item, source)

        return res.status(200).json(
          item
        )
      } else {
        return res.status(400).json({ erro: true, msg: `Ocoreru um erro ao atualizar tipo de OS!` })

      }
    }


  }

}  