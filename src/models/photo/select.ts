import { conn } from "../../database/databaseConfig.ts";
import { type PhotoType } from "./types/photo-type.ts";

export class SelectPhoto {
    async findAll(dbName: string, dataRecadastro?: string): Promise<PhotoType[]> {
        let sql = ` SELECT *,
            TO_BASE64(foto) AS foto,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.fotos_produtos `;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ?';
            params.push(dataRecadastro);
        }

        const [result] = await conn.query(sql, params);
        return result as PhotoType[];
    }

    async findByProduct(dbName: string, productCode: number): Promise<PhotoType[]> {
        const sql = ` SELECT *,
            TO_BASE64(foto) AS foto,
            coalesce(descricao, '' ) as descricao,
          coalesce( DATE_FORMAT(data_cadastro, '%Y-%m-%d'), '0000-00-00') AS data_cadastro,
           coalesce(DATE_FORMAT( data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00' )  AS data_recadastro
         FROM ${dbName}.fotos_produtos 
           WHERE produto = ?`;
        const [result] = await conn.query(sql,  productCode );
        return result as PhotoType[];
    }

    async findByCode(dbName: string, code: number): Promise<PhotoType[]> {
        const sql = ` SELECT *,
            TO_BASE64(foto) AS foto,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.fotos_produtos 
           WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as PhotoType[];
    }
}