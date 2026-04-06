import { conn } from "../../database/databaseConfig.ts";
import { type typeAtributosAnuncios } from "../../types/atributos-anuncios/type-atributos-anuncios.ts";

type NewAtributo = Omit<typeAtributosAnuncios, 'id'>;

export class SelectAtributosAnuncios {

    async findByAnuncioId(empresa: string, idAnuncio: number): Promise<typeAtributosAnuncios[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.atributos_anuncios  
         WHERE id_anuncio = ? 
        `;

        const [result] = await conn.query(sql, [idAnuncio]);
        return result as typeAtributosAnuncios[];
    }
}