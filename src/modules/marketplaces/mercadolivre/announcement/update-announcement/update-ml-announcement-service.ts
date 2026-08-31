import { SelectAnuncios } from "../../../../../models/anuncios/select.ts";
import { SelectProduct } from "../../../../../models/product/select.ts";
import { SelectProductSector } from "../../../../../models/product-sector/select.ts";
import { SelectUsersMlIntegrations } from "../../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { SelectAtributosAnuncios } from "../../../../../models/atributos-anuncios/select.ts";
import { type typeAnuncios } from "../../../../../types/anuncios/type-anuncio.ts";
import { type typeAtributosAnuncios } from "../../../../../types/atributos-anuncios/type-atributos-anuncios.ts";
import { type ProductType } from "../../../../../models/product/types/product-type.ts";
import { UpdateMlAnnouncement } from "./update-ml-announcement.ts";
import { SelectPhoto } from "../../../../../models/photo/select.ts";
import { type IPayloadUpdateAnnouncement } from "../types/update-announcement.ts";

const IMAGE_ATTRIBUTE_ID = 'IMAGEM_ANUNCIO';

export type SyncAnuncioResult = {
    id_plataforma: string;
    ml_user_id?: number;
    system_user_code?: number;
    success: boolean;
    msg: string;
};

export type SyncProductResult = {
    codigo_produto: number;
    price?: number;
    available_quantity: number;
    total_anuncios: number;
    updated: number;
    failed: number;
    details: SyncAnuncioResult[];
    msg?: string;
};

export class UpdateMlAnnouncementService {
    private readonly updateMlAnnouncement: UpdateMlAnnouncement;

    constructor(
        updateMlAnnouncement: UpdateMlAnnouncement,
    ) {
        this.updateMlAnnouncement = updateMlAnnouncement;
    }

    async syncProductByCode(cnpj: string, codigoProduto: number): Promise<SyncProductResult> {
        const dbName = `\`${cnpj}\``;

        const selectAnuncios = new SelectAnuncios();
        const selectProduct = new SelectProduct();
        const selectProductSector = new SelectProductSector();
        const selectUsersMl = new SelectUsersMlIntegrations();
        const selectPhoto = new SelectPhoto();
        const selectAtributosAnuncios = new SelectAtributosAnuncios();

        const result: SyncProductResult = {
            codigo_produto: codigoProduto,
            available_quantity: 0,
            total_anuncios: 0,
            updated: 0,
            failed: 0,
            details: []
        };

        const produtos = await selectProduct.findByCode(dbName, codigoProduto);
        if (produtos.length === 0) {
            result.msg = `Produto ${codigoProduto} não encontrado no banco local.`;
            return result;
        }
        const produto = produtos[0];
        const price = Number(produto.preco);

        const resultProdSector = await selectProductSector.findStockByProduct(dbName, codigoProduto);
        const availableQuantity = resultProdSector.length ? resultProdSector[0].estoque : 0;
        result.price = price;
        result.available_quantity = availableQuantity;

        const fotos = await selectPhoto.findByProduct(dbName, codigoProduto);
        const pictures = this.buildPictures(fotos.map(f => f.link));
        const description = this.buildDescription(produto);

        const anuncios = await selectAnuncios.findByParams(dbName, {
            codigo_produto: codigoProduto,
            plataforma: 'ML',
            ativo: 'S',
            limit: 1000
        });

        result.total_anuncios = anuncios.length;

        for (const anuncio of anuncios) {
            const attributes = await this.buildAttributes(dbName, selectAtributosAnuncios, anuncio.id);
            const payload = this.buildPayload({
                price,
                available_quantity: availableQuantity,
                title: anuncio.titulo,
                pictures,
                description,
                attributes
            });
            const detail = await this.syncAnuncio(cnpj, anuncio, payload, selectUsersMl);
            result.details.push(detail);
            if (detail.success) {
                result.updated += 1;
            } else {
                result.failed += 1;
            }
        }

        return result;
    }

    private buildPayload(data: IPayloadUpdateAnnouncement): IPayloadUpdateAnnouncement {
        const payload: IPayloadUpdateAnnouncement = {
            price: data.price,
            available_quantity: data.available_quantity,
            title: data.title
        };

        if (data.description) {
            payload.description = data.description;
        }
        if (data.pictures && data.pictures.length > 0) {
            payload.pictures = data.pictures;
        }
        if (data.attributes && data.attributes.length > 0) {
            payload.attributes = data.attributes;
        }

        return payload;
    }

    private buildPictures(links: (string | null)[]): string[] {
        return links.filter((link): link is string => !!link && link.trim().length > 0);
    }

    private buildDescription(produto: ProductType): string {
        return produto.descricao?.trim() || produto.observacoes1?.trim() || '';
    }

    private async buildAttributes(
        dbName: string,
        selectAtributosAnuncios: SelectAtributosAnuncios,
        idAnuncio: number
    ): Promise<{ id: string; value_name: string }[] | undefined> {
        const atributos: typeAtributosAnuncios[] = await selectAtributosAnuncios.findByAnuncioId(dbName, idAnuncio);
        const filtered = atributos.filter(a => a.nome_atributo !== IMAGE_ATTRIBUTE_ID);

        if (filtered.length === 0) return undefined;

        return filtered.map(a => ({
            id: a.id_atributo || a.nome_atributo || '',
            value_name: a.valor_atributo || ''
        }));
    }

    private async syncAnuncio(
        cnpj: string,
        anuncio: typeAnuncios,
        payload: IPayloadUpdateAnnouncement,
        selectUsersMl: SelectUsersMlIntegrations,
    ): Promise<SyncAnuncioResult> {
        const base: SyncAnuncioResult = {
            id_plataforma: anuncio.id_plataforma,
            success: false,
            msg: ""
        };

        if (!anuncio.id_plataforma) {
            base.msg = "Anúncio sem id_plataforma (item no Mercado Livre).";
            return base;
        }

        const integracoes = await selectUsersMl.findByIntegrationInternalId(Number(anuncio.integration_id));
        if (integracoes.length === 0) {
            base.msg = `Integração ML não encontrada para integration_id ${anuncio.integration_id}.`;
            return base;
        }

        const integracao = integracoes[0];
        const systemUserCode = Number(integracao.system_user_code);
        const mlUserId = Number(integracao.ml_user_id);

        base.system_user_code = systemUserCode;
        base.ml_user_id = mlUserId;

        try {
            const updated = await this.updateMlAnnouncement.updateItem(
                cnpj,
                systemUserCode,
                mlUserId,
                anuncio.id_plataforma,
                payload
            );
            base.success = updated.success;
            base.msg = updated.msg;
        } catch (e: any) {
            base.msg = e instanceof Error ? e.message : String(e);
        }

        return base;
    }
}
