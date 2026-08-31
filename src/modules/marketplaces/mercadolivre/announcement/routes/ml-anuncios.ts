import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { SelectUsersMlIntegrations } from "../../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { DecodedToken } from "../../../../../services/decoded-token/decodedToken.ts";
import { GetMlItemsService } from "../../services/get-itens-ml-service.ts";
import {  CreateMlAnnouncementService } from "../create-announcement/create-ml-announcement-service.ts";
 import {type IPayloadCreateAnnouncement } from "../types/payload-create-announcement.ts";
import { MlAuthServices } from "../../services/auth/ml-auth-services.ts";
import { SelectMLAccountClient } from "../../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../../models/ml-accounts/update-ml-accounts.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';
const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);

 export const mlAnunciosRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/ml/anuncios/create', {
        schema: {
            tags: ['ml'],
            description: "Cria um novo anúncio no mercadolivre",
            headers: z.object({
                token: z.string()
            }),
            body: z.object({
                title: z.coerce.string(),
                sku:z.coerce.string(),
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
        const  createMlAnnouncementService = new CreateMlAnnouncementService(mlAuthServices);
        const selectUsersMl = new SelectUsersMlIntegrations();

        const {   ml_user_id, codigo_produto } = request.body;
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

        let itemData: IPayloadCreateAnnouncement = {
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
        if(request.body.sku){
            itemData.sku = request.body.sku;
        }

        try {
            const result = await createMlAnnouncementService.publishItem(userCnpj, systemUserCode, mlUserId, codigo_produto, integrationId, itemData);
            return reply.status(201).send(result);
        } catch (e) {
            return reply.status(500).send({ success: false, message: `${e}` });
        }
    });
  
    server.get('/ml/get/anuncios', {
        schema: {
            tags: ['ml'],
            description:"Consulta os anuncios do usuario no MercadoLivre.",
            headers: z.object({
                token: z.string(),
                ml_user_id: z.string(),
            }),
        }
    }, async (request, reply) => {

const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }

        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const systemUserCode  = decoded.payload.codigo;
        const dbName = `\`${empresa}\``;
        const {  ml_user_id } = request.headers;

        const getMlItemsService = new GetMlItemsService(mlAuthServices);
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

  
};