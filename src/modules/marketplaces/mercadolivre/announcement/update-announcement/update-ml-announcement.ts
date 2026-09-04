import { ApiClient } from "../../../../../services/lib/api-client.ts";
import { parseMlErrorMessage } from "../../utils/MlError.ts";
import { type IPayloadResultFunction } from "../types/payload-results-function-ml.ts";
import { type IPayloadToUpdateMLAnnouncement } from "../types/payload-update-announcement.ts";
import { UpdateMlAnnouncementDriver } from "../driver/update-ml-announcement-driver.ts";

/**
 * Atualiza o anúncio no Mercado Livre.
 */
export class UpdateMlAnnouncement extends UpdateMlAnnouncementDriver {
    /**
     * Atualiza o anúncio no Mercado Livre.
     * Os campos de contexto local (localId, systemUserCode, mlUserId, id_plataforma)
     * não são enviados à API, apenas os campos de domínio do ML.
     * @param mlItemId Id do anúncio no Mercado Livre
     * @param payload dados do anúncio para atualizar no Mercado Livre
     * @returns resultado da operação
     */
    async updateItem(mlItemId: string, payload: Partial<IPayloadToUpdateMLAnnouncement>): Promise<IPayloadResultFunction> {
        const fieldsToUpdate = this.buildMlPayload(payload);

        try {
            if (Object.keys(fieldsToUpdate).length > 0) {
                await this.mercadolivreApi.put(`/items/${mlItemId}`, fieldsToUpdate);
            }

            if (payload.description !== undefined) {
                try {
                    await this.mercadolivreApi.put<any>(`/items/${mlItemId}/description`, {
                        plain_text: payload.description
                    });
                } catch (e) {
                    console.error("Erro ao atualizar descrição no ML:", e);
                }
            }

            return {
                success: true,
                affectedFields: Object.keys(fieldsToUpdate).length,
                mlItemId,
                message: "Anúncio atualizado com sucesso!",
            };
        } catch (error) {
            console.error("Erro ao atualizar anúncio:", JSON.stringify((error as any)?.response?.data, null, 2));
            throw new Error(parseMlErrorMessage(error, "Erro ao atualizar anúncio no Mercado Livre."));
        }
    }

    /**
     * Filtra apenas os campos de domínio aceitos pela API do ML,
     * removendo os campos de contexto local.
     */
    private buildMlPayload(payload: Partial<IPayloadToUpdateMLAnnouncement>): Record<string, unknown> {
        const mlPayload: Record<string, unknown> = {};

        if (payload.title !== undefined) mlPayload.title = payload.title;
        if (payload.price !== undefined) mlPayload.price = payload.price;
        if (payload.available_quantity !== undefined) mlPayload.available_quantity = payload.available_quantity;
        if (payload.listing_type_id !== undefined) mlPayload.listing_type_id = payload.listing_type_id;
        if (payload.category_id !== undefined) mlPayload.category_id = payload.category_id;
        if (payload.attributes !== undefined) mlPayload.attributes = payload.attributes;
        if (payload.shipping !== undefined) mlPayload.shipping = payload.shipping;
        if (payload.pictures !== undefined) mlPayload.pictures = payload.pictures;

        return mlPayload;
    }
}
