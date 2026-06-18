import { conn } from "../../database/databaseConfig.ts";
import { type typeAnuncios } from "../../types/anuncios/type-anuncio.ts";

type OkPacket = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
}

type UpdateAnuncio = Partial<Omit<typeAnuncios, 'id' | 'data_cadastro' | 'data_recadastro'>>;

export class UpdateAnuncios {

    async update(empresa: string, anuncio: UpdateAnuncio, id: number): Promise<OkPacket> {
        const fields: string[] = [];
        const values: any[] = [];

        if (anuncio.integration_id !== undefined) {
            fields.push("integration_id = ?");
            values.push(anuncio.integration_id);
        }
        if (anuncio.plataforma !== undefined) {
            fields.push("plataforma = ?");
            values.push(anuncio.plataforma);
        }
        if (anuncio.estoque !== undefined) {
            fields.push("estoque = ?");
            values.push(anuncio.estoque);
        }
        if (anuncio.preco !== undefined) {
            fields.push("preco = ?");
            values.push(anuncio.preco);
        }
        if (anuncio.sku !== undefined) {
            fields.push("sku = ?");
            values.push(anuncio.sku);
        }
        if (anuncio.unidade_medida !== undefined) {
            fields.push("unidade_medida = ?");
            values.push(anuncio.unidade_medida);
        }
        if (anuncio.descricao !== undefined) {
            fields.push("descricao = ?");
            values.push(anuncio.descricao);
        }
        if (anuncio.titulo !== undefined) {
            fields.push("titulo = ?");
            values.push(anuncio.titulo);
        }
        if (anuncio.num_fabricante !== undefined) {
            fields.push("num_fabricante = ?");
            values.push(anuncio.num_fabricante);
        }
        if (anuncio.ativo !== undefined) {
            fields.push("ativo = ?");
            values.push(anuncio.ativo);
        }
        if (anuncio.sku_externo !== undefined) {
            fields.push("sku_externo = ?");
            values.push(anuncio.sku_externo);
        }
        if (anuncio.id_externo !== undefined) {
            fields.push("id_externo = ?");
            values.push(anuncio.id_externo);
        }
        if (anuncio.link !== undefined) {
            fields.push("link = ?");
            values.push(anuncio.link);
        }
        if (anuncio.thumbnail !== undefined) {
            fields.push("thumbnail = ?");
            values.push(anuncio.thumbnail);
        }

         if (anuncio.id_plataforma !== undefined) {
            fields.push("id_plataforma = ?");
            values.push(anuncio.id_plataforma);
        }
        

        if (fields.length === 0) {
            throw new Error("Nenhum campo para atualizar");
        }

        values.push(id);

        const sql = `UPDATE ${empresa}.anuncios SET ${fields.join(', ')} WHERE id = ?`;

        const [result] = await conn.query(sql, values);
        return result as OkPacket;
    }
}