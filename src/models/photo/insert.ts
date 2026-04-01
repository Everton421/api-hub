import { conn } from "../../database/databaseConfig";
import { PhotoType } from "./types/photo-type";

export class InsertPhoto {
    async insert(dbName: string, photo: Omit<PhotoType, 'codigo'>): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.fotos_produtos 
            (produto, sequencia, descricao, link, foto, data_cadastro, data_recadastro)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            photo.produto,
            photo.sequencia,
            photo.descricao,
            photo.link,
            photo.foto,
            photo.data_cadastro,
            photo.data_recadastro
        ];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }

    async insertOrUpdate(dbName: string, photo: Omit<PhotoType, 'codigo'>): Promise<{ affectedRows: number }> {
        const sql = `INSERT INTO ${dbName}.fotos_produtos 
            (produto, sequencia, descricao, link, foto, data_cadastro, data_recadastro)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                sequencia = VALUES(sequencia),
                descricao = VALUES(descricao),
                link = VALUES(link),
                foto = VALUES(foto),
                data_recadastro = VALUES(data_recadastro)`;

        const values = [
            photo.produto,
            photo.sequencia,
            photo.descricao,
            photo.link,
            photo.foto,
            photo.data_cadastro,
            photo.data_recadastro
        ];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}