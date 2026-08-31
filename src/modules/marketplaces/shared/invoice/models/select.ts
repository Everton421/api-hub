import { conn } from "../../../../../database/databaseConfig.ts";
import { type NfType } from "./types.ts";

export class SelectNf {

    async findByChave(dbName: string, chaveAcesso: string, marketplace: string): Promise<NfType[]> {
        const sql = `SELECT * FROM ${dbName}.nf WHERE chave_acesso = ? AND marketplace = ?`;
        const [result] = await conn.query(sql, [chaveAcesso, marketplace]);
        return result as NfType[];
    }

    async findByCodigo(dbName: string, codigo: number): Promise<NfType[]> {
        const sql = `SELECT * FROM ${dbName}.nf WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as NfType[];
    }

    async findByStatus(dbName: string, status: 'PENDENTE' | 'ENVIADO' | 'ERRO'): Promise<NfType[]> {
        const sql = `SELECT * FROM ${dbName}.nf WHERE status_envio = ? ORDER BY data_cadastro DESC`;
        const [result] = await conn.query(sql, [status]);
        return result as NfType[];
    }

    async findByErro(dbName: string, limit = 100): Promise<NfType[]> {
        const sql = `SELECT * FROM ${dbName}.nf WHERE status_envio = 'ERRO' ORDER BY data_recadastro DESC LIMIT ?`;
        const [result] = await conn.query(sql, [limit]);
        return result as NfType[];
    }
}
