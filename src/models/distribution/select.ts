import { conn } from "../../database/databaseConfig.ts";
import { DistributionType } from "./types/distribution-type.ts";

export class SelectDistribution {
    async findAll(dbName: string, dataRecadastro?: string): Promise<DistributionType[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.distribuicao_locais_setor `;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ?';
            params.push(dataRecadastro);
        }

        const [result] = await conn.query(sql, params);
        return result as DistributionType[];
    }

    async findByParams(dbName: string, params: Partial<DistributionType>): Promise<DistributionType[]> {
        const {
            produto,
            setor,
            local,
            unidade_medida,
            quantidade,
            data_cadastro,
            data_recadastro
        } = params;

        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.distribuicao_locais_setor `;

        const conditions: string[] = [];
        const values: any[] = [];

        if (produto !== undefined) {
            conditions.push("produto = ?");
            values.push(produto);
        }
        if (setor !== undefined) {
            conditions.push("setor = ?");
            values.push(setor);
        }
        if (local !== undefined) {
            conditions.push("local = ?");
            values.push(local);
        }
        if (unidade_medida) {
            conditions.push("unidade_medida = ?");
            values.push(unidade_medida);
        }
        if (quantidade) {
            conditions.push("quantidade = ?");
            values.push(quantidade);
        }
        if (data_cadastro) {
            conditions.push("data_cadastro = ?");
            values.push(data_cadastro);
        }
        if (data_recadastro) {
            conditions.push("data_recadastro > ?");
            values.push(data_recadastro);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        const [result] = await conn.query(sql, values);
        return result as DistributionType[];
    }

    async findByProductAndSector(dbName: string, productCode: number, sectorCode: number): Promise<DistributionType[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.distribuicao_locais_setor 
           WHERE produto = ? AND setor = ?`;

        const [result] = await conn.query(sql, [productCode, sectorCode]);
        return result as DistributionType[];
    }
}