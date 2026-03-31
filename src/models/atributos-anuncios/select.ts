import { conn } from "../../database/databaseConfig";
import { typeAtributosAnuncios } from "../../types/atributos-anuncios/type-atributos-anuncios";

export class SelectAtributosAnuncios {

    async buscaPorIdAnuncio(empresa: string, id: number): Promise<typeAtributosAnuncios[]> {
        let sql = ` SELECT   *,
            DATE_FORMAT( data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT( data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.atributos_anuncios  
         where  id_anuncio = ? 
         `;

        const params = [id];
        const [result] = await conn.query(sql, params);
        return result as typeAtributosAnuncios[];
    }

}
