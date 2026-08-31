import { conn } from "../../database/databaseConfig.ts";
import { type OrderReceivedType } from "./types/order-type.ts";
import { InsertOrderItems } from "./insert-items.ts";

export class InsertOrder {
    private getCurrentDate(): string {
        const current = new Date();
        const day = String(current.getDate()).padStart(2, '0');
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const year = current.getFullYear();
        return `${year}-${month}-${day}`;
    }

    private convertDate(date: string): string {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    }

    async create(dbName: string, data: OrderReceivedType): Promise<{ insertId: number; status: boolean }> {
        const currentDate = this.getCurrentDate();
        const insertOrderItems = new InsertOrderItems();

        const {
            forma_pagamento = 0,
            descontos = 0,
            observacoes = '',
            quantidade_parcelas = 0,
            total_geral,
            total_produtos,
            total_servicos = 0,
            situacao = 'EA',
            situacao_separacao = 'N',
            tipo ,
            vendedor ,
            data_cadastro = currentDate,
            data_recadastro = currentDate,
            veiculo ,
            tipo_os  ,
            contato  ,
            id  ,
            id_externo = 0,
            id_interno,
            frete ,
            fornecedor,
            operacao,
            setor = 0,
            usuario,
            usuario_separacao,
            inicio_separacao  ,
            fim_separacao  ,
            status_separacao  ,
            observacoes_separacao  ,
            filial,
            marketplace
        } = data;
        const servicos = data.servicos || [];        const parcelas = data.parcelas || [];
        const produtos = data.produtos || [];
        const cliente = data.cliente;

        const sql = `INSERT INTO ${dbName}.pedidos (
            id,
            id_externo,
            id_interno,
            vendedor,
            situacao,
            situacao_separacao,
            contato,
            descontos,
            frete,
            forma_pagamento,
            quantidade_parcelas,
            total_geral,
            total_produtos,
            total_servicos,
            cliente,
            veiculo,
            data_cadastro,
            data_recadastro,
            tipo_os,
            enviado,
            tipo,
            observacoes,
            fornecedor,
            setor,
            usuario,
            usuario_separacao,
            inicio_separacao,
            fim_separacao,
            status_separacao,
            observacoes_separacao,
            operacao,
            filial,
            marketplace
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            id,
            id_externo,
            id_interno || '',
            vendedor,
            situacao,
            situacao_separacao,
            contato,
            descontos,
            frete || 0,
            forma_pagamento,
            quantidade_parcelas,
            total_geral,
            total_produtos,
            total_servicos,
            cliente?.codigo || 0,
            veiculo,
            data_cadastro,
            data_recadastro,
            tipo_os,
            'S',
            tipo,
            observacoes,
            fornecedor?.codigo || 0,
            setor,
            usuario, 
            usuario_separacao, 
             inicio_separacao,
            fim_separacao,
            status_separacao,
            observacoes_separacao,
            operacao,
            filial,
            marketplace ?? ''
        ];

        const [result] = await conn.query(sql, values);
        const insertId = (result as any).insertId;

        let status: boolean | null = null;
        if (servicos.length > 0) {
            try {
                await insertOrderItems.insertServices(servicos, insertId, dbName);
                status = true;
            } catch (e) { console.log(e); }
        }
        if (produtos.length > 0) {
            try {
                await insertOrderItems.insertProducts(produtos, dbName, insertId, Number(total_produtos) ?? 0, Number(frete) ?? 0);
                status = true;
            } catch (e) { console.log(e); }
        }
        if (parcelas.length > 0) {
            try {
                await insertOrderItems.insertInstallments(parcelas, dbName, insertId);
                status = true;
            } catch (e) { console.log(e); }
        }

        return { insertId, status: status ?? false };
    }
}
