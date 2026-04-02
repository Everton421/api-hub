import { conn } from "../../database/databaseConfig.ts";
import { type OrderReceivedType } from "./types/order-type.ts";
import { DeleteOrderItems } from "./delete.ts";
import { InsertOrderItems } from "./insert-items.ts";
import { SelectOrderItems } from "./select-items.ts";

export class UpdateOrder {
    async updateOrderTable(dbName: string, data: OrderReceivedType, orderCode: number): Promise<{ affectedRows: number }> {
        const sql = `UPDATE ${dbName}.pedidos SET 
            cliente = ?,
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
            id_externo = ?
        WHERE codigo = ?`;

        const values = [
            data.cliente?.codigo,
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
            orderCode
        ];

        const [result] = await conn.query(sql, values);
        return { affectedRows: (result as any).affectedRows };
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
        }
        if (produtos.length > 0) {
            await insertOrderItems.insertProducts(produtos, dbName, orderCode, data.total_produtos ?? 0, data.frete ?? 0);
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
