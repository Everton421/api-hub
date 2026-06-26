import { conn } from "../../database/databaseConfig.ts";
import { type ClientType } from "./types/client-type.ts";

export class InsertClient {
    async insert(dbName: string, data: ClientType): Promise<{ affectedRows: number; insertId: number }> {
        const columns = [
            'id',
            'celular',
            'nome',
            'cep',
            'endereco',
            'ie',
            'numero',
            'cnpj',
            'cidade',
            'data_cadastro',
            'data_recadastro',
            'vendedor',
            'bairro',
            'estado'
        ];

        const values = [
            data.id,
            data.celular,
            data.nome,
            data.cep,
            data.endereco,
            data.ie,
            data.numero,
            data.cnpj,
            data.cidade,
            data.data_cadastro,
            data.data_recadastro,
            data.vendedor,
            data.bairro,
            data.estado
        ];

        if (data.codigo != null) {
            columns.unshift('codigo');
            values.unshift(data.codigo);
        }

        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${dbName}.clientes (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows, insertId: (result as any).insertId };
    }
}
