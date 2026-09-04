import { SelectAnuncios } from "../../../../../models/anuncios/select.ts";
import { ApiClient } from "../../../../../services/lib/api-client.ts";
import { MappingAnnouncementByProduct } from "../mapping/mapping-announcement-by-product.ts";
import { UpdateLocalMlAnnouncement } from "./update-local-ml-announcement.ts";
import { UpdateMlAnnouncement } from "./update-ml-announcement.ts";
import { type IPayloadToUpdateMLAnnouncement } from "../types/payload-update-announcement.ts";
import { delay } from "../../../../../services/delay-service/delay.ts";

/**
 * Cria um ApiClient autenticado para um anúncio específico.
 * O token é resolvido por anúncio (sistema + usuário ML) e pode renovar.
 */
export type ApiClientFactory = (
    cnpj: string,
    systemUserCode: number,
    mlUserId: number
) => Promise<ApiClient>;

export type SyncResult = {
    totalAnuncios: number;
    atualizados: number;
    falhas: number;
    msgs: string[];
};

export class SyncMlAnnouncementService {
    private readonly apiClientFactory: ApiClientFactory;
    private readonly mappingAnnouncementByProduct: MappingAnnouncementByProduct;
    private readonly updateLocalMlAnnouncement: UpdateLocalMlAnnouncement;
    private readonly selectAnuncios: SelectAnuncios;

    constructor(
        apiClientFactory: ApiClientFactory,
        mappingAnnouncementByProduct: MappingAnnouncementByProduct,
        updateLocalMlAnnouncement: UpdateLocalMlAnnouncement,
        selectAnuncios: SelectAnuncios
    ) {
        this.apiClientFactory = apiClientFactory;
        this.mappingAnnouncementByProduct = mappingAnnouncementByProduct;
        this.updateLocalMlAnnouncement = updateLocalMlAnnouncement;
        this.selectAnuncios = selectAnuncios;
    }

    async syncProductByCode(cnpj: string, codigoProduto: number): Promise<SyncResult> {
        const dbName = `\`${cnpj}\``;

        const dataAnnouncementToUpdate = await this.mappingAnnouncementByProduct.mapProductToUpdateAnnouncement(cnpj, codigoProduto);

        const result: SyncResult = {
            totalAnuncios: dataAnnouncementToUpdate.length,
            atualizados: 0,
            falhas: 0,
            msgs: []
        };

       for (let i = 0; i < dataAnnouncementToUpdate.length; i++) {
        if (i > 0) await delay(1.5); // 150ms entre anúncios
                try {
                    await this.updateSingleAnnouncement(cnpj, dbName, dataAnnouncementToUpdate[i]);
                    result.atualizados++;
                } catch (e) {
                    result.falhas++;
                    result.msgs.push(e instanceof Error ? e.message : String(e));
                }
            }

        return result;
    }

    private async updateSingleAnnouncement(cnpj: string, dbName: string, announcement: IPayloadToUpdateMLAnnouncement): Promise<void> {
        if (!announcement.id_plataforma) {
            throw new Error("Anúncio sem id_plataforma (item no Mercado Livre).");
        }
        if (announcement.systemUserCode === undefined || announcement.mlUserId === undefined) {
            throw new Error(`Integração ML não encontrada para o anúncio local ${announcement.localId}.`);
        }

        const apiClient = await this.apiClientFactory(cnpj, announcement.systemUserCode, announcement.mlUserId);
        const updateMlAnnouncement = new UpdateMlAnnouncement(apiClient);

        const result = await updateMlAnnouncement.updateItem(announcement.id_plataforma, announcement);
        if (!result.success) {
            throw new Error(result.message);
        }

        const localDataAnnouncement = await this.selectAnuncios.findById(dbName, announcement.localId);
        if (localDataAnnouncement.length === 0) {
            throw new Error(`Anúncio local ${announcement.localId} não encontrado.`);
        }
        const { id } = localDataAnnouncement[0];

        await this.updateLocalMlAnnouncement.updateLocalAnuncio(dbName, id, announcement);
        await this.updateLocalMlAnnouncement.updateLocalAttributes(dbName, id, announcement.attributes);
    }
}
