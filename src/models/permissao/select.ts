import { conn } from "../../database/databaseConfig.ts";
import { type PermissaoType } from "../perfil/types/perfil-type.ts";

export class SelectPermissao {
    async findAll(dbName: string): Promise<PermissaoType[]> {
        const sql = `SELECT * FROM ${dbName}.permissoes ORDER BY descricao`;
        const [result] = await conn.query(sql);
        return result as PermissaoType[];
    }

    async findByCode(dbName: string, codigo: number): Promise<PermissaoType[]> {
        const sql = `SELECT * FROM ${dbName}.permissoes WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as PermissaoType[];
    }

    async findByParams(dbName: string, params: { codigo?: number; id?: string; descricao?: string; ativo?: string }): Promise<PermissaoType[]> {
        const conditions: string[] = [];
        const values: any[] = [];

        if (params.codigo !== undefined) {
            conditions.push("codigo = ?");
            values.push(params.codigo);
        }
        if (params.id) {
            conditions.push("id LIKE ?");
            values.push(`%${params.id}%`);
        }
        if (params.descricao) {
            conditions.push("descricao LIKE ?");
            values.push(`%${params.descricao}%`);
        }
        if (params.ativo) {
            conditions.push("ativo = ?");
            values.push(params.ativo);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM ${dbName}.permissoes ${where} ORDER BY descricao`;
        const [result] = await conn.query(sql, values);
        return result as PermissaoType[];
    }

    async findByPerfil(dbName: string, codigoPerfil: number): Promise<PermissaoType[]> {
        const sql = `
            SELECT p.* FROM ${dbName}.permissoes p
            INNER JOIN ${dbName}.perfil_permissoes pp ON p.codigo = pp.codigo_permissao
            WHERE pp.codigo_perfil = ?
            ORDER BY p.descricao
        `;
        const [result] = await conn.query(sql, [codigoPerfil]);
        return result as PermissaoType[];
    }

    async exists(dbName: string, codigo: number): Promise<boolean> {
        const sql = `SELECT COUNT(*) as count FROM ${dbName}.permissoes WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return (result as any)[0].count > 0;
    }
}
