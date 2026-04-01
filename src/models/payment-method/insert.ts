import { conn } from "../../database/databaseConfig.ts";
import { type PaymentMethodType } from "./types/payment-method-type.ts";

type PaymentMethodWithoutCode = Omit<PaymentMethodType, 'codigo'>;

export class InsertPaymentMethod {
    async insert(dbName: string, paymentMethod: PaymentMethodWithoutCode): Promise<{ insertId: number }> {
        const sql = `INSERT INTO ${dbName}.forma_pagamento 
            (id, descricao, desc_maximo, parcelas, intervalo, recebimento, data_cadastro, data_recadastro, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            paymentMethod.id,
            paymentMethod.descricao,
            paymentMethod.desc_maximo,
            paymentMethod.parcelas,
            paymentMethod.intervalo,
            paymentMethod.recebimento,
            paymentMethod.data_cadastro,
            paymentMethod.data_recadastro,
            paymentMethod.ativo
        ];

        const [result] = await conn.query(sql, values);
        return { insertId: (result as any).insertId };
    }
}