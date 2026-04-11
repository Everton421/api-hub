import axios from "axios";
import { InsertAnuncios } from "../../models/anuncios/insert.ts";
import { InsertAtributosAnuncios } from "../../models/atributos-anuncios/insert.ts";
import { delay } from "../delay-service/delay.ts";
import { getValidMlAccessToken } from "../integration/mercadolivre-integration/ml-auth-service.ts";

export interface IPublishItem {
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
    attributes: any
    thumbnail?: string
}
type typeFinalAttributes = { id: string, value_name: string }

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export class PostMlItemsService {


    async publishItem(cnpj: string, systemUserCode: number, mlUserId: number, codigo_produto: number, integrationId: number, data: IPublishItem) {
        const insertAnuncios = new InsertAnuncios();
        const insertAtributosAnuncios = new InsertAtributosAnuncios();

        let accessToken
        try {

            try {
                accessToken = await getValidMlAccessToken(cnpj, systemUserCode, mlUserId);
            } catch (e) {
                if (e instanceof Error) {
                    throw new Error(e.message);
                }
            }


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
            const database = `\`${cnpj}\``;

            delay(1);
            const ean = data.ean || ''


            // 4. Envia para o Mercado Livre
            const response = await axios.post(`${ML_API_URL}/items`, mlPayload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.data.id) {
                const resultInsert = await insertAnuncios.insert(database,
                    {
                        ativo: 'S',
                        codigo_produto: codigo_produto,
                        descricao: data.title,
                        estoque: data.quantity,
                        id_externo: '1',
                        integration_id: integrationId,
                        link: '',
                        num_fabricante: ean,
                        titulo: data.title,
                        preco: data.price,
                        plataforma: 'ML',
                        sku_externo: null,
                        unidade_medida: '',
                        thumbnail: data.thumbnail || ''
                    }
                )
                if (resultInsert.sucess && resultInsert.insertId) {
                    if (finalAttributes.length > 0) {
                        for (const atr of finalAttributes) {
                            await insertAtributosAnuncios.insert(database,
                                {
                                    id_anuncio: resultInsert.insertId,
                                    id_atributo: atr.id,
                                    id_valor_atributo: null,
                                    nome_atributo: atr.id,
                                    valor_atributo: atr.value_name
                                })
                        }
                        for (const img of data.pictures) {
                            await insertAtributosAnuncios.insert(database,
                                {
                                    id_anuncio: resultInsert.insertId,
                                    id_atributo: 'IMAGEM_ANUNCIO',
                                    id_valor_atributo: null,
                                    nome_atributo: 'IMAGEM_ANUNCIO',
                                    valor_atributo: img
                                })
                        }
                    }
                }
            }

            return {
                success: true,
                ml_id: response.data.id,
                permalink: response.data.permalink,
                msg: "Anúncio criado com sucesso!"
            };

        } catch (error: any) {
            console.log(error)
            console.error("Erro ao publicar:", JSON.stringify(error.response?.data, null, 2));

            let errorMessage = "Erro ao publicar no Mercado Livre.";

            if (error.response?.data?.cause) {
                // Pega o primeiro erro da lista de causas do ML
                const mlError = error.response.data.cause[0];
                errorMessage = `ML Recusou: ${mlError &&  mlError.message ? mlError.message : mlError } (Código: ${mlError && mlError.code ? mlError.code : mlError })`;

                // Exemplo comum: Categoria exige atributos específicos
                if (mlError.code === "validation_error") {
                    errorMessage += ". Verifique se a categoria exige atributos obrigatórios.";
                }
            }

            throw new Error(errorMessage);

        }
    }
}