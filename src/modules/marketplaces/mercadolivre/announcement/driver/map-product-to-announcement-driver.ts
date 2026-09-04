import { SelectAnuncios } from "../../../../../models/anuncios/select.ts";
import { SelectAtributosAnuncios } from "../../../../../models/atributos-anuncios/select.ts";
import { SelectPhoto } from "../../../../../models/photo/select.ts";
import { SelectProductSector } from "../../../../../models/product-sector/select.ts";
import { SelectProduct } from "../../../../../models/product/select.ts";
import { SelectUsersMlIntegrations } from "../../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { type IPayloadToUpdateMLAnnouncement } from "../types/payload-update-announcement.ts";
    


export abstract class MapProductToAnnouncementDriver {


    public readonly selectAnuncios: SelectAnuncios;
    public readonly selectProduct: SelectProduct;
    public readonly selectProductSector: SelectProductSector;
    public readonly selectUsersMl: SelectUsersMlIntegrations;
    public readonly selectPhoto: SelectPhoto;
    public readonly selectAtributosAnuncios: SelectAtributosAnuncios;

    constructor(
        selectAnuncios: SelectAnuncios,
        selectProduct: SelectProduct,
        selectProductSector: SelectProductSector,
        selectUsersMl: SelectUsersMlIntegrations,
        selectPhoto: SelectPhoto,
        selectAtributosAnuncios: SelectAtributosAnuncios,
    ) {
        this.selectAnuncios = selectAnuncios;
        this.selectProduct = selectProduct;
        this.selectProductSector = selectProductSector;
        this.selectUsersMl = selectUsersMl;
        this.selectPhoto = selectPhoto;
        this.selectAtributosAnuncios = selectAtributosAnuncios;
    }


    abstract mapProductToUpdateAnnouncement(cnpj: string, codeProduct: number): Promise<Partial<IPayloadToUpdateMLAnnouncement>[]>

}