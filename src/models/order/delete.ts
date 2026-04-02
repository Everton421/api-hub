import { conn } from "../../database/databaseConfig.ts";

export class DeleteOrderItems {
    async deleteProducts(dbName: string, orderCode: number): Promise<{ affectedRows: number }> {
        const sql = `DELETE FROM ${dbName}.produtos_pedido WHERE pedido = ?`;
        const [result] = await conn.query(sql, [orderCode]);
        return { affectedRows: (result as any).affectedRows };
    }

    async deleteServices(dbName: string, orderCode: number): Promise<{ affectedRows: number }> {
        const sql = `DELETE FROM ${dbName}.servicos_pedido WHERE pedido = ?`;
        const [result] = await conn.query(sql, [orderCode]);
        return { affectedRows: (result as any).affectedRows };
    }

    async deleteInstallments(dbName: string, orderCode: number): Promise<{ affectedRows: number }> {
        const sql = `DELETE FROM ${dbName}.parcelas WHERE pedido = ?`;
        const [result] = await conn.query(sql, [orderCode]);
        return { affectedRows: (result as any).affectedRows };
    }

    async deleteAll(dbName: string, orderCode: number): Promise<void> {
        await this.deleteProducts(dbName, orderCode);
        await this.deleteServices(dbName, orderCode);
        await this.deleteInstallments(dbName, orderCode);
    }
}
