import axios from "axios";
import { SelectAnuncios } from "../../../../models/anuncios/select.ts";
import { UpdateAnuncios } from "../../../../models/anuncios/update.ts";
import { DeleteAtributosAnuncios } from "../../../../models/atributos-anuncios/delete.ts";
import { InsertAtributosAnuncios } from "../../../../models/atributos-anuncios/insert.ts";
import { MlAnnouncementMapping } from "./ml-announcement-mapping.ts";
import { type IPayloadUpdateAnnouncement } from "./types/update-announcement.ts";
import { MlAuthServices } from "../services/auth/ml-auth-services.ts";


const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

/**
 * 
 */
export class UpdateMlAnnouncement {
        private readonly mlAnnouncementMapping:MlAnnouncementMapping;
        private readonly mlAuthServices: MlAuthServices  
    
    constructor(
          mlAnnouncementMapping:MlAnnouncementMapping, 
          mlAuthServices: MlAuthServices
        ){
            this.mlAnnouncementMapping =mlAnnouncementMapping; 
            this.mlAuthServices =mlAuthServices; 
        }
 
    /**
     *  atualiza o anuncio no mercadolivre.
     * @param cnpj cnpj da empresa
     * @param systemUserCode usuario do sistema 
     * @param mlUserId id do usuario no mercadoLivre. 
     * @param mlItemId id do item no Mercadolivre.
     * @param data dados do anuncio a ser processado.
     * @returns 
     */
    async updateItem(
        cnpj: string,
        systemUserCode: number,
        mlUserId: number,
        mlItemId: string,
        data: IPayloadUpdateAnnouncement
    ): Promise<{ success: boolean; ml_id: string; msg: string }> {
        const selectAnuncios = new SelectAnuncios();
        const updateAnuncios = new UpdateAnuncios();
        const deleteAtributosAnuncios = new DeleteAtributosAnuncios();
        const insertAtributosAnuncios = new InsertAtributosAnuncios();

        const database = `\`${cnpj}\``;

        try {
            const accessToken = await this.mlAuthServices.getValidMlAccessToken(cnpj, systemUserCode, mlUserId);
            
            const { mlPayload, localUpdate, attributes } = this.mlAnnouncementMapping.mapToUpdateAnnouncement(data);

            if (Object.keys(mlPayload).length > 0) {
                await axios.put(`${ML_API_URL}/items/${mlItemId}`, mlPayload, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                });
            }

            if (data.description !== undefined) {
                try {
                    await axios.put(
                        `${ML_API_URL}/items/${mlItemId}/description`,
                        { plain_text: data.description },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );
                } catch (e) {
                    console.error("Erro ao atualizar descrição no ML:", e);
                }
            }

            const anuncios = await selectAnuncios.findByParams(database, { id_plataforma: mlItemId });

            if (anuncios.length > 0) {
                const localAnuncio = anuncios[0];

                if (Object.keys(localUpdate).length > 0) {
                    await updateAnuncios.update(database, localUpdate, localAnuncio.id);
                }

                if (attributes !== undefined) {
                    await deleteAtributosAnuncios.delete(database, localAnuncio.id);
                    if (attributes.length > 0) {
                        for (const atr of attributes) {
                            await insertAtributosAnuncios.insert(database, {
                                id_anuncio: localAnuncio.id,
                                id_atributo: atr.id,
                                id_valor_atributo: null,
                                nome_atributo: atr.id,
                                valor_atributo: atr.value_name
                            });
                        }
                    }
                }
            } else {
                console.warn(`Anúncio com id_plataforma ${mlItemId} não encontrado no banco local.`);
            }

            return {
                success: true,
                ml_id: mlItemId,
                msg: "Anúncio atualizado com sucesso!"
            };

        } catch (error: any) {
            console.error("Erro ao atualizar anúncio:", JSON.stringify(error.response?.data, null, 2));

            let errorMessage = "Erro ao atualizar anúncio no Mercado Livre.";

            if (error.response?.data?.cause) {
                const mlError = error.response.data.cause[0];
                errorMessage = `ML Recusou: ${mlError?.message || mlError} (Código: ${mlError?.code || mlError})`;
            }

            throw new Error(errorMessage);
        }
    }
}
