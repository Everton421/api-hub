import { conn } from "../../database/databaseConfig"
import { ILocal } from "../../types/locais/type-local"


type query = {
    codigo: number,
    id: string,
    descricao: string,
    limit: number,
    ativo: 'S' | 'N'
    setor: number
}

export class SelectLocais {


    async busca_por_descricao(empresa: string, descricao: string, limit: number): Promise<ILocal[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.locais 
           WHERE descricao like ? `;
        
        let param = [`%${descricao}%`, limit];
        const [result] = await conn.query(sql, param);
        return result as ILocal[];
    }

    async busca_por_codigo(empresa: string, codigo: number, limit: number): Promise<ILocal[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.locais 
           WHERE codigo = ?
           limit ?
           `;
        
        let param = [codigo, limit];
        const [result] = await conn.query(sql, param);
        return result as ILocal[];
    }

    async buscaPorId(empresa: string, id: number, limit: number): Promise<ILocal[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.locais 
           WHERE id = ?
           limit ? 
           `;

        let param = [id, limit];
        const [result] = await conn.query(sql, param);
        return result as ILocal[];
    }


    async busca_geral(empresa: string, limit?: number, data_recadastro?: string): Promise<ILocal[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
         FROM ${empresa}.locais   
          
         `;

        let paramQuery: string[] = [];
        let valueQuery: any[] = [];

        if (data_recadastro) {
            paramQuery.push(' WHERE data_recadastro >  ? ');
            valueQuery.push(data_recadastro);
        }
        if (limit && limit > 0) {
            paramQuery.push(' LIMIT ? ');
            valueQuery.push(limit);
        }

        let finalSql = sql;
        if (paramQuery.length > 0) {
            finalSql = sql + paramQuery.join('');
        }

        const [result] = await conn.query(finalSql, valueQuery);
        return result as ILocal[];
    }



    async novaBusca(empresa: string, query: Partial<query>): Promise<ILocal[]> {
        let {
            codigo,
            id,
            descricao,
            limit,
            ativo,
            setor
        } = query;


        let baseSql = `
         SELECT *,
                DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
             FROM ${empresa}.locais 
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
        if (setor) {
            conditions.push("setor = ?");
            params.push(setor);
        }
        if (id) {
            conditions.push("id = ?");
            params.push(Number(id));
        }

        if (ativo) {
            conditions.push("ativo = ?");
            params.push(ativo);
        }

        if (descricao) {
            conditions.push("descricao LIKE ?");
            params.push(`%${descricao}%`);
        }
        
        let whereClause = "";
        if (conditions.length > 0) {
            whereClause = " WHERE " + conditions.join(" AND ");
        }

        let limitQuery = " LIMIT ? ";
        params.push(Number(limit));

        const finalSql = baseSql + whereClause + limitQuery;

        const [result] = await conn.query(finalSql, params);
        return result as ILocal[];
    }

}
