import { conn } from "../../database/databaseConfig.ts";
import { type PaymentMethodType } from "./types/payment-method-type.ts";

type PaymentMethodQuery = {
    codigo: number;
    id: string;
    limit: number;
    descricao: string;
    parcelas: number;
    ativo: string;
};

export class SelectPaymentMethod {
    async findAll(dbName: string, dataRecadastro?: string): Promise<PaymentMethodType[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        FROM ${dbName}.forma_pagamento `;

        const params: any[] = [];

        if (dataRecadastro) {
            sql += ' WHERE data_recadastro > ?';
            params.push(dataRecadastro);
        }

        const [result] = await conn.query(sql, params);
        return result as PaymentMethodType[];
    }

    async findByCode(dbName: string, code: number): Promise<PaymentMethodType[]> {
        const sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.forma_pagamento 
           WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as PaymentMethodType[];
    }

    async findByParams(dbName: string, params: Partial<PaymentMethodQuery>): Promise<PaymentMethodType[]> {
        const {
            codigo,
            id,
            descricao,
            limit = 20,
            parcelas,
            ativo
        } = params;

        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${dbName}.forma_pagamento `;

        const conditions: string[] = [];
        const values: any[] = [];

        if (codigo) {
            conditions.push("codigo = ?");
            values.push(codigo);
        }
        if (id) {
            conditions.push("id = ?");
            values.push(Number(id));
        }
        if (parcelas) {
            conditions.push("parcelas = ?");
            values.push(Number(parcelas));
        }
        if (ativo) {
            conditions.push("ativo = ?");
            values.push(ativo);
        }
        if (descricao) {
            conditions.push("descricao LIKE ?");
            values.push(`%${descricao}%`);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' LIMIT ?';
        values.push(Number(limit));

        const [result] = await conn.query(sql, values);
        return result as PaymentMethodType[];
    }
}