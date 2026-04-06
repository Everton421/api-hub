import { conn } from "../../database/databaseConfig.ts";
import { type typeAnuncios } from "../../types/anuncios/type-anuncio.ts";
import { type ResultSetHeader } from "mysql2/promise";

type NewAnuncio = Omit<typeAnuncios, 'id' | 'data_cadastro' | 'data_recadastro'>;

type ResponseInsert = { sucess: boolean; message: string; insertId?: number };

export class InsertAnuncios {

    async insert(empresa: string, anuncio: NewAnuncio): Promise<ResponseInsert> {
        const sql = `
            INSERT INTO ${empresa}.anuncios
                SET 
                    codigo_produto = ?,
                    integration_id = ?,
                    plataforma = ?,
                    estoque = ?,
                    preco = ?,
                    unidade_medida = ?,
                    descricao = ?,
                    titulo = ?,
                    num_fabricante = ?,
                    ativo = ?,
                    sku_externo = ?,
                    id_externo = ?,
                    link = ?,
                    thumbnail = ?
        `;

        const values = [
            anuncio.codigo_produto,
            anuncio.integration_id,
            anuncio.plataforma,
            anuncio.estoque,
            anuncio.preco,
            anuncio.unidade_medida,
            anuncio.descricao,
            anuncio.titulo,
            anuncio.num_fabricante,
            anuncio.ativo,
            anuncio.sku_externo,
            anuncio.id_externo,
            anuncio.link,
            anuncio.thumbnail
        ];

        try {
            const [result] = await conn.query<ResultSetHeader>(sql, values);
            return { sucess: true, message: "Anúncio registrado com sucesso!", insertId: result.insertId };
        } catch (err) {
            return { sucess: false, message: `Erro ao registrar anúncio: ${err}` };
        }
    }
}