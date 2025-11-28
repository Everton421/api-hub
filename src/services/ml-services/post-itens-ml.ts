import axios from "axios";
import { getValidAccessToken } from "../integration/mercadolivre-integration/ml-auth-service"; 
 
export interface PublishItem{
     title: string;
    price: number;
    quantity: number;
    category_id: string;  
    listing_type_id: string;  
    condition: string;  
    description?: string;
    pictures: string[]; 
    brand?: string; 
    model?: string;
    ean?: string; 
    attributes:any
}

const ML_API_URL = 'https://api.mercadolibre.com';

export class PostMlItemsService {

    // ... seus métodos anteriores (getItemsFromSeller, predictCategory) ...

    async publishItem(cnpj: string, systemUserCode: number, mlUserId: number, data: PublishItem ) {
        let accessToken
        try {
            
            try{
                  accessToken = await getValidAccessToken(cnpj, systemUserCode, mlUserId);
            }catch(e){
                if(e instanceof Error ) {
                  throw new Error(e.message);
                }
            }   
 
               let finalAttributes = [];

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

            const mlPayload = {
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
                    free_shipping: false  
                }
            };

            // 4. Envia para o Mercado Livre
            const response = await axios.post(`${ML_API_URL}/items`, mlPayload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            return {
                success: true,
                ml_id: response.data.id,
                permalink: response.data.permalink,
                msg: "Anúncio criado com sucesso!"
            };

        } catch (error: any) {
            console.error("Erro ao publicar:", JSON.stringify(error.response?.data, null, 2));

            let errorMessage = "Erro ao publicar no Mercado Livre.";
            
            if (error.response?.data?.cause) {
                // Pega o primeiro erro da lista de causas do ML
                const mlError = error.response.data.cause[0];
                errorMessage = `ML Recusou: ${mlError.message} (Código: ${mlError.code})`;
                
                // Exemplo comum: Categoria exige atributos específicos
                if (mlError.code === "validation_error") {
                     errorMessage += ". Verifique se a categoria exige atributos obrigatórios.";
                }
            }

            throw new Error(errorMessage);
        }
    }
}