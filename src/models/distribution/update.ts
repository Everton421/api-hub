import { conn } from "../../database/databaseConfig";
import { DistributionType } from "./types/distribution-type";

type DistributionUpdate = Partial<DistributionType> & { produto: number; setor: number; local: number };

export class UpdateDistribution {
    async update(dbName: string, distribution: DistributionUpdate): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (distribution.quantidade !== undefined) {
            fields.push("quantidade = ?");
            values.push(distribution.quantidade);
        }
        if (distribution.unidade_medida !== undefined) {
            fields.push("unidade_medida = ?");
            values.push(distribution.unidade_medida);
        }
        if (distribution.data_cadastro !== undefined) {
            fields.push("data_cadastro = ?");
            values.push(distribution.data_cadastro);
        }
        if (distribution.data_recadastro !== undefined) {
            fields.push("data_recadastro = ?");
            values.push(distribution.data_recadastro);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        values.push(distribution.produto);
        values.push(distribution.setor);
        values.push(distribution.local);

        const sql = `UPDATE ${dbName}.distribuicao_locais_setor 
                     SET ${fields.join(', ')} 
                     WHERE produto = ? AND setor = ? AND local = ?`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}