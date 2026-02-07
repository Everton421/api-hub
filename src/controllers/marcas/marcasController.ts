import { Request, Response } from "express";
import { Insert_Marcas } from "../../models/marcas/insert";
import { Select_Marcas } from "../../models/marcas/select";
import { UpdateMarca } from "../../models/marcas/update";
import { publishMessage } from "../../services/broker/publish-message";
import { DateService } from "../../services/date-service/dateService";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { marca } from "../../types/marcaProduto/type-marca";

export class MarcasController {



    async findAll(req: Request, res: Response) {
        let select = new Select_Marcas();

        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        if (!decodToken.payload?.cnpj) return res.status(400).json({ erro: true, msg: "Identifiador unico da empresa nao foi informado" });
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

        let dbName = `\`${empresa}\``;

        let limit: number = 0;

        if (req.query.limit) {
            limit = Number(req.query.limit)
        }
        let data_recadastro: string = '';
        if (req.query.data_recadastro) {
            data_recadastro = String(req.query.data_recadastro);
        }

        try {

            let resultado: any = await select.busca_geral(dbName, limit, data_recadastro);
            return res.status(200).json(resultado)
        } catch (e) {
            console.log("ocorreu um erro ao consultar as marcas", e)
            return res.status(400).json({ erro: true, msg: "ocorreu um erro ao consultar as marcas" })
        }



    }

    async findByDescription(req: Request, res: Response) {

        let select = new Select_Marcas();

        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

        let dbName = `\`${empresa}\``;
        let descricao = String(req.query.descricao)
        let codigo: number = Number(req.query.codigo);
        let id: number = Number(req.query.id);

        let limit: number = 20;

        if (req.query.limit) {
            limit = 20
        }

        if (req.query.descricao) {
            try {
                let resultado: any = await select.busca_por_descricao(dbName, descricao, limit);
                return res.status(200).json(resultado)
            } catch (e) {
                console.log("ocorreu um erro ao consultar as marcas", e)
                return res.status(200).json({ erro: true, msg: "ocorreu um erro ao consultar as marcas" })
            }
        }

        if (req.query.codigo) {
            try {
                let resultado: any = await select.busca_por_codigo(dbName, codigo, limit);
                return res.status(200).json(resultado)
            } catch (e) {
                console.log("ocorreu um erro ao consultar as marcas", e)
                return res.status(200).json({ erro: true, msg: "ocorreu um erro ao consultar as marcas" })
            }
        }

        if (req.query.id) {
            try {
                let resultado: any = await select.buscaPorId(dbName, id, limit);
                return res.status(200).json(resultado)
            } catch (e) {
                console.log("ocorreu um erro ao consultar as marcas", e)
                return res.status(200).json({ erro: true, msg: "ocorreu um erro ao consultar as marcas" })
            }
        }

        if (!codigo || !id || !descricao) {
            try {
                let resultado: any = await select.busca_geral(dbName, limit, '');
                return res.status(200).json(resultado)
            } catch (e) {
                console.log("ocorreu um erro ao consultar as marcas", e)
                return res.status(200).json({ erro: true, msg: "ocorreu um erro ao consultar as marcas" })
            }

        }

    }



    async findByCode(req: Request, res: Response) {

        let select = new Select_Marcas();
        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');

        let descricao = req.params.descricao

        let dbName = `\`${empresa}\``;

        let limit: number = 20;

        if (req.query.limit) {
            limit = 20
        }

        try {

            let resultado: any = await select.busca_por_descricao(dbName, descricao, limit);

            return res.status(200).json(resultado)

        } catch (e) {
            console.log("ocorreu um erro ao consultar as marcas", e)
            return res.status(400).json({ erro: true, msg: "ocorreu um erro ao consultar as marcas" })

        }
    }

    async findByParam(req: Request, res: Response) {

        let select = new Select_Marcas();
        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');


        let dbName = `\`${empresa}\``;

        let categorias;

        try {
            if (req.query) {
                categorias = await select.novaBusca(dbName, req.query)
            }
            return res.status(200).json(categorias);
        } catch (e) {
            console.error(e);
            return res.status(400).json({ erro: true, msg: "Erro ao buscar marcas." });
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

        const dateService = new DateService();

        let select = new Select_Marcas();
        let insert = new Insert_Marcas();

        let postMarca: any = req.body;

        let dbName = `\`${empresa}\``;
        if (!postMarca.ativo) postMarca.ativo = 'S';

        if (!postMarca.id) postMarca.id = "0";
        if (!postMarca.descricao) return res.status(400).json({ erro: true, msg: `E necessario informar a descricao da marca!` })
        if (!postMarca.data_cadastro) postMarca.data_cadastro = dateService.obterDataAtual();
        if (!postMarca.data_recadastro) postMarca.data_recadastro = dateService.obterDataHoraAtual();

        let limit = 1;

        let validMarca: any = await select.busca_por_descricao(dbName, postMarca.descricao, limit)

        if (validMarca.length > 0) return res.status(400).json({ erro: true, msg: `A marca ${postMarca.descricao} ja foi cadastrada!` })

        let responseMarca: any;
        try {
            responseMarca = await insert.cadastrar(dbName, postMarca)

            if (responseMarca.insertId > 0) {
                const item = {
                    "codigo": responseMarca.insertId,
                    "descricao": postMarca.descricao,
                    "data_cadastro": postMarca.data_cadastro,
                    "data_recadastro": postMarca.data_recadastro,
                    "ativo": postMarca.ativo
                }
                await publishMessage(empresa, 'marca.inserido', item, source)

                return res.status(200).json(item)
            }
        } catch (e) {
            console.log(e);
            return res.status(400).json({ erro: true, msg: "ocorreu um erro ao tentar registrar a marca" })
        }

    }

    async update(req: Request, res: Response) {

        let select = new Select_Marcas();
        let dateService = new DateService();
        let update = new UpdateMarca();

        let postMarca: any = req.body;
        if (!req.headers.token) {
            return res.status(400).json({ erro: true, msg: "É necessario informar o token!" });
        }
        let decodToken = DecodedToken(String(req.headers.token))
        if (!decodToken.payload?.cnpj) return res.status(400).json({ erro: true, msg: "Identifiador unico da empresa nao foi informado" });

        let empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        let dbName = `\`${empresa}\``;

        if (!postMarca.codigo) return res.status(400).json({ erro: true, msg: `E necessario informar o codigo da marca!` })
        if (!postMarca.ativo) postMarca.ativo = 'S';

        if (!postMarca.id) postMarca.id = "0";
        if (!postMarca.descricao) return res.status(400).json({ erro: true, msg: `E necessario informar a descricao da marca!` })
        if (!postMarca.data_cadastro) postMarca.data_cadastro = dateService.obterDataAtual();
        postMarca.data_recadastro = dateService.obterDataHoraAtual();

        let resultMarca: marca[] = []

        if (postMarca.codigo > 0) {
            resultMarca = await select.busca_por_codigo(dbName, postMarca.codigo, 1);
        }
        let result2: marca[] = [];

        if (postMarca.codigo > 0) {
            result2 = await select.busca_por_descricao(dbName, postMarca.descricao, 1);
        }
        if (result2.length > 0) return res.status(400).json({ erro: true, msg: `A marca ${postMarca.descricao} ja foi cadastrada!` })

        if (resultMarca.length > 0) {
            let responseMarca: any;
            try {
                responseMarca = await update.update(dbName, postMarca)

                if (responseMarca.affectedRows > 0) {
                    console.log(responseMarca)
                    const item = {
                        "codigo": postMarca.codigo,
                        "descricao": postMarca.descricao,
                        "data_cadastro": postMarca.data_cadastro,
                        "data_recadastro": postMarca.data_recadastro,
                        "ativo": postMarca.ativo
                    }
                    await publishMessage(empresa, 'marca.atualizado', item)

                    return res.status(200).json(item)
                }
            } catch (e) {
                console.log(e);
                return res.status(400).json({ erro: true, msg: "ocorreu um erro ao tentar registrar a marca" })
            }
        } else {
            return res.status(400).json({ erro: true, msg: `Não foi encontrada marca com o codigo ${postMarca.codigo}  ` })

        }


    }

}




