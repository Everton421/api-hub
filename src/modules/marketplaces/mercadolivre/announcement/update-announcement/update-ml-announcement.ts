import { SelectAnuncios } from "../../../../../models/anuncios/select.ts";
import { UpdateAnuncios } from "../../../../../models/anuncios/update.ts";
import { DeleteAtributosAnuncios } from "../../../../../models/atributos-anuncios/delete.ts";
import { InsertAtributosAnuncios } from "../../../../../models/atributos-anuncios/insert.ts";
import { MlAnnouncementMapping } from "../mapping/ml-announcement-mapping.ts";
import { type IPayloadUpdateAnnouncement, type MlUpdateAttribute } from "../types/update-announcement.ts";
import { MlAuthServices } from "../../services/auth/ml-auth-services.ts";
import { UpdateDescriptionMlAnnouncementRequest } from "./update-description-ml-announcement-request.ts";
import { UpdateMlAnnouncementRequest } from "./update-ml-announcement-request.ts";


const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export class UpdateMlAnnouncement {
    private readonly mlAnnouncementMapping: MlAnnouncementMapping;
    private readonly mlAuthServices: MlAuthServices;
    private readonly updateDescriptionMlAnnouncement: UpdateDescriptionMlAnnouncementRequest;
    private readonly updateMlAnnouncementRequest: UpdateMlAnnouncementRequest;

    constructor(
        mlAnnouncementMapping: MlAnnouncementMapping,
        mlAuthServices: MlAuthServices,
        updateDescriptionMlAnnouncement: UpdateDescriptionMlAnnouncementRequest = new UpdateDescriptionMlAnnouncementRequest(),
        updateMlAnnouncementRequest: UpdateMlAnnouncementRequest = new UpdateMlAnnouncementRequest()
    ) {
        this.mlAnnouncementMapping = mlAnnouncementMapping;
        this.mlAuthServices = mlAuthServices;
        this.updateDescriptionMlAnnouncement = updateDescriptionMlAnnouncement;
        this.updateMlAnnouncementRequest = updateMlAnnouncementRequest;
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

        const database = `\`${cnpj}\``;

        try {
            const accessToken = await this.mlAuthServices.getValidMlAccessToken(cnpj, systemUserCode, mlUserId);

            const { mlPayload, localUpdate, attributes } = this.mlAnnouncementMapping.mapToUpdateAnnouncement(data);

            if (Object.keys(mlPayload).length > 0) {
                await this.updateMlAnnouncementRequest.update(ML_API_URL, mlItemId, mlPayload, accessToken);
            }

            if (data.description !== undefined) {
                try {
                    await this.updateDescriptionMlAnnouncement.update(ML_API_URL, mlItemId, data.description, accessToken);
                } catch (e) {
                    console.error("Erro ao atualizar descrição no ML:", e);
                }
            }

            const anuncios = await selectAnuncios.findByParams(database, { id_plataforma: mlItemId });

            if (anuncios.length > 0) {
                const localAnuncio = anuncios[0];
                await this.updateLocalAnuncio(database, localAnuncio.id, localUpdate);
                await this.updateLocalAttributes(database, localAnuncio.id, attributes);
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

    private async updateLocalAnuncio(database: string, id: number, localUpdate: Record<string, any>): Promise<void> {
        if (Object.keys(localUpdate).length === 0) return;
        const updateAnuncios = new UpdateAnuncios();
        await updateAnuncios.update(database, localUpdate, id);
    }

    private async updateLocalAttributes(database: string, anuncioId: number, attributes?: MlUpdateAttribute[]): Promise<void> {
        if (attributes === undefined) return;

        const deleteAtributosAnuncios = new DeleteAtributosAnuncios();
        const insertAtributosAnuncios = new InsertAtributosAnuncios();

        await deleteAtributosAnuncios.delete(database, anuncioId);

        for (const atr of attributes) {
            await insertAtributosAnuncios.insert(database, {
                id_anuncio: anuncioId,
                id_atributo: atr.id,
                id_valor_atributo: null,
                nome_atributo: atr.id,
                valor_atributo: atr.value_name
            });
        }
    }
}
