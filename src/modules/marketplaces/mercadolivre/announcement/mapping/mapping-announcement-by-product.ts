import { type typeAtributosAnuncios } from "../../../../../types/atributos-anuncios/type-atributos-anuncios.ts";
import { MapProductToAnnouncementDriver } from "../driver/map-product-to-announcement-driver.ts";
import { type IPayloadToMappingAnnouncement, type IPayloadToUpdateMLAnnouncement } from "../types/payload-update-announcement.ts";

export class MappingAnnouncementByProduct extends MapProductToAnnouncementDriver {
    private readonly IMAGE_ATTRIBUTE_ID = 'IMAGEM_ANUNCIO';

    async mapProductToUpdateAnnouncement(cnpj: string, codeProduct: number): Promise<IPayloadToUpdateMLAnnouncement[]> {
        const dbName = `\`${cnpj}\``;

        const produtos = await this.selectProduct.findByCode(dbName, codeProduct);
        const produto = produtos[0];
        const price = Number(produto.preco);

        const resultProdSector = await this.selectProductSector.findStockByProduct(dbName, codeProduct);
        const availableQuantity = resultProdSector.length ? resultProdSector[0].estoque : 0;

        const fotos = await this.selectPhoto.findByProduct(dbName, codeProduct);
        const pictures = this.buildPictures(fotos.map(f => f.link));
        const description = produto.descricao?.trim() || produto.observacoes1?.trim() || '';

        const anuncios = await this.selectAnuncios.findByParams(dbName, {
            codigo_produto: codeProduct,
            plataforma: 'ML',
            ativo: 'S',
            limit: 1000
        });

        const payloads: IPayloadToUpdateMLAnnouncement[] = [];
        for (const anuncio of anuncios) {
            const attributes = await this.buildAttributes(dbName, anuncio.id);
            const { systemUserCode, mlUserId } = await this.resolveIntegration(anuncio.integration_id);

            const payload = this.buildPayload(
                {
                    price,
                    available_quantity: availableQuantity,
                    title: anuncio.titulo,
                    pictures,
                    description,
                    attributes,
                },
                {
                    idLocal: anuncio.id,
                    idPlataforma: anuncio.id_plataforma,
                    systemUserCode,
                    mlUserId,
                }
            );
            payloads.push(payload);
        }
        return payloads;
    }

    private async resolveIntegration(integrationId: number): Promise<{ systemUserCode?: number; mlUserId?: number }> {
        const integracoes = await this.selectUsersMl.findByIntegrationInternalId(Number(integrationId));
        if (integracoes.length === 0) return {};

        const integracao = integracoes[0];
        return {
            systemUserCode: Number(integracao.system_user_code),
            mlUserId: Number(integracao.ml_user_id),
        };
    }

    private buildPictures(links: (string | null)[]): string[] {
        return links.filter((link): link is string => !!link && link.trim().length > 0);
    }

    private buildPayload(
        data: IPayloadToMappingAnnouncement,
        ctx: { idLocal: number; idPlataforma: string; systemUserCode?: number; mlUserId?: number }
    ): IPayloadToUpdateMLAnnouncement {
        const payload: IPayloadToUpdateMLAnnouncement = {
            localId: ctx.idLocal,
            id_plataforma: ctx.idPlataforma,
            systemUserCode: ctx.systemUserCode,
            mlUserId: ctx.mlUserId,
            price: data.price,
            available_quantity: data.available_quantity,
            title: data.title,
        };

        if (data.description) {
            payload.description = data.description;
        }
        if (data.pictures && data.pictures.length > 0) {
            payload.pictures = data.pictures.map(i => ({ source: i }));
        }
        if (data.attributes && data.attributes.length > 0) {
            payload.attributes = data.attributes;
        }

        return payload;
    }

    private async buildAttributes(
        dbName: string,
        idAnuncio: number
    ): Promise<{ id: string; value_name: string }[] | undefined> {
        const atributos: typeAtributosAnuncios[] = await this.selectAtributosAnuncios.findByAnuncioId(dbName, idAnuncio);
        const filtered = atributos.filter(a => a.nome_atributo !== this.IMAGE_ATTRIBUTE_ID);

        if (filtered.length === 0) return undefined;

        return filtered.map(a => ({
            id: a.id_atributo || a.nome_atributo || '',
            value_name: a.valor_atributo || ''
        }));
    }
}
