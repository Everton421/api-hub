import { conn } from "../../database/databaseConfig.ts";
import { type ServiceType } from "./types/service-type.ts";

export class InsertService {
    async insert(dbName: string, data: ServiceType): Promise<{ insertId: number }> {
        const columns = ['id', 'valor', 'aplicacao', 'tipo_serv', 'data_cadastro', 'data_recadastro', 'ativo'];
        const values = [data.id, data.valor, data.aplicacao, data.tipo_serv, data.data_cadastro, data.data_recadastro, data.ativo];

        if (data.codigo != null) {
            columns.unshift('codigo');
            values.unshift(data.codigo);
        }

        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${dbName}.servicos (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}
