import { conn } from "../../database/databaseConfig.ts";
import { type OrderReceivedType } from "./types/order-type.ts";
import { DeleteOrderItems } from "./delete.ts";
import { InsertOrderItems } from "./insert-items.ts";
import { SelectOrderItems } from "./select-items.ts";
import { SelectOrder } from "./select.ts";
import { DateService } from "../../utils/dateService.ts";

export class UpdateOrder {
    async updateOrderTable(dbName: string, data: OrderReceivedType, orderCode: number): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.pedidos SET 
            cliente = ?,
            fornecedor = ?,
            total_geral = ?,
            total_produtos = ?,
            total_servicos = ?,
            tipo_os = ?,
            tipo = ?,
            quantidade_parcelas = ?,
            contato = ?,
            veiculo = ?,
            frete = ?,
            forma_pagamento = ?,
            observacoes = ?,
            data_cadastro = ?,
            data_recadastro = ?,
            enviado = 'S',
            situacao = ?,
            situacao_separacao = ?,
            id_interno = ?,
            id_externo = ?,
            setor = ?,
            usuario = ?,
            usuario_separacao = ?,
            inicio_separacao = ?,
            fim_separacao = ?,
            status_separacao = ?,
            observacoes_separacao = ?,
            operacao = ?,    
            filial = ?
        WHERE codigo = ?`;
        
        const cliente = data.cliente && data.cliente.codigo ?  data.cliente.codigo : 0;
        const fornecedor = data.fornecedor && data.fornecedor.codigo ? data.fornecedor.codigo : 0;


        const values = [
            cliente,
            fornecedor,
            data.total_geral,
            data.total_produtos,
            data.total_servicos,
            data.tipo_os ?? 0,
            data.tipo ?? 1,
            data.quantidade_parcelas ?? 0,
            data.contato ?? '',
            data.veiculo ?? 0,
            data.frete ?? 0,
            data.forma_pagamento ?? 0,
            data.observacoes ?? '',
            data.data_cadastro,
            data.data_recadastro,
            data.situacao ?? 'EA',
            data.situacao_separacao ?? 'N',
            data.id_interno ?? '',
            data.id_externo ?? 0,
            data.setor ?? 0,
            data.usuario ?? 0,
            data.usuario_separacao ?? 0,
            data.inicio_separacao,
            data.fim_separacao,
            data.status_separacao ?? 'NAO INICIADA',
            data.observacoes_separacao ?? null,
            data.operacao,
            data.filial,
            orderCode
        ];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
    }

    async updateMainData(dbName: string, orderCode: number, data: Partial<OrderReceivedType>): Promise<number> {
        const dateService = new DateService();
        const columns: string[] = [];
        const values: unknown[] = [];

        const fields: Array<[string, (value: any) => any]> = [
            ['cliente', (value) => (typeof value === 'object' && value !== null ? value.codigo : value)],
            ['fornecedor', (value) => (typeof value === 'object' && value !== null ? value.codigo : value)],
            ['vendedor', (value) => value],
            ['situacao', (value) => value],
            ['situacao_separacao', (value) => value],
            ['contato', (value) => value],
            ['descontos', (value) => value],
            ['frete', (value) => value],
            ['forma_pagamento', (value) => value],
            ['quantidade_parcelas', (value) => value],
            ['total_geral', (value) => value],
            ['total_produtos', (value) => value],
            ['total_servicos', (value) => value],
            ['veiculo', (value) => value],
            ['data_cadastro', (value) => value],
            ['tipo_os', (value) => value],
            ['tipo', (value) => value],
            ['observacoes', (value) => value],
            ['operacao', (value) => value],
            ['setor', (value) => value],
            ['usuario', (value) => value],
            ['usuario_separacao', (value) => value],
            ['inicio_separacao', (value) => value],
            ['fim_separacao', (value) => value],
            ['status_separacao', (value) => value],
            ['observacoes_separacao', (value) => value],
            ['filial', (value) => value],
            ['id_interno', (value) => value],
            ['id_externo', (value) => value]
        ];

        for (const [column, normalize] of fields) {
            const value = (data as Record<string, unknown>)[column];
            if (value !== undefined) {
                columns.push(`${column} = ?`);
                values.push(normalize(value));
            }
        }

        columns.push('enviado = ?');
        values.push('S');

        const dataRecadastro = (data as Record<string, unknown>).data_recadastro as string | undefined;
        columns.push('data_recadastro = ?');
        values.push(dataRecadastro ?? dateService.obterDataHoraAtual());

        values.push(orderCode);

        const sql = `UPDATE ${dbName}.pedidos SET ${columns.join(', ')} WHERE codigo = ?`;
        const [result] = await conn.query(sql, values);
        return (result as any).affectedRows;
    }

    async updateByExternalId(dbName: string, data: OrderReceivedType, externalId: string, operation: 'V' | 'C'): Promise<number> {
        const selectOrder = new SelectOrder();
        const existing = await selectOrder.findByExternalId(dbName, externalId, operation);
        if (existing.length === 0) {
            throw new Error(`Pedido com id ${externalId} e operação ${operation} não encontrado`);
        }
        const orderCode = existing[0].codigo;
        return this.update(dbName, data, orderCode);
    }

    async update(dbName: string, data: OrderReceivedType, orderCode: number): Promise<number> {
        const deleteOrderItems = new DeleteOrderItems();
        const selectOrderItems = new SelectOrderItems();
        const insertOrderItems = new InsertOrderItems();

        const servicos = data.servicos || [];
        const parcelas = data.parcelas || [];
        const produtos = data.produtos || [];

        await this.updateOrderTable(dbName, data, orderCode);

        const serviceCount = await selectOrderItems.countServicesByOrder(dbName, orderCode);
        if (serviceCount > 0) {
            await deleteOrderItems.deleteServices(dbName, orderCode);
        }
        if (servicos.length > 0) {
            await insertOrderItems.insertServices(servicos, orderCode, dbName);
        }

        const productCount = await selectOrderItems.countProductsByOrder(dbName, orderCode);
        if (productCount > 0) {
            await deleteOrderItems.deleteProducts(dbName, orderCode);            
            await deleteOrderItems.deleteSeriesOrder(dbName, orderCode);
        }


        if (produtos.length > 0) {
            await insertOrderItems.insertProducts(produtos, dbName, orderCode, Number(data.total_produtos) ?? 0, Number(data.frete) ?? 0);
        }

        const installmentCount = await selectOrderItems.countInstallmentsByOrder(dbName, orderCode);
        if (installmentCount > 0) {
            await deleteOrderItems.deleteInstallments(dbName, orderCode);
        }
        if (parcelas.length > 0) {
            await insertOrderItems.insertInstallments(parcelas, dbName, orderCode);
        }

        return orderCode;
    }
}
