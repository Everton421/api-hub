import { UpdateAnuncios } from "../../../../../models/anuncios/update.ts";
import { DeleteAtributosAnuncios } from "../../../../../models/atributos-anuncios/delete.ts";
import { InsertAtributosAnuncios } from "../../../../../models/atributos-anuncios/insert.ts";
import { type MlUpdateAttribute, type IPayloadToUpdateMLAnnouncement } from "../types/payload-update-announcement.ts";

export class UpdateLocalMlAnnouncement {
    private readonly updateAnuncios: UpdateAnuncios;
    private readonly insertAtributosAnuncios: InsertAtributosAnuncios;
    private readonly deleteAtributosAnuncios: DeleteAtributosAnuncios;

    constructor(
        updateAnuncios: UpdateAnuncios,
        insertAtributosAnuncios: InsertAtributosAnuncios,
        deleteAtributosAnuncios: DeleteAtributosAnuncios
    ) {
        this.updateAnuncios = updateAnuncios;
        this.insertAtributosAnuncios = insertAtributosAnuncios;
        this.deleteAtributosAnuncios = deleteAtributosAnuncios;
    }

    async updateLocalAnuncio(database: string, id: number, data: IPayloadToUpdateMLAnnouncement): Promise<void> {
        const localUpdate = this.toLocalAnuncioUpdate(data);
        if (Object.keys(localUpdate).length === 0) return;
        await this.updateAnuncios.update(database, localUpdate, id);
    }

    async updateLocalAttributes(database: string, anuncioId: number, attributes?: MlUpdateAttribute[]): Promise<void> {
        if (attributes === undefined) return;

        await this.deleteAtributosAnuncios.delete(database, anuncioId);

        for (const atr of attributes) {
            await this.insertAtributosAnuncios.insert(database, {
                id_anuncio: anuncioId,
                id_atributo: atr.id,
                id_valor_atributo: null,
                nome_atributo: atr.id,
                valor_atributo: atr.value_name
            });
        }
    }

    private toLocalAnuncioUpdate(data: IPayloadToUpdateMLAnnouncement): Record<string, unknown> {
        const localUpdate: Record<string, unknown> = {};

        if (data.title !== undefined) localUpdate.titulo = data.title;
        if (data.price !== undefined) localUpdate.preco = data.price;
        if (data.available_quantity !== undefined) localUpdate.estoque = data.available_quantity;
        if (data.description !== undefined) localUpdate.descricao = data.description;
        if (data.thumbnail !== undefined) localUpdate.thumbnail = data.thumbnail;

        return localUpdate;
    }
}
