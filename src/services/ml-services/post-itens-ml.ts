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
}

const ML_API_URL = 'https://api.mercadolibre.com';

export class PostMlItemsService {

    // ... seus métodos anteriores (getItemsFromSeller, predictCategory) ...

    async publishItem(cnpj: string, systemUserCode: number, mlUserId: number, data: PublishItem ) {
        try {
            // 1. Garante Token Válido
            const accessToken = await getValidAccessToken(cnpj, systemUserCode, mlUserId);

            // 2. Prepara os Atributos (O Pesadelo do ML)
            // O ML rejeita produtos sem BRAND e MODEL na maioria das categorias.
            // Aqui fazemos um tratamento para garantir que enviamos ALGO.
            const attributes = [
                {
                    id: "BRAND",
                    value_name: data.brand || "Outras Marcas" // Fallback se vazio
                },
                {
                    id: "MODEL",
                    value_name: data.model || "Outros" // Fallback se vazio
                }
            ];
            
            // Se tiver EAN/GTIN, adiciona (Melhora muito a exposição)
            if (data.ean) {
                attributes.push({
                    id: "GTIN",
                    value_name: data.ean
                });
            }

            // 3. Monta o Payload Oficial do Mercado Livre
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
                attributes: attributes,
                // Garantir envio correios (Mercado Envios)
                shipping: {
                    mode: "me2", // Mercado Envios 2 (Padrão)
                    local_pick_up: false,
                    free_shipping: false // Lógica complexa, melhor deixar false e configurar no painel por enquanto
                }
            };

            // 4. Envia para o Mercado Livre
            const response = await axios.post(`${ML_API_URL}/items`, mlPayload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            // 5. Retorna sucesso com o ID gerado (ex: MLB123456)
            return {
                success: true,
                ml_id: response.data.id,
                permalink: response.data.permalink,
                msg: "Anúncio criado com sucesso!"
            };

        } catch (error: any) {
            // Tratamento de erro detalhado é CRUCIAL aqui
            // O ML retorna erros muito específicos dentro de error.response.data.cause
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