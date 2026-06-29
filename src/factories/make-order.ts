import { randomUUID } from "node:crypto";
import { conn } from "../database/databaseConfig.ts";
import { SelectProduct } from "../models/product/select.ts";
import { SelectClient } from "../models/client/select.ts";
import { DateService } from "../utils/dateService.ts";
import { faker } from "@faker-js/faker";
import { InsertOrderItems } from "../models/order/insert-items.ts";

type OrderStatus = "EA" | "FI" | "RE" | "FP";

interface OrderResult {
    success: boolean;
    message: string;
    orders: { codigo: number; situacao: string }[];
}

export class MakeOrder {
    private dateService = new DateService();
    private selectProduct = new SelectProduct();
    private selectClient = new SelectClient();
    private insertOrderItems = new InsertOrderItems();

    private async getProducts(dbName: string, limit: number = 5) {
        const products = await this.selectProduct.findByParams(dbName, { ativo: "S", limit });
        return products;
    }

    private async getClients(dbName: string, limit: number = 5) {
        const clients = await this.selectClient.findByParams(dbName, { ativo: "S", limit });
        return clients;
    }

    private async insertOrder(
        dbName: string,
        clientCode: number,
        products: { codigo: number; preco: string; descricao: string }[],
        status: OrderStatus
    ): Promise<number> {
        const data_cadastro = this.dateService.obterDataAtual();
        const data_recadastro = this.dateService.obterDataHoraAtual();
        const id = randomUUID();

        let totalProdutos = 0;
        const orderProducts = products.map((p) => {
            const preco = parseFloat(p.preco);
            const quantidade = faker.number.int({ min: 1, max: 5 });
            const desconto = faker.number.float({ min: 0, max: 10, fractionDigits: 2 });
            const total = quantidade * preco * (1 - desconto / 100);
            totalProdutos += total;
            return {
                codigo: p.codigo,
                preco,
                quantidade,
                desconto,
                total: parseFloat(total.toFixed(2)),
                descricao: p.descricao,
                sequencia: 1,
                quantidade_separada: 0,
                quantidade_faturada: 0
            };
        });

        const sql = `INSERT INTO ${dbName}.pedidos (
            id, id_externo, id_interno, vendedor, situacao, situacao_separacao,
            contato, descontos, frete, forma_pagamento, quantidade_parcelas,
            total_geral, total_produtos, total_servicos, cliente,
            veiculo, data_cadastro, data_recadastro, tipo_os, enviado, tipo, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            id,
            0,
            "",
            1,
            status,
            "N",
            faker.person.fullName(),
            "0",
            0,
            1,
            faker.number.int({ min: 1, max: 6 }),
            totalProdutos.toFixed(2),
            totalProdutos.toFixed(2),
            "0",
            clientCode,
            0,
            data_cadastro,
            data_recadastro,
            0,
            "S",
            1,
            ""
        ];

        const [result] = await conn.query(sql, values);
        const orderCode = (result as any).insertId as number;

        if (orderProducts.length > 0) {
            await this.insertOrderItems.insertProducts(orderProducts, dbName, orderCode, totalProdutos, 0);
        }

        await this.insertInstallments(dbName, orderCode, totalProdutos);

        return orderCode;
    }

    private async insertInstallments(dbName: string, orderCode: number, total: number): Promise<void> {
        const numParcelas = faker.number.int({ min: 1, max: 6 });
        const valorParcela = total / numParcelas;

        for (let i = 1; i <= numParcelas; i++) {
            const vencimento = new Date();
            vencimento.setDate(vencimento.getDate() + (i * 30));
            const vencimentoFormat = vencimento.toISOString().split("T")[0];

            const sql = `INSERT INTO ${dbName}.parcelas (pedido, parcela, valor, vencimento)
                         VALUES (?, ?, ?, ?)`;
            await conn.query(sql, [orderCode, i, valorParcela.toFixed(2), vencimentoFormat]);
        }
    }

    async createWithAllStatuses(empresa: string): Promise<OrderResult> {
        const products = await this.getProducts(empresa, 10);
        const clients = await this.getClients(empresa, 10);

        if (products.length === 0) {
            return { success: false, message: "Nenhum produto encontrado. Crie produtos primeiro.", orders: [] };
        }
        if (clients.length === 0) {
            return { success: false, message: "Nenhum cliente encontrado. Crie clientes primeiro.", orders: [] };
        }

        const statuses: OrderStatus[] = ["EA", "FI", "RE", "FP"];
        const results: { codigo: number; situacao: string }[] = [];

        for (let i = 0; i < statuses.length; i++) {
            const randomProducts = faker.helpers.arrayElements(products, { min: 1, max: Math.min(3, products.length) });
            const randomClient = faker.helpers.arrayElement(clients);

            const orderCode = await this.insertOrder(empresa, randomClient.codigo!, randomProducts, statuses[i]);
            results.push({ codigo: orderCode, situacao: statuses[i] });
        }

        return {
            success: true,
            message: `4 pedidos criados com statuses: EA (Em Aberto), FI (Faturado), RE (Rejeitado), FP (Faturado)`,
            orders: results
        };
    }

    async create(empresa: string, status: OrderStatus): Promise<{ success: boolean; message: string; codigo?: number }> {
        const products = await this.getProducts(empresa, 10);
        const clients = await this.getClients(empresa, 10);

        if (products.length === 0) {
            return { success: false, message: "Nenhum produto encontrado." };
        }
        if (clients.length === 0) {
            return { success: false, message: "Nenhum cliente encontrado." };
        }

        const randomProducts = faker.helpers.arrayElements(products, { min: 1, max: Math.min(3, products.length) });
        const randomClient = faker.helpers.arrayElement(clients);

        const orderCode = await this.insertOrder(empresa, randomClient.codigo!, randomProducts, status);

        return { success: true, message: `Pedido ${orderCode} criado com status ${status}.`, codigo: orderCode };
    }
}
