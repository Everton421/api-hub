import { conn } from "../../database/databaseConfig";

export interface IFoto {
    id?: number;
    produto?: number;
    foto?: string;
    data_cadastro?: string;
    data_recadastro?: string;
}

export class Select_fotos {

    async busca_geral(empresa: string, data_recadastro?: string): Promise<IFoto[]> {
        let sql = ` SELECT *,
              TO_BASE64(foto) AS foto,
               DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
               DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
            FROM ${empresa}.fotos_produtos   `;
        
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
        return result as IFoto[];
    }

    async buscaPorProduto(empresa: string, codigoProduto: number): Promise<IFoto[]> {
        let sql = ` select
                         *,
                        TO_BASE64(foto) AS foto,
                      DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
                      DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
            from ${empresa}.fotos_produtos where produto = ?`;
        
        const [result] = await conn.query(sql, [codigoProduto]);
        return result as IFoto[];
    }
}
