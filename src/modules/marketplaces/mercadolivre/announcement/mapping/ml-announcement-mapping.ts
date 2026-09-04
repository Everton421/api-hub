import { type IPayloadCreateAnnouncement } from "../types/payload-create-announcement.ts";
import { type IPayloadToMappingAnnouncement, type IPayloadToUpdateMLAnnouncement, type MlUpdateAttribute } from "../types/payload-update-announcement.ts";

type typeFinalAttributes = { id: string, value_name: string }

  type PayloadMappedAnnoucement = {
    payloadToUpdate:Partial<IPayloadToUpdateMLAnnouncement>;
    localUpdate: Record<string, any>;
    attributes?: MlUpdateAttribute[];
};


export class MlAnnouncementMapping  {
 
      mapToUpdateAnnouncement(data: IPayloadToMappingAnnouncement): PayloadMappedAnnoucement {
        const payloadToUpdate: Record<string, any> = {};

        if (data.title !== undefined) payloadToUpdate.title = data.title;
        if (data.price !== undefined) payloadToUpdate.price = data.price;
        if (data.available_quantity !== undefined) payloadToUpdate.available_quantity = data.available_quantity;
        if (data.listing_type_id !== undefined) payloadToUpdate.listing_type_id = data.listing_type_id;
        if (data.category_id !== undefined) payloadToUpdate.category_id = data.category_id;
        if (data.attributes !== undefined) payloadToUpdate.attributes = data.attributes;
        if (data.shipping !== undefined) payloadToUpdate.shipping = data.shipping;
        if(data.description !== undefined ) payloadToUpdate.description = data.description;  
        if (data.pictures !== undefined) {
            payloadToUpdate.pictures = data.pictures.map(url => ({ source: url }));
        }

        const localUpdate: Record<string, any> = {};
        if (data.title !== undefined) localUpdate.titulo = data.title;
        if (data.price !== undefined) localUpdate.preco = data.price;
        if (data.available_quantity !== undefined) localUpdate.estoque = data.available_quantity;
        if (data.description !== undefined) localUpdate.descricao = data.description;
        if (data.thumbnail !== undefined) localUpdate.thumbnail = data.thumbnail;

        return {
            payloadToUpdate,
            localUpdate,
            attributes: data.attributes
        };
    }

     mapToCreateAnnouncement(data: IPayloadCreateAnnouncement)  {
         let finalAttributes: typeFinalAttributes[] = [];

            if (data.attributes && data.attributes.length > 0) {
                // Se vieram atributos dinâmicos, usamos eles!
                finalAttributes = data.attributes;
            } else {
                // FALLBACK: Se não veio nada (produtos antigos/simples), criamos o básico
                finalAttributes = [
                    { id: "BRAND", value_name: data.brand || "Genérica" },
                    { id: "MODEL", value_name: data.model || "Padrão" }
                ];
                if (data.ean) {
                    finalAttributes.push({ id: "GTIN", value_name: data.ean });
                }
            }

            if (data.sku) {
                    finalAttributes.push({ id: "SELLER_SKU", value_name: data.sku });
                }

            let mlPayload  = {
                title: data.title,
                category_id: data.category_id,
                price: data.price,
                currency_id: "BRL",
                available_quantity: data.quantity,
                buying_mode: "buy_it_now",
                condition: data.condition,
                listing_type_id: data.listing_type_id,
                description: {
                    plain_text: data.description || "Produto enviado via integração MicroERP"
                },
                pictures: data.pictures.map(url => ({ source: url })),
                attributes: finalAttributes,
                // Garantir envio correios (Mercado Envios)
                shipping: {
                    mode: "me2",
                    local_pick_up: false,
                    free_shipping: false,
                      methods : [],
                     dimensions : null,
                     tags : [],
                     logistic_type : "default",
                     store_pick_up : false
                }
            };
          
            return mlPayload
    }
     
    
}
