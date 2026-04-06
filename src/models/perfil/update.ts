import { conn } from "../../database/databaseConfig.ts";
import { type UpdatePerfil } from "./types/perfil-type.ts";

export class UpdatePerfil {
    async update(dbName: string, perfil: UpdatePerfil): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.perfis SET id = ?, nome = ?, data_recadastro = ?, ativo = ? WHERE codigo = ?`;
        const values = [perfil.id, perfil.nome, perfil.data_recadastro, perfil.ativo, perfil.codigo];
        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }

    async deletePermissoes(dbName: string, codigoPerfil: number): Promise<void> {
        const sql = `DELETE FROM ${dbName}.perfil_permissoes WHERE codigo_perfil = ?`;
        await conn.query(sql, [codigoPerfil]);
    }

    async delete(dbName: string, codigo: number): Promise<{ affectedRows: number }> {
        await this.deletePermissoes(dbName, codigo);
        const sql = `DELETE FROM ${dbName}.perfis WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return { affectedRows: (result as any).affectedRows };
    }
}
