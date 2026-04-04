import { conn } from "../../database/databaseConfig.ts";

export class DeletePhoto {
    async delete(dbName: string, productCode: number): Promise<{ serverStatus: number }> {
        const sql = `DELETE FROM ${dbName}.fotos_produtos WHERE produto = ?`;
        const [result] = await conn.query(sql, [productCode]);
        return { serverStatus: (result as any).serverStatus };
    }
}
