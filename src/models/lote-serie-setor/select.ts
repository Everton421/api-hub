import { conn } from "../../database/databaseConfig.ts";
import { type LoteSerieSetorType } from "./types/lote-serie-setor-type.ts";

export class SelectLoteSerieSetor {
    async findAll(dbName: string): Promise<LoteSerieSetorType[]> {
        const sql = `SELECT * FROM ${dbName}.lote_serie_setor`;
        const [result] = await conn.query(sql);
        return result as LoteSerieSetorType[];
    }

    async findBySector(dbName: string, setor: number): Promise<LoteSerieSetorType[]> {
        const sql = `SELECT * FROM ${dbName}.lote_serie_setor WHERE setor = ?`;
        const [result] = await conn.query(sql, [setor]);
        return result as LoteSerieSetorType[];
    }

    async findByProduct(dbName: string, produto: number): Promise<LoteSerieSetorType[]> {
        const sql = `SELECT * FROM ${dbName}.lote_serie_setor WHERE produto = ?`;
        const [result] = await conn.query(sql, [produto]);
        return result as LoteSerieSetorType[];
    }

    async findByLoteSerie(dbName: string, loteSerie: number): Promise<LoteSerieSetorType[]> {
        const sql = `SELECT * FROM ${dbName}.lote_serie_setor WHERE lote_serie = ?`;
        const [result] = await conn.query(sql, [loteSerie]);
        return result as LoteSerieSetorType[];
    }

    async findBySectorAndLoteSerie(dbName: string, setor: number, loteSerie: number): Promise<LoteSerieSetorType[]> {
        const sql = `SELECT * FROM ${dbName}.lote_serie_setor WHERE setor = ? AND lote_serie = ?`;
        const [result] = await conn.query(sql, [setor, loteSerie]);
        return result as LoteSerieSetorType[];
    }
}
