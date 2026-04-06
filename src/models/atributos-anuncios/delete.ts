import { conn } from "../../database/databaseConfig.ts";
import { type ResultSetHeader } from "mysql2/promise";

export class DeleteAtributosAnuncios {

    async delete(empresa: string, idAnuncio: number): Promise<ResultSetHeader> {
        const sql = `DELETE FROM ${empresa}.atributos_anuncios WHERE id_anuncio = ?`;
        const [result] = await conn.query<ResultSetHeader>(sql, [idAnuncio]);
        return result;
    }
}