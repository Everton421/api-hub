import { conn } from "../../database/databaseConfig.ts";
import { type ServiceType } from "./types/service-type.ts";

export class UpdateService {
    async update(dbName: string, data: ServiceType): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.servicos
                     SET id = ?, valor = ?, aplicacao = ?, tipo_serv = ?, data_cadastro = ?, data_recadastro = ?, ativo = ?
                     WHERE codigo = ?`;

        const values = [data.id, data.valor, data.aplicacao, data.tipo_serv, data.data_cadastro, data.data_recadastro, data.ativo, data.codigo];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}
