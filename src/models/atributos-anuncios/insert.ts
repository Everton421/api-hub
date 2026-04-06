import { conn } from "../../database/databaseConfig.ts";
import {type typeAtributosAnuncios } from "../../types/atributos-anuncios/type-atributos-anuncios.ts";
import {  type ResultSetHeader } from "mysql2/promise";

type NewAtributo = Omit<typeAtributosAnuncios, 'id'>;

export class InsertAtributosAnuncios {

    async insert(empresa: string, atributo: NewAtributo): Promise<ResultSetHeader> {
        const sql = `
            INSERT INTO ${empresa}.atributos_anuncios
                SET 
                    id_anuncio = ?,
                    id_atributo = ?,
                    nome_atributo = ?,
                    valor_atributo = ?,
                    id_valor_atributo = ?
        `;

        const values = [
            atributo.id_anuncio,
            atributo.id_atributo,
            atributo.nome_atributo,
            atributo.valor_atributo,
            atributo.id_valor_atributo
        ];

        const [result] = await conn.query<ResultSetHeader>(sql, values);
        return result;
    }
}