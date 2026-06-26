import { conn } from "../../database/databaseConfig.ts";
import { type SupplierType } from "./types/supplier-type.ts";

export class InsertSupplier {
    async insert(dbName: string, data: SupplierType): Promise<{ affectedRows: number; insertId: number }> {
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
            data.bairro,
            data.estado
        ];

        if (data.codigo != null) {
            columns.unshift('codigo');
            values.unshift(data.codigo);
        }

        const placeholders = values.map(() => '?').join(', ');
        const sql = `INSERT INTO ${dbName}.fornecedores (${columns.join(', ')}) VALUES (${placeholders})`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows, insertId: (result as any).insertId };
    }
}
