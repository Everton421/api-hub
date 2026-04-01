import { conn } from "../../database/databaseConfig.ts";
import { type ServiceOrderType } from "./types/service-order-type.ts";

export class UpdateServiceOrderType {
    async update(dbName: string, data: ServiceOrderType): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.tipos_os
                     SET id = ?, data_cadastro = ?, data_recadastro = ?, descricao = ?, ativo = ?
                     WHERE codigo = ?`;

        const values = [data.id, data.data_cadastro, data.data_recadastro, data.descricao, data.ativo, data.codigo];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}
