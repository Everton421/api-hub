import { conn } from "../../database/databaseConfig.ts";
import { type ClientType } from "./types/client-type.ts";

export class InsertClient {
    async insert(dbName: string, data: ClientType): Promise<{ affectedRows: number; insertId: number }> {
        const sql = `INSERT INTO ${dbName}.clientes
            (id, celular, nome, cep, endereco, ie, numero, cnpj, cidade, data_cadastro, data_recadastro, vendedor, bairro, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows, insertId: (result as any).insertId };
    }
}
