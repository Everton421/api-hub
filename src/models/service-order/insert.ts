import { conn } from "../../database/databaseConfig.ts";
import { type ServiceOrderType } from "./types/service-order-type.ts";

export class InsertServiceOrderType {
    async insert(dbName: string, data: ServiceOrderType): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.tipos_os (id, data_cadastro, data_recadastro, descricao, ativo)
                      VALUES (?, ?, ?, ?, ?)`;

        const values = [data.id, data.data_cadastro, data.data_recadastro, data.descricao, data.ativo];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
