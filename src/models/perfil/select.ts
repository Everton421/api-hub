import { conn } from "../../database/databaseConfig.ts";
import { type PerfilType, type PerfilWithPermissoes, type PermissaoType } from "./types/perfil-type.ts";

export class SelectPerfil {
    async findAll(dbName: string): Promise<PerfilType[]> {
        const sql = `SELECT * FROM ${dbName}.perfis ORDER BY codigo`;
        const [result] = await conn.query(sql);
        return result as PerfilType[];
    }

    async findByCode(dbName: string, codigo: number): Promise<PerfilType[]> {
        const sql = `SELECT * FROM ${dbName}.perfis WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as PerfilType[];
    }

    async findByParams(dbName: string, params: { codigo?: number; id?: string; nome?: string; ativo?: string }): Promise<PerfilType[]> {
        const conditions: string[] = [];
        const values: any[] = [];

        if (params.codigo !== undefined) {
            conditions.push("codigo = ?");
            values.push(params.codigo);
        }
        if (params.id) {
            conditions.push("id = ?");
            values.push(params.id);
        }
        if (params.nome) {
            conditions.push("nome LIKE ?");
            values.push(`%${params.nome}%`);
        }
        if (params.ativo) {
            conditions.push("ativo = ?");
            values.push(params.ativo);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const sql = `SELECT * FROM ${dbName}.perfis ${where} ORDER BY codigo`;
        const [result] = await conn.query(sql, values);
        return result as PerfilType[];
    }

    async findByCodeWithPermissoes(dbName: string, codigo: number): Promise<PerfilWithPermissoes[]> {
        const perfilSql = `SELECT * FROM ${dbName}.perfis WHERE codigo = ?`;
        const [perfis] = await conn.query(perfilSql, [codigo]);

        if (!perfis || (perfis as any[]).length === 0) {
            return [];
        }

        const permissoesSql = `
            SELECT p.* FROM ${dbName}.permissoes p
            INNER JOIN ${dbName}.perfil_permissoes pp ON p.codigo = pp.codigo_permissao
            WHERE pp.codigo_perfil = ?
        `;
        const [permissoes] = await conn.query(permissoesSql, [codigo]);

        return [{
            ...(perfis as PerfilType[])[0],
            permissoes: permissoes as PermissaoType[]
        }];
    }

    async findAllWithPermissoes(dbName: string): Promise<PerfilWithPermissoes[]> {
        const perfisSql = `SELECT * FROM ${dbName}.perfis ORDER BY codigo`;
        const [perfis] = await conn.query(perfisSql);

        const permissoesSql = `
            SELECT pp.codigo_perfil, p.* FROM ${dbName}.permissoes p
            INNER JOIN ${dbName}.perfil_permissoes pp ON p.codigo = pp.codigo_permissao
        `;
        const [permissoesRows] = await conn.query(permissoesSql);

        const permissoesMap = new Map<number, PermissaoType[]>();
        for (const row of permissoesRows as any[]) {
            const perfilCodigo = row.codigo_perfil;
            if (!permissoesMap.has(perfilCodigo)) {
                permissoesMap.set(perfilCodigo, []);
            }
            const { codigo_perfil, ...permissao } = row;
            permissoesMap.get(perfilCodigo)!.push(permissao);
        }

        return (perfis as PerfilType[]).map(perfil => ({
            ...perfil,
            permissoes: permissoesMap.get(perfil.codigo) || []
        }));
    }
}
