import { conn } from "../../database/databaseConfig.ts";
import { type NewPerfil } from "./types/perfil-type.ts";

export class InsertPerfil {
    async insert(dbName: string, perfil: NewPerfil): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.perfis (id, nome, data_cadastro, data_recadastro, ativo) VALUES (?, ?, ?, ?, ?)`;
        const values = [perfil.id, perfil.nome, perfil.data_cadastro, perfil.data_recadastro, perfil.ativo];
        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }

    async insertPermissoes(dbName: string, codigoPerfil: number, codigosPermissoes: number[]): Promise<void> {
        if (codigosPermissoes.length === 0) return;

        const sql = `INSERT INTO ${dbName}.perfil_permissoes (codigo_perfil, codigo_permissao) VALUES ?`;
        const values = codigosPermissoes.map(codigoPermissao => [codigoPerfil, codigoPermissao]);
        await conn.query(sql, [values]);
    }
}
