import { InsertAnuncios } from "../../../../../models/anuncios/insert.ts";
import { InsertAtributosAnuncios } from "../../../../../models/atributos-anuncios/insert.ts";
import { delay } from "../../../../../services/delay-service/delay.ts";
import { ApiClient } from "../../../../../services/lib/api-client.ts";
import { MlAnnouncementMapping } from "../mapping/ml-announcement-mapping.ts";
import { type IPayloadCreateAnnouncement } from "../types/payload-create-announcement.ts";
import { parseMlErrorMessage } from "../../utils/MlError.ts";

type MlCreateResponse = { id: string; permalink: string };


export class CreateMlAnnouncementService {

    private mercadolivreApi:ApiClient;
    
    constructor(
         mercadolivreApi:ApiClient   ) {   this.mercadolivreApi = mercadolivreApi;
    }

    async publishItem(cnpj: string,  codigo_produto: number, integrationId: number, data: IPayloadCreateAnnouncement) {
        const insertAnuncios = new InsertAnuncios();
        const insertAtributosAnuncios = new InsertAtributosAnuncios();
        const mlAnnouncementMapping = new MlAnnouncementMapping();

        try {

            let payloadCreateMlAnnouncement = mlAnnouncementMapping.mapToCreateAnnouncement(data)

            const database = `\`${cnpj}\``;

            await delay(1);
            const ean = data.ean || ''

            const response = await this.mercadolivreApi.post<MlCreateResponse>('/items', payloadCreateMlAnnouncement );

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
                         await this.mercadolivreApi.put<any>(`/items/${response.data.id}/description`,  { plain_text: data.description } );
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

            let errorMessage = parseMlErrorMessage(error, "Erro ao publicar no Mercado Livre.");

            // Exemplo comum: Categoria exige atributos específicos
            if (error.response?.data?.cause?.[0]?.code === "validation_error") {
                errorMessage += ". Verifique se a categoria exige atributos obrigatórios.";
            }

            throw new Error(errorMessage);

        }
    }
}