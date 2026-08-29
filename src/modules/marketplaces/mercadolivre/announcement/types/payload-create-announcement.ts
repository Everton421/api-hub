export interface IPayloadCreateAnnouncement {
    title: string;
    price: number;
    quantity: number;
    sku?:string
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