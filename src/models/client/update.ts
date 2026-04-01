import { conn } from "../../database/databaseConfig.ts";
import { type ClientType } from "./types/client-type.ts";

export class UpdateClient {
    async update(dbName: string, data: ClientType): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.clientes
            SET id = ?, celular = ?, nome = ?, ativo = ?, cep = ?, endereco = ?, ie = ?, numero = ?,
                cnpj = ?, cidade = ?, data_cadastro = ?, data_recadastro = ?, vendedor = ?, bairro = ?, estado = ?
            WHERE codigo = ?`;

        const values = [
            data.id,
            data.celular,
            data.nome,
            data.ativo,
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
            data.estado,
            data.codigo
        ];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}
