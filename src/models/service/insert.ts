import { conn } from "../../database/databaseConfig.ts";
import { type ServiceType } from "./types/service-type.ts";

export class InsertService {
    async insert(dbName: string, data: ServiceType): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.servicos (id, valor, aplicacao, tipo_serv, data_cadastro, data_recadastro, ativo)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const values = [data.id, data.valor, data.aplicacao, data.tipo_serv, data.data_cadastro, data.data_recadastro, data.ativo];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
