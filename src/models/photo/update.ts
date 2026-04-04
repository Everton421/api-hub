import { conn } from "../../database/databaseConfig.ts";
import {type PhotoType } from "./types/photo-type.ts";

type PhotoUpdate = Partial<Omit<PhotoType, 'codigo'>> & { codigo: number };

export class UpdatePhoto {
    async update(dbName: string, photo: PhotoUpdate): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (photo.produto !== undefined) {
            fields.push("produto = ?");
            values.push(photo.produto);
        }
        if (photo.sequencia !== undefined) {
            fields.push("sequencia = ?");
            values.push(photo.sequencia);
        }
        if (photo.descricao !== undefined) {
            fields.push("descricao = ?");
            values.push(photo.descricao);
        }
        if (photo.link !== undefined) {
            fields.push("link = ?");
            values.push(photo.link);
        }
        if (photo.foto !== undefined) {
            fields.push("foto = ?");
            values.push(photo.foto);
        }
        if (photo.data_cadastro !== undefined) {
            fields.push("data_cadastro = ?");
            values.push(photo.data_cadastro);
        }
        if (photo.data_recadastro !== undefined) {
            fields.push("data_recadastro = ?");
            values.push(photo.data_recadastro);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        values.push(photo.codigo);

        const sql = `UPDATE ${dbName}.fotos_produtos SET ${fields.join(', ')} WHERE codigo = ?`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }

    async deleteByProduct(dbName: string, productCode: number): Promise<{ affectedRows: number }> {
        const sql = `DELETE FROM ${dbName}.fotos_produtos WHERE produto = ?`;

        const [result] = await conn.query(sql, [productCode]);
        return { affectedRows: (result as any).affectedRows };
    }
}