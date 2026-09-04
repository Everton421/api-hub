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
import { ApiClient } from "../../../../../services/lib/api-client.ts";
import { MlAnnouncementMapping } from "../mapping/ml-announcement-mapping.ts";
import {type IPayloadToMappingAnnouncement } from "../types/payload-update-announcement.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';


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

        const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);

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

      const  accessToken = await  mlAuthServices.getValidMlAccessToken(userCnpj, systemUserCode, ml_user_id);
      const apiClient = new   ApiClient(ML_API_URL, accessToken);

      const  createMlAnnouncementService = new CreateMlAnnouncementService(apiClient);
      

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
            const result = await createMlAnnouncementService.publishItem(userCnpj,codigo_produto, integrationId, itemData);
            return reply.status(201).send(result);
        } catch (e) {
            return reply.status(500).send({ success: false, message: `${e}` });
        }
    });
     /* server.put('/ml/anuncios/update/:id', {
        schema: {
            tags: ['ml'],
            description: "Atualiza anúncio no mercadolivre (id: Id do anuncio do banco de dados)",
            headers: z.object({
                token: z.string()
            }),
              body: z.object({
                ml_user_id: z.coerce.number().describe('Id do usuario no mercadoLivre.'),
                ml_id:z.string().describe('Id do anuncio no mercadoLivre.'),
                title: z.string().optional().describe('Titulo do anúncio.'),
                price: z.number().optional().describe('Preço do anúncio.'),
                description: z.string().optional().describe('Descrição do anúncio.'),
                available_quantity: z.number().optional().describe("Quantidade em estoque do anúncio."),
                listing_type_id: z.string().optional().describe("Tipo do anuncio [ gold_special, gold_pro, free ]."),
                category_id: z.string().optional().describe('Id da categoria.'),
                pictures: z.array(z.string()).optional().describe('Imagens do anuncio.'),
                attributes: z.array(z.object({
                    id: z.string(),
                    value_name: z.string()
                })).optional(),
                thumbnail: z.string().optional().describe("Foto da capa.")
            })
        }
    }, async (request, reply) => {
  
        const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);
  
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }
        const {   ml_user_id   } = request.body;
        
       const selectUsersMl = new SelectUsersMlIntegrations();

        const userCnpj = decoded.payload.cnpj;
        const systemUserCode = decoded.payload.codigo;

        const integracoes = await selectUsersMl.findBySystemUserCodeAndCnpj(systemUserCode, ml_user_id, userCnpj);
        if (!integracoes || integracoes.length === 0) {
            return reply.status(400).send({ success: false, message: "Usuário não possui conta ML vinculada." });
        }


        const  accessToken = await  mlAuthServices.getValidMlAccessToken(userCnpj, systemUserCode, ml_user_id);
         const apiClient = new   ApiClient(ML_API_URL, accessToken);

            const mlAnnouncementMapping = new MlAnnouncementMapping();
            let payloadTomapping :IPayloadToMappingAnnouncement={ };

            if(request.body.title) payloadTomapping.title =request.body.title; 
            if(request.body.price) payloadTomapping.price =request.body.price; 
            if(request.body.available_quantity) payloadTomapping.available_quantity =request.body.available_quantity; 
            if(request.body.listing_type_id) payloadTomapping.listing_type_id =request.body.listing_type_id; 
            if(request.body.description) payloadTomapping.description =request.body.description; 
            if(request.body.pictures)    payloadTomapping.pictures =request.body.pictures; 
            if(request.body.attributes) payloadTomapping.attributes =request.body.attributes; 
            if(request.body.category_id) payloadTomapping.category_id =request.body.category_id; 
            if(request.body.thumbnail) payloadTomapping.thumbnail =request.body.thumbnail; 

          const dataMapped=  mlAnnouncementMapping.mapToUpdateAnnouncement(payloadTomapping);
            console.log(dataMapped);
            return reply.status(200).send(dataMapped);

    });*/
  
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

        const mlAuthServices = new MlAuthServices(new SelectMLAccountClient(), new UpdateMLAccountClient(), ML_API_URL);

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
            return reply.status(200).send(result);
         
    });

  
};