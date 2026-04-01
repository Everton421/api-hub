import { conn } from "../../database/databaseConfig.ts";
import { type PaymentMethodType } from "./types/payment-method-type.ts";

type PaymentMethodUpdate = Partial<Omit<PaymentMethodType, 'codigo'>> & { codigo: number };

export class UpdatePaymentMethod {
    async update(dbName: string, paymentMethod: PaymentMethodUpdate): Promise<{ affectedRows: number }> {
        const fields: string[] = [];
        const values: any[] = [];

        if (paymentMethod.id !== undefined) {
            fields.push("id = ?");
            values.push(paymentMethod.id);
        }
        if (paymentMethod.descricao !== undefined) {
            fields.push("descricao = ?");
            values.push(paymentMethod.descricao);
        }
        if (paymentMethod.desc_maximo !== undefined) {
            fields.push("desc_maximo = ?");
            values.push(paymentMethod.desc_maximo);
        }
        if (paymentMethod.parcelas !== undefined) {
            fields.push("parcelas = ?");
            values.push(paymentMethod.parcelas);
        }
        if (paymentMethod.intervalo !== undefined) {
            fields.push("intervalo = ?");
            values.push(paymentMethod.intervalo);
        }
        if (paymentMethod.recebimento !== undefined) {
            fields.push("recebimento = ?");
            values.push(paymentMethod.recebimento);
        }
        if (paymentMethod.data_cadastro !== undefined) {
            fields.push("data_cadastro = ?");
            values.push(paymentMethod.data_cadastro);
        }
        if (paymentMethod.data_recadastro !== undefined) {
            fields.push("data_recadastro = ?");
            values.push(paymentMethod.data_recadastro);
        }
        if (paymentMethod.ativo !== undefined) {
            fields.push("ativo = ?");
            values.push(paymentMethod.ativo);
        }

        if (fields.length === 0) {
            throw new Error("No fields provided for update.");
        }

        values.push(paymentMethod.codigo);

        const sql = `UPDATE ${dbName}.forma_pagamento SET ${fields.join(', ')} WHERE codigo = ?`;

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }
}