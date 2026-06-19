import { conn } from "../../database/databaseConfig.ts";
import { type SupplierType } from "./types/supplier-type.ts";

export class UpdateSupplier {
    async update(dbName: string, data: SupplierType): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.fornecedores
            SET id = ?, celular = ?, nome = ?, ativo = ?, cep = ?, endereco = ?, ie = ?, numero = ?,
                cnpj = ?, cidade = ?, data_cadastro = ?, data_recadastro = ?, bairro = ?, estado = ?
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
            data.bairro,
            data.estado,
            data.codigo
        ];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}
