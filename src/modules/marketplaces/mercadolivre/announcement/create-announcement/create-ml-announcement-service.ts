import { InsertAnuncios } from "../../../../../models/anuncios/insert.ts";
import { MlAnnouncementMapping } from "../mapping/ml-announcement-mapping.ts";
import { InsertAtributosAnuncios } from "../../../../../models/atributos-anuncios/insert.ts";
import { delay } from "../../../../../services/delay-service/delay.ts";
import axios from "axios";
import { MlAuthServices } from "../../services/auth/ml-auth-services.ts";
import { type IPayloadCreateAnnouncement } from "../types/payload-create-announcement.ts";


export class CreateMlAnnouncementService {
    private readonly mlAuthServices: MlAuthServices
    constructor(
        mlAuthServices: MlAuthServices) {
        this.mlAuthServices = mlAuthServices;
    }
    private ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';


    async publishItem(cnpj: string, systemUserCode: number, mlUserId: number, codigo_produto: number, integrationId: number, data: IPayloadCreateAnnouncement) {
        const insertAnuncios = new InsertAnuncios();
        const insertAtributosAnuncios = new InsertAtributosAnuncios();
        const mlAnnouncementMapping = new MlAnnouncementMapping();

        let accessToken
        try {

            try {
                accessToken = await this.mlAuthServices.getValidMlAccessToken(cnpj, systemUserCode, mlUserId);
            } catch (e) {
                if (e instanceof Error) {
                    throw new Error(e.message);
                }
            }

            let payloadCreateMlAnnouncement = mlAnnouncementMapping.mapToCreateAnnouncement(data)

            const database = `\`${cnpj}\``;

            await delay(1);
            const ean = data.ean || ''

            // 4. Envia para o Mercado Livre
            const response = await axios.post<{ id: string, permalink: string }>(`${this.ML_API_URL}/items`, payloadCreateMlAnnouncement, {
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
                        sku: data.sku || '',
                        descricao: data.title,
                        estoque: data.quantity,
                        id_externo: null,
                        integration_id: integrationId,
                        link: response.data.permalink || '',
                        num_fabricante: ean,
                        titulo: data.title,
                        preco: data.price,
                        plataforma: 'ML',
                        sku_externo: null,
                        unidade_medida: '',
                        thumbnail: data.thumbnail || '',
                        id_plataforma: response.data.id
                    }
                )
                if (resultInsert.sucess && resultInsert.insertId) {
                    if (payloadCreateMlAnnouncement.attributes.length > 0) {
                        for (const atr of payloadCreateMlAnnouncement.attributes) {
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


                if (data.description) {

                    try {
                        await axios.put(
                            `${this.ML_API_URL}/items/${response.data.id}/description`,
                            { plain_text: data.description },
                            {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`,
                                    "Content-Type": "application/json"
                                }
                            }
                        );
                    } catch (e) {
                        console.error("Erro ao atualizar descrição:", e);
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
                errorMessage = `ML Recusou: ${mlError && mlError.message ? mlError.message : mlError} (Código: ${mlError && mlError.code ? mlError.code : mlError})`;

                // Exemplo comum: Categoria exige atributos específicos
                if (mlError.code === "validation_error") {
                    errorMessage += ". Verifique se a categoria exige atributos obrigatórios.";
                }
            }

            throw new Error(errorMessage);

        }
    }
}