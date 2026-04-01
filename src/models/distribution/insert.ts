import { conn } from "../../database/databaseConfig";
import { DistributionType } from "./types/distribution-type";

export class InsertDistribution {
    async insert(dbName: string, distribution: DistributionType): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.distribuicao_locais_setor 
            (produto, setor, local, unidade_medida, quantidade, data_cadastro, data_recadastro)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            distribution.produto,
            distribution.setor,
            distribution.local,
            distribution.unidade_medida,
            distribution.quantidade,
            distribution.data_cadastro,
            distribution.data_recadastro
        ];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}