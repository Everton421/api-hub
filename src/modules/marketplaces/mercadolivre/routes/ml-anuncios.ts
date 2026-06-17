import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z, { string } from "zod";
import {type IPublishItem, PostMlItemsService } from "../services/post-itens-ml.ts";
import { SelectUsersMlIntegrations } from "../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { DecodedToken } from "../../../../services/decoded-token/decodedToken.ts";
import { InsertAnuncios } from "../../../../models/anuncios/insert.ts";
import { InsertAtributosAnuncios } from "../../../../models/atributos-anuncios/insert.ts";
import { GetMlItemsService } from "../services/get-itens-ml-service.ts";
import { SelectAnuncios } from "../../../../models/anuncios/select.ts";
import { SelectAtributosAnuncios } from "../../../../models/atributos-anuncios/select.ts";
import { UpdateAnuncios } from "../../../../models/anuncios/update.ts";
import { DeleteAtributosAnuncios } from "../../../../models/atributos-anuncios/delete.ts";
import { DeleteAnuncios } from "../../../../models/anuncios/delete.ts";
import { type typeAtributosAnuncios } from "../../../../types/atributos-anuncios/type-atributos-anuncios.ts";
import { type typeAnuncios } from "../../../../types/anuncios/type-anuncio.ts";
type typeFinalAttributes = { id: string, value_name: string }

export const mlAnunciosRoute: FastifyPluginAsyncZod = async (server) => {

    server.post('/ml/anuncios/create', {
        schema: {
            tags: ['ml/anuncios'],
            description: "Cria um novo anúncio no mercadolivre",
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                title: z.coerce.string(),
                price: z.coerce.number(),
                category_id: z.string(),
                available_quantity: z.number(),
                ml_user_id: z.coerce.number(),
                codigo_produto: z.coerce.number(),
                listing_type_id: z.string().optional(),
                condition: z.string().optional(),
                description: z.string().optional(),
                pictures: z.array(z.string()).optional(),
                brand: z.string().optional(),
                model: z.string().optional(),
                ean: z.string().optional(),
                attributes: z.array(z.object({
                    id: z.string(),
                    value_name: z.string()
                })).optional(),
                thumbnail: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const mlService = new PostMlItemsService();
        const selectUsersMl = new SelectUsersMlIntegrations();

        const { title, price, category_id, ml_user_id, codigo_produto } = request.body;

        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const userCnpj = decoded.payload.cnpj;
        const systemUserCode = decoded.payload.codigo;

        const integracoes = await selectUsersMl.findBySystemUserCodeAndCnpj(systemUserCode, ml_user_id, userCnpj);
        if (!integracoes || integracoes.length === 0) {
            return reply.status(400).send({ success: false, message: "Usuário não possui conta ML vinculada." });
        }

        const mlUserId = integracoes[0].ml_user_id;
        const integrationId = integracoes[0].id;

        const itemData: IPublishItem = {
            title: request.body.title,
            price: Number(request.body.price),
            quantity: Number(request.body.available_quantity),
            category_id: request.body.category_id,
            listing_type_id: request.body.listing_type_id || "gold_special",
            condition: request.body.condition || "new",
            description: request.body.description,
            pictures: request.body.pictures || [],
            brand: request.body.brand,
            model: request.body.model,
            attributes: request.body.attributes || [],
            thumbnail: request.body.thumbnail
        };

        try {
            const result = await mlService.publishItem(userCnpj, systemUserCode, mlUserId, codigo_produto, integrationId, itemData);
            return reply.status(201).send(result);
        } catch (e) {
            return reply.status(500).send({ success: false, message: `${e}` });
        }
    });
    server.post('/ml/anuncios/register', {
        schema: {
            tags: ['ml/anuncios'],
            description: "Registar os dados de um anuncio no banco de dados ",
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                title: z.coerce.string(),
                price: z.coerce.number(),
                category_id: z.string(),
                available_quantity: z.number(),
                ml_user_id: z.coerce.number(),
                codigo_produto: z.coerce.number(),
                listing_type_id: z.string().optional(),
                condition: z.string().optional(),
                description: z.string().optional(),
                pictures: z.array(z.string()).optional(),
                brand: z.string().optional(),
                model: z.string().optional(),
                ean: z.string().optional(),
                attributes: z.array(z.object({
                    id: z.string(),
                    value_name: z.string()
                })).optional(),
                thumbnail: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const mlService = new PostMlItemsService();
        const selectUsersMl = new SelectUsersMlIntegrations();

        const { title, price, category_id, ml_user_id, codigo_produto, available_quantity , ean, thumbnail } = request.body;
        const insertAnuncios = new InsertAnuncios();
        const insertAtributosAnuncios = new InsertAtributosAnuncios();

        const decoded = DecodedToken(String(request.headers.token));
        if ( !decoded.payload) {
            return reply.status(401).send({ msg: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj;
        const dbName = `\`${empresa}\``;


        const systemUserCode = decoded.payload.codigo;

        const integracoes = await selectUsersMl.findBySystemUserCodeAndCnpj(systemUserCode, ml_user_id, empresa);
        if (!integracoes || integracoes.length === 0) {
            return reply.status(400).send({ msg: "Usuário não possui conta ML vinculada." });
        }

        const mlUserId = integracoes[0].ml_user_id;
        const integrationId = integracoes[0].id;

                const itemData: IPublishItem = {
                    title: request.body.title,
                    price: Number(request.body.price),
                    quantity: Number(request.body.available_quantity),
                    category_id: request.body.category_id,
                    listing_type_id: request.body.listing_type_id || "gold_special",
                    condition: request.body.condition || "new",
                    description: request.body.description,
                    pictures: request.body.pictures || [],
                    brand: request.body.brand,
                    model: request.body.model,
                    attributes: request.body.attributes || [],
                    thumbnail: request.body.thumbnail

                };

        let finalAttributes: typeFinalAttributes[] = [];

                    if (itemData.attributes && itemData.attributes.length > 0) {
                        // Se vieram atributos dinâmicos, usamos eles!
                        finalAttributes = itemData.attributes;
                    } else {
                        // FALLBACK: Se não veio nada (produtos antigos/simples), criamos o básico
                        finalAttributes = [
                            { id: "BRAND", value_name: request.body.brand || "Genérica" },
                            { id: "MODEL", value_name: request.body.model || "Padrão" }
                        ];
                        if (ean) {
                            finalAttributes.push({ id: "GTIN", value_name:  ean });
                        }
                    }


                const resultInsert = await insertAnuncios.insert(dbName,
                    {
                        ativo: 'S',
                        codigo_produto: codigo_produto,
                        descricao:   title,
                        estoque:  available_quantity,
                        id_externo: '1',
                        integration_id: integrationId,
                        link: '',
                        num_fabricante: ean || '',
                        titulo:  title,
                        preco:  price,
                        plataforma: 'ML',
                        sku_externo: null,
                        unidade_medida: '',
                        thumbnail:  thumbnail || ''
                    }
                )
                if (resultInsert.sucess && resultInsert.insertId) {
                    if (finalAttributes.length > 0) {
                        for (const atr of finalAttributes) {
                            await insertAtributosAnuncios.insert(dbName,
                                {
                                    id_anuncio: resultInsert.insertId,
                                    id_atributo: atr.id,
                                    id_valor_atributo: null,
                                    nome_atributo: atr.id,
                                    valor_atributo: atr.value_name
                                })
                        }
                      //  for (const img of data.pictures) {
                      //      await insertAtributosAnuncios.insert(database,
                      //          {
                      //              id_anuncio: resultInsert.insertId,
                      //              id_atributo: 'IMAGEM_ANUNCIO',
                      //              id_valor_atributo: null,
                      //              nome_atributo: 'IMAGEM_ANUNCIO',
                      //              valor_atributo: img
                      //          })
                      //  }
                    }
                }

         try {
             const result = await mlService.publishItem(empresa, systemUserCode, mlUserId, codigo_produto, integrationId, itemData);
             return reply.status(201).send(result);
         } catch (e) {
             return reply.status(500).send({ success: false, message: `${e}` });
         }
    });

    server.get('/ml/get/anuncios', {
        schema: {
            tags: ['ml/anuncios'],
            description:"Consulta os anuncios do usuario no MercadoLivre.",
            headers: z.object({
                token: z.string(),
                ml_user_id: z.string(),
            }),
            /*response: {
                200: z.object({
                  seller_id: z.number() ,
                 total_found : z.number(),
                 items : z.array( 
                    z.object({
                     id: z.string(),
                     title: z.string(),
                     price: z.number(),
                     quantity: z.number(),
                     permalink: z.string(),
                     thumbnail: z.string(),
                     }) ) 
                }),
                401 : z.object({
                    success: z.boolean(),
                    message: z.string() 
                })
                    
                    
                 
            }
            */
        }
    }, async (request, reply) => {

const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const systemUserCode  = decoded.payload.codigo;
        const dbName = `\`${empresa}\``;
        const { mlUserId, ml_user_id } = request.headers;

        const getMlItemsService = new GetMlItemsService();
        console.log(request.headers)
          const result =  await getMlItemsService.getItemsFromSeller(empresa, systemUserCode, Number(ml_user_id) );
          //if(result.items.length > 0 ){
            return reply.status(200).send(result);
          //}
        //console.log(result);

      /*  const query = request.query;
        const queryParams: any = { ativo: query.ativo || 'S' };
        
        if (query.limit) queryParams.limit = query.limit;
        if (query.data_recadastro) queryParams.data_recadastro = query.data_recadastro;
        if (query.plataforma) queryParams.plataforma = query.plataforma;
        if (query.id_externo) queryParams.id_externo = query.id_externo;
        if (query.sku_externo) queryParams.sku_externo = query.sku_externo;

        try {
            let anuncios: typeAnuncios[] = [];

            if (Object.keys(queryParams).length > 1) {
                anuncios = await selectAnuncios.findByParams(dbName, queryParams);
            } else {
                anuncios = await selectAnuncios.findAll(dbName, queryParams.data_recadastro);
            }

            const anunciosCompleto = await Promise.all(anuncios.map(async (i) => {
                let atributos: typeAtributosAnuncios[] = [];
                try {
                    atributos = await selectAtributosAnuncios.findByAnuncioId(dbName, i.id);
                } catch (e) { }
                return { ...i, atributos };
            }));

            return reply.status(200).send(anunciosCompleto);
        } catch (e) {
            return reply.status(500).send({ success: false, message: 'erro ao tentar consultar os anuncios' });
        }
        */
    });

    server.get('/ml/anuncios', {
        schema: {
            tags: ['ml/anuncios'],
            description:"Consulta os anuncios cadastrados.",
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                ativo: z.string().optional(),
                limit: z.coerce.number().optional(),
                data_recadastro: z.string().optional(),
                plataforma: z.string().optional(),
                id_externo: z.string().optional(),
                sku_externo: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const selectAnuncios = new SelectAnuncios();
        const selectAtributosAnuncios = new SelectAtributosAnuncios();

        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ msg: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        const query = request.query;
        const queryParams: any = { ativo: query.ativo || 'S' };
        
        if (query.limit) queryParams.limit = query.limit;
        if (query.data_recadastro) queryParams.data_recadastro = query.data_recadastro;
        if (query.plataforma) queryParams.plataforma = query.plataforma;
        if (query.id_externo) queryParams.id_externo = query.id_externo;
        if (query.sku_externo) queryParams.sku_externo = query.sku_externo;

        try {
            let anuncios: typeAnuncios[] = [];

            if (Object.keys(queryParams).length > 1) {
                anuncios = await selectAnuncios.findByParams(dbName, queryParams);
            } else {
                anuncios = await selectAnuncios.findAll(dbName, queryParams.data_recadastro);
            }

            const anunciosCompleto = await Promise.all(anuncios.map(async (i) => {
                let atributos: typeAtributosAnuncios[] = [];
                try {
                    atributos = await selectAtributosAnuncios.findByAnuncioId(dbName, i.id);
                } catch (e) { }
                return { ...i, atributos };
            }));

            return reply.status(200).send(anunciosCompleto);
        } catch (e) {
            console.log(e)
            return reply.status(500).send({ success: false, message: 'erro ao tentar consultar os anuncios' });
        }
    });

    server.get('/ml/anuncios/:id', {
        schema: {
            tags: ['ml/anuncios'],
            description:"Consulta anuncio cadastrado pelo ID.",
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                id: z.coerce.number()
            })
        }
    }, async (request, reply) => {
        const selectAnuncios = new SelectAnuncios();
        const selectAtributosAnuncios = new SelectAtributosAnuncios();

        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        const id = request.params.id;

        try {
            const anuncios = await selectAnuncios.findById(dbName, id);

            if (anuncios.length === 0) {
                return reply.status(404).send({ success: false, message: "Anúncio não encontrado" });
            }

            const atributos = await selectAtributosAnuncios.findByAnuncioId(dbName, id);

            return reply.status(200).send({ ...anuncios[0], atributos });
        } catch (e) {
            return reply.status(500).send({ success: false, message: 'erro ao tentar consultar o anuncio' });
        }
    });

    server.put('/ml/anuncios/update/:id', {
        schema: {
            tags: ['ml/anuncios'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                id: z.coerce.number()
            }),
            body: z.object({
                integration_id: z.number(),
                plataforma: z.string(),
                estoque: z.number(),
                preco: z.number(),
                unidade_medida: z.string(),
                descricao: z.string(),
                titulo: z.string(),
                num_fabricante: z.string(),
                ativo: z.enum(['S', 'N']),
                sku_externo: z.string().optional(),
                id_externo: z.string().optional(),
                link: z.string(),
                thumbnail: z.string()
            })
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        const updateAnuncios = new UpdateAnuncios();
        const id = request.params.id;

        try {
            const resultUpdate = await updateAnuncios.update(dbName, request.body, id);
            if (resultUpdate && resultUpdate.affectedRows > 0) {
                return reply.status(200).send(request.body);
            }
return reply.status(400).send({ success: false, message: "Anúncio não encontrado ou erro ao atualizar" });

            }catch(e){
                console.log(e);
            return reply.status(500).send({ success: false, message: "erro interno no servidor." });
            }

        }
     );

    server.delete('/ml/anuncios/delete/:id', {
        schema: {
            tags: ['ml/anuncios'],
            headers: z.object({
                token: z.string()
            }),
            params: z.object({
                id: z.coerce.number()
            })
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const dbName = `\`${empresa}\``;

        const deleteAnuncios = new DeleteAnuncios();
        const deleteAtributosAnuncios = new DeleteAtributosAnuncios();
        const selectAnuncios = new SelectAnuncios();
        const id = request.params.id;

        const validaExisAnuncio = await selectAnuncios.findById(dbName, id);
        if (validaExisAnuncio.length === 0) {
            return reply.status(400).send({ success: false, message: "O anúncio informado não existe." });
        }

        try {
            const resultDeleteAnuncio = await deleteAnuncios.delete(dbName, id);
            const resultDeleteAtributos = await deleteAtributosAnuncios.delete(dbName, id);
            if (resultDeleteAnuncio.affectedRows > 0) {
                return reply.status(200).send({ success: true, message: "Anúncio deletado com sucesso." });
            }
            return reply.status(500).send({ success: false, message: "erro ao deletar anúncio." });
        } catch (e) {
            return reply.status(500).send({ success: false, message: "erro interno no servidor." });
        }
    });
};