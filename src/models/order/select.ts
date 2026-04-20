import { conn } from "../../database/databaseConfig.ts";
import { type OrderType } from "./types/order-type.ts";

export class SelectOrder {
    async findByCode(dbName: string, code: number): Promise<OrderType[]> {
        const sql = `SELECT p.*, c.id as cliente_id, c.nome as cliente_nome,
            DATE_FORMAT(p.data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(p.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(p.observacoes USING utf8) AS observacoes
        FROM ${dbName}.pedidos p 
        JOIN ${dbName}.clientes c ON c.codigo = p.cliente 
        
        WHERE p.codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return result as OrderType[];
    }

    async exists(dbName: string, code: number): Promise<boolean> {
        const sql = `SELECT COUNT(*) as count
        FROM ${dbName}.pedidos
        WHERE codigo = ?`;

        const [result] = await conn.query(sql, [code]);
        return (result as any)[0].count > 0;
    }

    async findByDate(dbName: string, queryDate?: string, seller?: number): Promise<OrderType[]> {
        const sql = `SELECT co.*, c.id as cliente_id,  c.nome as cliente_nome,
            DATE_FORMAT(co.data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(co.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(co.observacoes USING utf8) AS observacoes
        FROM ${dbName}.pedidos AS co
        JOIN ${dbName}.clientes c ON c.codigo = co.cliente`;

        const conditions: string[] = [];
        const values: any[] = [];

        if (queryDate) {
            conditions.push("co.data_recadastro >= ?");
            values.push(queryDate);
        }
        if (seller) {
            conditions.push("co.vendedor = ?");
            values.push(seller);
        }

        let finalSql = sql;
        if (conditions.length > 0) {
            finalSql += ' WHERE ' + conditions.join(' AND ');
        }

        const [result] = await conn.query(finalSql, values);
        return result as OrderType[];
    }

    async findByDateRange(
        dbName: string,
        startDate: string,
        endDate: string,
        filter: string | null,
        seller: number
    ): Promise<OrderType[]> {
        const sql = `SELECT co.*, c.id as cliente_id,  c.nome as cliente_nome,
            DATE_FORMAT(co.data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(co.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(co.observacoes USING utf8) AS observacoes
        FROM ${dbName}.pedidos AS co
        JOIN ${dbName}.clientes c ON c.codigo = co.cliente
        WHERE co.vendedor = ?
        AND co.data_cadastro BETWEEN ? AND ?
        ${filter !== '' ? 'AND (c.nome LIKE ? OR c.cnpj LIKE ?)' : ''}`;

        const values: any[] = [seller, startDate, endDate];
        if (filter) {
            values.push(`%${filter}%`, `%${filter}%`);
        }

        const [result] = await conn.query(sql, values);
        return result as OrderType[];
    }

    async findByParams(dbName: string, params: {
        startDate?: string;
        endDate?: string;
        seller?: number;
        client?: number;
        cnpj?: string;
        limit?: number;
        name?: string;
        search?:string;
        type?: number;
        situacao?: 'EA' | 'FI' | 'RE' | 'AI' | 'FP',
        situacao_separacao?:    'I' | 'P' | 'N' 
    }): Promise<OrderType[]> {
        const {
            startDate,
            endDate,
            seller,
            client,
            cnpj,
            limit,
            search,
            situacao,
            situacao_separacao,
            type
        } = params;

        const sql = `SELECT pe.*, c.id as cliente_id,  c.nome as cliente_nome,
            DATE_FORMAT(pe.data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(pe.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(pe.observacoes USING utf8) AS observacoes
        FROM ${dbName}.pedidos AS pe
        JOIN ${dbName}.clientes c ON c.codigo = pe.cliente`;

        const conditions: string[] = [];
        const values: any[] = [];

        if (startDate && endDate) {
            conditions.push("pe.data_cadastro BETWEEN ? AND ?");
            values.push(startDate, endDate);
        }
        if (client) {
            conditions.push("pe.cliente = ?");
            values.push(Number(client));
        }
        if (seller) {
            conditions.push("pe.vendedor = ?");
            values.push(Number(seller));
        }
        if (cnpj) {
            conditions.push("c.cnpj = ?");
            values.push(Number(cnpj));
        }

        if(situacao_separacao){
            conditions.push("pe.situacao_separacao = ?");
            values.push(String(situacao_separacao));
        }
        if (type) {
            conditions.push("pe.tipo = ?");
            values.push(Number(type));
        }
        if(situacao){
            conditions.push("pe.situacao = ?");
            values.push(String(situacao));
            
        }
        if (search) {
            conditions.push("c.nome LIKE ?");
            values.push(`%${search}%`);
        }

        let finalSql = sql;
        if (conditions.length > 0) {
            finalSql += ' WHERE ' + conditions.join(' AND ');
        }

        finalSql += ' ORDER BY pe.data_recadastro ';
        
        if(limit){
        finalSql += ' LIMIT ?';
        values.push(Number(limit));
        }

        const [result] = await conn.query(finalSql, values);
        return result as OrderType[];
    }

    async findTotalsByDate(dbName: string, seller: number): Promise<{ total: string; data_cadastro: string }[]> {
        const sql = `SELECT 
            SUM(total_geral) as total,
            DATE_FORMAT(data_cadastro, '%Y-%d-%m') as data_cadastro
        FROM ${dbName}.pedidos
        WHERE vendedor = ?
        GROUP BY data_cadastro`;

        const [result] = await conn.query(sql, [seller]);
        return result as { total: string; data_cadastro: string }[];
    }

    async findLastInserted(dbName: string, seller: number, limit: number): Promise<OrderType[]> {
        const sql = `SELECT 
            p.id, COALESCE(p.id_externo, 0) AS id_externo,
            p.total_geral, p.situacao, 
              c.id as cliente_id,  c.nome as cliente_nome,
            DATE_FORMAT(p.data_cadastro, '%Y-%m-%d') AS data_cadastro
        FROM ${dbName}.pedidos AS p
        JOIN ${dbName}.clientes as c ON c.codigo = p.cliente
        WHERE p.vendedor = ?
        ORDER BY p.data_cadastro DESC
        LIMIT ?`;

        const [result] = await conn.query(sql, [seller, limit]);
        return result as OrderType[];
    }

    async findStats(dbName: string, seller: number): Promise<{
            total_faturado: string;
            total_pedidos: string;
            media_pedidos: string;
            quantidade_pedidos: number;
            novos_clientes: number;
            total_clientes: number;
        }[]> {
            const sql = `SELECT  
                (SELECT COALESCE( SUM(pf.total_geral),0) AS total_faturado 
                FROM ${dbName}.pedidos pf 
                WHERE pf.situacao = 'FI' AND pf.vendedor = ?) AS total_faturado,
                (SELECT COALESCE(SUM(total_geral), 0 ) 
                FROM ${dbName}.pedidos 
                WHERE vendedor = ?) AS total_pedidos,
                (SELECT AVG(total_geral) 
                FROM ${dbName}.pedidos 
                WHERE vendedor = ?) AS media_pedidos,
                (SELECT COUNT(codigo) 
                FROM ${dbName}.pedidos 
                WHERE vendedor = ?) AS quantidade_pedidos,
                (SELECT COUNT(codigo) 
                FROM ${dbName}.clientes 
                WHERE ativo = 'S' 
                AND data_cadastro >= DATE_FORMAT(NOW(), '%Y-%m-01')
                AND vendedor = ?) AS novos_clientes,
                (SELECT COUNT(codigo) 
                FROM ${dbName}.clientes 
                WHERE ativo = 'S' 
                AND (vendedor = ? OR vendedor = 0)) AS total_clientes
            FROM DUAL`;

            const [result] = await conn.query(sql, [seller, seller, seller, seller, seller, seller]);
            return result as {
                total_faturado: string;
                total_pedidos: string;
                media_pedidos: string;
                quantidade_pedidos: number;
                novos_clientes: number;
                total_clientes: number;
            }[];
    }

    getCurrentDateWithoutTime(): string {
        const current = new Date();
        const day = String(current.getDate()).padStart(2, '0');
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const year = current.getFullYear();
        return `${year}-${month}-${day} 00:00:00`;
    }

    formatDate(data: string): string | null {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!regex.test(data)) {
            return null;
        }
        return data;
    }
}
