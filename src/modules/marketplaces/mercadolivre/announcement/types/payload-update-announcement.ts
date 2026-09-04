/**
 * Dados do anúncio para enviar para o Mercado Livre (campos opcionais).
 */
export interface ShippingPayload {
    mode?: string;
    local_pick_up?: boolean;
    free_shipping?: boolean;
    methods?: unknown[];
    dimensions?: unknown;
    tags?: unknown[];
    logistic_type?: string;
    store_pick_up?: boolean;
}

/**
 *  Dados brutos a serem mapeados para gerar o payload para
 * atualizar o anuncio no mercadolivre
 */
export interface IPayloadToMappingAnnouncement {
    title?: string;
    price?: number;
    available_quantity?: number;
    listing_type_id?: string;
    description?: string;
    pictures?: string[];
    attributes?: MlUpdateAttribute[];
    category_id?: string;
    shipping?: ShippingPayload;
    thumbnail?: string;
}

export type MlUpdateAttribute = { id: string; value_name: string };

/**
 * Payload de atualização do anúncio no Mercado Livre.
 * É o resultado do mapeamento de produto -> anúncio.
 * `localId` é o id do anúncio no banco local.
 * `systemUserCode`/`mlUserId` são usados para resolver o token por anúncio.
 */
export type IPayloadToUpdateMLAnnouncement = Partial<{
    title: string;
    price: number;
    description?: string;
    available_quantity: number;
    listing_type_id: string;
    category_id: string;
    attributes: MlUpdateAttribute[];
    shipping: ShippingPayload;
    pictures: { source: string }[];
    thumbnail: string;
}> & {
    localId: number;
    systemUserCode?: number;
    mlUserId?: number;
    id_plataforma?: string;
};
