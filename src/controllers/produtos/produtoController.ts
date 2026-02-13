import { Request, Response } from "express";
import { Select_Categorias } from "../../models/categorias/select";
import { Select_fotos } from "../../models/fotos/select";
import { Select_Marcas } from "../../models/marcas/select";
import { InsertProdutos } from "../../models/produtos/insert";
import { Select_produtos } from "../../models/produtos/select";
import { UpdateProdutos } from "../../models/produtos/update";
import { publishMessage } from "../../services/broker/publish-message";
import { DateService } from "../../utils/dateService";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { categoria } from "../../types/categoriaProduto/type-categoria";
import { marca } from "../../types/marcaProduto/type-marca";
import { ProdutoBanco, ProdutoCompleto } from "../../types/produto/type-produto";
import { FormatString } from "../../utils/format-string";


export class ProdutoController {


  async findAll(req: Request, res: Response) {
    let select = new Select_produtos();

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
    let produtos: ProdutoBanco[]
    try {
      produtos = await select.buscaGeral(dbName, data_recadastro)
      return res.status(200).json(produtos);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ erro: "Erro ao buscar produtos." });
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

    let select = new Select_produtos();
    let insert = new InsertProdutos();
    let dateService = new DateService();
    const formatString = new FormatString();

    if (!req.body.id) req.body.id = 0
    if (!req.body.preco) req.body.preco = 0
    if (!req.body.estoque) req.body.estoque = 0
    if (!req.body.unidade_medida) req.body.unidade_medida = 'UND'
    if (!req.body.descricao) return res.status(400).json({ erro: true, msg: "É necessario informar a descrição para registrar o produto!" });
    if (!req.body.num_fabricante) req.body.num_fabricante = ''  //return res.status(200).json({ erro:true, msg: "É necessario informar o codigo de barras para registrar o produto!"});
    if (!req.body.num_original) req.body.num_original = ''  //return res.status(200).json({ erro:true, msg: "É necessario informar a referência  para registrar o produto!"});

    if (!req.body.grupo || !req.body.grupo.codigo) req.body.grupo = { "codigo": 0 };
    if (!req.body.marca || !req.body.marca.codigo) req.body.marca = { "codigo": 0 };

    if (!req.body.origem) req.body.origem = 0;
    if (!req.body.sku) req.body.sku = ''  //return res.status(200).json({ erro:true, msg: "É necessario informar o sku  para registrar o produto!"});
    if (!req.body.ativo) req.body.ativo = 'S'     // return res.status(200).json({ erro:true, msg: "É necessario informar o status do produto !"});
    if (!req.body.class_fiscal) req.body.class_fiscal = '0000.00.00'    //return res.status(200).json({ erro:true, msg: "É necessario informar o ncm  para registrar o produto!"});
    if (!req.body.cst) req.body.cst = '00'   //return res.status(200).json({ erro:true, msg: "É necessario informar  cst para registrar o produto!"});
    if (!req.body.tipo) req.body.tipo = 0
    if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual();
    if (!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();
    if (!req.body.caracteristica) req.body.caracteristica = 0;
    if (!req.body.observacoes1) req.body.observacoes1 = ""
    if (!req.body.observacoes2) req.body.observacoes2 = ""
    if (!req.body.observacoes3) req.body.observacoes3 = ""
    let produto = {
      "codigo": req.body.codigo,
      "id": req.body.id,
      "estoque": req.body.estoque,
      "preco": req.body.preco,
      "unidade_medida": req.body.unidade_medida,
      "grupo": req.body.grupo.codigo,
      "origem": req.body.origem,
      "descricao": req.body.descricao,
      "caracteristica": req.body.caracteristica,
      "num_fabricante": req.body.num_fabricante, // num-fabricante gtim/codigo de barros 
      "num_original": req.body.num_original,   //referencia 
      "sku": req.body.sku,
      "marca": req.body.marca.codigo,
      "ativo": req.body.ativo,
      "class_fiscal": req.body.class_fiscal,
      "cst": req.body.cst,
      "data_recadastro": req.body.data_recadastro,
      "data_cadastro": req.body.data_cadastro,
      "observacoes1":    req.body.observacoes1,
      "observacoes2":    req.body.observacoes2,
      "observacoes3":    req.body.observacoes3,
      "tipo": req.body.tipo
    } as ProdutoBanco

    try {
      let resultinsertId: any = await insert.insert(dbName, produto);

      const item = {
        "codigo": resultinsertId.insertId,
        "id": req.body.id,
        "estoque": req.body.estoque,
        "preco": req.body.preco,
        "unidade_medida": req.body.unidade_medida,
        "grupo": req.body.grupo,
        "origem": req.body.origem,
        "descricao":  req.body.descricao ,
        "caracteristica": req.body.caracteristica,
        "num_fabricante": req.body.num_fabricante, // num-fabricante gtim/codigo de barros 
        "num_original": req.body.num_original,   //referencia 
        "sku": req.body.sku,
        "marca": req.body.marca,
        "ativo": req.body.ativo,
        "class_fiscal": req.body.class_fiscal,
        "cst": req.body.cst,
        "data_recadastro": req.body.data_recadastro,
        "data_cadastro": req.body.data_cadastro,
        "observacoes1":  req.body.observacoes1,
        "observacoes2":  req.body.observacoes2,
        "observacoes3":  req.body.observacoes3,
        "tipo": req.body.tipo
      }
      await publishMessage(empresa, 'produto.inserido', item, source)

      return res.status(200).json(item)


    } catch (e) {
      return res.status(400).json({ erro: true, msg: `Ocorreu um erro ao cadastrar o produto!` });

    }


  }

  async buscaProdutoNext(req: Request, res: Response) {

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

    let dbName = `\`${empresa}\``;

    let select = new Select_produtos();
    let produtos;

    const parametro = req.params.produto;
    const queryParam = `%${parametro}%`;

    try {
      produtos = await select.buscaPorCodigoOuDescricaoLimit(dbName, queryParam)
      if (produtos.length === 0) {
        return res.status(200).json({ erro: "Nenhum produto encontrado." });
      }
      return res.status(200).json(produtos);
    } catch (e) {
      console.error(e);
      return res.status(200).json({ erro: "Erro ao buscar produtos." });
    }
  }


  async findByParam(req: Request, res: Response) {

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
    let dbName = `\`${empresa}\``;

    let select = new Select_produtos();

    let responseProdutos;

    try {

      if (req.query) {
        let aux = req.query
        responseProdutos = await select.novaBusca(dbName, aux);
        return res.status(200).json(responseProdutos);

      }
    } catch (e) {
      console.error(e);
      return res.status(400).json({ erro: true, msg: "Erro ao buscar produtos." });
    }


  }


  async findByCode(req: Request, res: Response) {

    if (!req.headers.token) {
      return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
    }
    let decodToken = DecodedToken(String(req.headers.token))
    let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

    let dbName = `\`${empresa}\``;
    let select = new Select_produtos();
    let selectMarca = new Select_Marcas();
    let selectCategoria = new Select_Categorias();
    let selectFotos = new Select_fotos();


    let responseProdutos;

    let produto: ProdutoCompleto;
    let produtoBanco: ProdutoBanco
    const parametro = Number(req.params.codigo);
    let marca: marca | {} = {}
    let categoria: categoria | {} = {};


    try {
      responseProdutos = await select.buscaPorCodigo(dbName, parametro)

      let responseMarca: marca[] = [];
      let responseCategoria: categoria[] = []
      let responseFotos: IFoto[] = []

      if (responseProdutos.length === 0) {
        return res.status(400).json({ msg: "Nenhum produto encontrado." });
      } else {
        produtoBanco = responseProdutos[0];

        if (produtoBanco.marca > 0) {
          responseMarca = await selectMarca.busca_por_codigo(dbName, produtoBanco.marca, 1);
        }
        if (responseMarca.length > 0) {
          marca = responseMarca[0];
        }

        if (produtoBanco.grupo > 0) {
          responseCategoria = await selectCategoria.buscaPorCodigo(dbName, produtoBanco.grupo, 1);
        }
        if (responseCategoria.length > 0) {
          categoria = responseCategoria[0];
        }

        responseFotos = await selectFotos.buscaPorProduto(dbName, parametro);
      }

      produto = produtoBanco;
      produto.marca = marca;
      produto.grupo = categoria;
      produto.fotos = responseFotos;

      return res.status(200).json([produto]);
    } catch (e) {
      console.error(e);
      return res.status(200).json({ erro: "Erro ao buscar produtos." });
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
    let update = new UpdateProdutos();
    const dateService = new DateService();
    const formatString = new FormatString();


    const source = String(req.headers.source) || 'api_internal';

    if (!req.body.codigo) return res.status(400).json({ erro: true, msg: "É necessario informar o codigo para atualizar o produto!" });
    if (!req.body.id) req.body.id = 0
    if (!req.body.preco) req.body.preco = 0
    if (!req.body.estoque) req.body.estoque = 0
    if (!req.body.grupo) return res.status(400).json({ erro: true, msg: "É necessario informar o grupo para registrar o produto!" });
    if (!req.body.grupo.codigo) return res.status(400).json({ erro: true, msg: "É necessario informar o codigo do grupo para registrar o produto!" });
    if (!req.body.marca) return res.status(400).json({ erro: true, msg: "É necessario informar a marca para registrar o produto!" });
    if (!req.body.marca.codigo) return res.status(400).json({ erro: true, msg: "É necessario informar o codigo da marca para registrar o produto!" });
    if (!req.body.descricao) return res.status(400).json({ erro: true, msg: "É necessario informar a descrição para registrar o produto!" });
    if (!req.body.num_fabricante) req.body.num_fabricante = ''  //return res.status(200).json({ erro:true, msg: "É necessario informar o codigo de barras para registrar o produto!"});
    if (!req.body.num_original) req.body.num_original = ''  //return res.status(200).json({ erro:true, msg: "É necessario informar a referência  para registrar o produto!"});
    if (!req.body.unidade_medida) req.body.unidade_medida = 'UND';
    if (!req.body.origem) req.body.origem = 0;
    if (!req.body.sku) req.body.sku = ''  //return res.status(200).json({ erro:true, msg: "É necessario informar o sku  para registrar o produto!"});
    if (!req.body.ativo) req.body.ativo = 'S'     // return res.status(200).json({ erro:true, msg: "É necessario informar o status do produto !"});
    if (!req.body.class_fiscal) req.body.class_fiscal = '0000.00.00'    //return res.status(200).json({ erro:true, msg: "É necessario informar o ncm  para registrar o produto!"});
    if (!req.body.cst) req.body.cst = '00'   //return res.status(200).json({ erro:true, msg: "É necessario informar  cst para registrar o produto!"});
    if (!req.body.tipo) req.body.tipo = 0
    if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual();
    req.body.data_recadastro = dateService.obterDataHoraAtual();

    if (!req.body.observacoes1) req.body.observacoes1 = ""
    if (!req.body.observacoes2) req.body.observacoes2 = ""
    if (!req.body.observacoes3) req.body.observacoes3 = ""

    let produto = {
      "codigo": req.body.codigo,
      "id": req.body.id,
      "estoque": req.body.estoque,
      "preco": req.body.preco,
      "unidade_medida": req.body.unidade_medida,
      "grupo": req.body.grupo.codigo,
      "origem": req.body.origem,
      "descricao":  req.body.descricao ,
      "num_fabricante": req.body.num_fabricante, // num-fabricante gtim/codigo de barros 
      "num_original": req.body.num_original,   //referencia 
      "sku": req.body.sku,
      "marca": req.body.marca.codigo,
      "ativo": req.body.ativo,
      "class_fiscal": req.body.class_fiscal,
      "cst": req.body.cst,
      "data_recadastro": req.body.data_recadastro,
      "data_cadastro": req.body.data_cadastro,
      "observacoes1":  req.body.observacoes1 ,
      "observacoes2":  req.body.observacoes2 ,
      "observacoes3":  req.body.observacoes3 ,
      "tipo": req.body.tipo
    }

    try {
      
      await update.update(dbName, produto);
      await publishMessage(empresa, 'produto.atualizado', produto, source)

      return res.status(200).json(produto)

    } catch (e) {
      return res.status(400).json({ erro: true, msg: `Ocorreu um erro ao atualizar o produto!` });
    }

  }

}


