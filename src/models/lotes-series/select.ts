import { conn } from "../../database/databaseConfig.ts";
import { type LotesSeriesType } from "./types/lotes-series-type.ts";

export class SelectLotesSeries {
    async findAll(dbName: string): Promise<LotesSeriesType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.lotes_series`;
        const [result] = await conn.query(sql);
        return result as LotesSeriesType[];
    }

    async findByCode(dbName: string, codigo: number): Promise<LotesSeriesType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.lotes_series WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as LotesSeriesType[];
    }

    async findByProduct(dbName: string, produto: number): Promise<LotesSeriesType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.lotes_series WHERE produto = ?`;
        const [result] = await conn.query(sql, [produto]);
        return result as LotesSeriesType[];
    }

    async findBySerie(dbName: string, serie: string): Promise<LotesSeriesType[]> {
        const sql = `SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.lotes_series WHERE serie = ?`;
        const [result] = await conn.query(sql, [serie]);
        return result as LotesSeriesType[];
    }
}
