export interface IPayloadUpdateAnnouncement { 
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

export type MlUpdateAttribute = { id: string; value_name: string };

export type MlUpdatePayload = {
    mlPayload: Record<string, any>;
    localUpdate: Record<string, any>;
    attributes?: MlUpdateAttribute[];
};
