import { conn } from "../../database/databaseConfig.ts";

export type OrderItemProduct = {
    pedido: number;
    codigo: number;
    desconto: number;
    quantidade: number;
    preco: number;
    frete: number;
    total: number;
    quantidade_separada: number;
    quantidade_faturada: number;
    descricao?: string;
    id?: string;
};

export type OrderItemService = {
    pedido: number;
    codigo: number;
    desconto: number;
    quantidade: number;
    valor: number;
    total: number;
    aplicacao?: string;
    id?: string;
};

export type OrderInstallment = {
    pedido: number;
    parcela: number;
    valor: number;
    vencimento: string;
};

export class SelectOrderItems {
    async findProductsByOrder(dbName: string, orderCode: number): Promise<OrderItemProduct[]> {
        const sql = `SELECT pp.*, p.descricao, p.id
        FROM ${dbName}.produtos_pedido pp 
        JOIN ${dbName}.produtos p ON pp.codigo = p.codigo
        WHERE pp.pedido = ?`;

        const [result] = await conn.query(sql, [orderCode]);
        return result as OrderItemProduct[];
    }

    async findServicesByOrder(dbName: string, orderCode: number): Promise<OrderItemService[]> {
        const sql = `SELECT sp.*, s.aplicacao, s.id
        FROM ${dbName}.servicos_pedido sp 
        JOIN ${dbName}.servicos s ON s.codigo = sp.codigo
        WHERE sp.pedido = ?`;

        const [result] = await conn.query(sql, [orderCode]);
        return result as OrderItemService[];
    }

    async findInstallmentsByOrder(dbName: string, orderCode: number): Promise<OrderInstallment[]> {
        const sql = `SELECT *, DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento
        FROM ${dbName}.parcelas
        WHERE pedido = ?`;

        const [result] = await conn.query(sql, [orderCode]);
        return result as OrderInstallment[];
    }

    async countProductsByOrder(dbName: string, orderCode: number): Promise<number> {
        const sql = `SELECT COUNT(*) as count
        FROM ${dbName}.produtos_pedido
        WHERE pedido = ?`;

        const [result] = await conn.query(sql, [orderCode]);
        return (result as any)[0].count;
    }

    async countServicesByOrder(dbName: string, orderCode: number): Promise<number> {
        const sql = `SELECT COUNT(*) as count
        FROM ${dbName}.servicos_pedido
        WHERE pedido = ?`;

        const [result] = await conn.query(sql, [orderCode]);
        return (result as any)[0].count;
    }

    async countInstallmentsByOrder(dbName: string, orderCode: number): Promise<number> {
        const sql = `SELECT COUNT(*) as count
        FROM ${dbName}.parcelas
        WHERE pedido = ?`;

        const [result] = await conn.query(sql, [orderCode]);
        return (result as any)[0].count;
    }
}
