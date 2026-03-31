import { conn } from "../../database/databaseConfig";
import { VeiculoBanco } from "../../types/veiculo/type-veiculo";

export class Select_veiculos {

    async buscaGeral(dbName: string, data_recadastro?: string): Promise<VeiculoBanco[]> {
        let sql = `select *,
              DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
        DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
        from ${dbName}.veiculos
            `;

        let paramQuery: string[] = [];
        let valueQuery: any[] = [];

        if (data_recadastro) {
            paramQuery.push(' WHERE data_recadastro >  ? ');
            valueQuery.push(data_recadastro);
        }

        let finalSql = sql;
        if (paramQuery.length > 0) {
            finalSql = sql + paramQuery.join('');
        }
        
        const [result] = await conn.query(finalSql, valueQuery);
        return result as VeiculoBanco[];
    }

    async buscaPorCliente(dbName: string, cliente: number): Promise<VeiculoBanco[]> {
        let sql = `select *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
                from ${dbName}.veiculos
                where cliente = ?
                ;  `;

        const [result] = await conn.query(sql, [cliente]);
        return result as VeiculoBanco[];
    }

    async buscaPorCodigo(dbName: any, codigo: number): Promise<VeiculoBanco[]> {
        let sql = `select *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro 
                from ${dbName}.veiculos
                where codigo = ?
                ;  `;

        const [result] = await conn.query(sql, [codigo]);
        return result as VeiculoBanco[];
    }


    async novaBusca(empresa: string, query: any): Promise<VeiculoBanco[]> {
        let {
            codigo,
            cliente,
            id,
            limit,
            placa,
            marca,
            modelo,
            ano,
            ativo,
        } = query;


        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.veiculos 
        `;

        const conditions: string[] = [];
        const params: any[] = [];

        if (!limit || isNaN(limit)) {
            limit = 20;
        }

        if (codigo) {
            conditions.push("codigo = ?");
            params.push(codigo);
        }
        if (id) {
            conditions.push("id = ?");
            params.push(Number(id));
        }
        if (cliente) {
            conditions.push("cliente = ?");
            params.push(Number(cliente));
        }
        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }
        if (placa) {
            conditions.push("placa LIKE ?");
            params.push(`%${placa}%`);
        }

        if (marca) {
            conditions.push("marca LIKE ?");
            params.push(`%${marca}%`);
        }

        if (modelo) {
            conditions.push("modelo LIKE ?");
            params.push(`%${modelo}%`);
        }

        if (ano) {
            conditions.push("ano LIKE ?");
            params.push(`%${ano}%`);
        }

        let whereClause = "";

        if (conditions.length > 0) {
            whereClause = " WHERE " + conditions.join(" AND ");
        }

        let limitQuery = " LIMIT ? ";
        params.push(Number(limit));

        const finalSql = baseSql + whereClause + limitQuery;

        const [result] = await conn.query(finalSql, params);
        return result as VeiculoBanco[];
    }

}
