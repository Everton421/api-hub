import axios from "axios";
import { SelectAnuncios } from "../../../../models/anuncios/select.ts";
import { UpdateAnuncios } from "../../../../models/anuncios/update.ts";
import { DeleteAtributosAnuncios } from "../../../../models/atributos-anuncios/delete.ts";
import { InsertAtributosAnuncios } from "../../../../models/atributos-anuncios/insert.ts";
import { getValidMlAccessToken } from "./ml-auth-service.ts";

export interface IUpdateMlItem {
    title?: string;
    price?: number;
    available_quantity?: number;
    listing_type_id?: string;
    description?: string;
    pictures?: string[];
    attributes?: { id: string; value_name: string }[];
    category_id?: string;
    shipping?: any;
    thumbnail?: string;
}

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export class UpdateMlItemService {
    async updateItem(
        cnpj: string,
        systemUserCode: number,
        mlUserId: number,
        mlItemId: string,
        data: IUpdateMlItem
    ): Promise<{ success: boolean; ml_id: string; msg: string }> {
        const selectAnuncios = new SelectAnuncios();
        const updateAnuncios = new UpdateAnuncios();
        const deleteAtributosAnuncios = new DeleteAtributosAnuncios();
        const insertAtributosAnuncios = new InsertAtributosAnuncios();

        const database = `\`${cnpj}\``;

        try {
            const accessToken = await getValidMlAccessToken(cnpj, systemUserCode, mlUserId);

            const mlPayload: Record<string, any> = {};
            if (data.title !== undefined) mlPayload.title = data.title;
            if (data.price !== undefined) mlPayload.price = data.price;
            if (data.available_quantity !== undefined) mlPayload.available_quantity = data.available_quantity;
            if (data.listing_type_id !== undefined) mlPayload.listing_type_id = data.listing_type_id;
            if (data.category_id !== undefined) mlPayload.category_id = data.category_id;
            if (data.attributes !== undefined) mlPayload.attributes = data.attributes;
            if (data.shipping !== undefined) mlPayload.shipping = data.shipping;
            if (data.pictures !== undefined) {
                mlPayload.pictures = data.pictures.map(url => ({ source: url }));
            }

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
                const localUpdateData: Record<string, any> = {};

                if (data.title !== undefined) localUpdateData.titulo = data.title;
                if (data.price !== undefined) localUpdateData.preco = data.price;
                if (data.available_quantity !== undefined) localUpdateData.estoque = data.available_quantity;
                if (data.description !== undefined) localUpdateData.descricao = data.description;
                if (data.thumbnail !== undefined) localUpdateData.thumbnail = data.thumbnail;

                if (Object.keys(localUpdateData).length > 0) {
                    await updateAnuncios.update(database, localUpdateData, localAnuncio.id);
                }

                if (data.attributes !== undefined) {
                    await deleteAtributosAnuncios.delete(database, localAnuncio.id);
                    if (data.attributes.length > 0) {
                        for (const atr of data.attributes) {
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
