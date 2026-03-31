import { conn } from "../../database/databaseConfig";
import { IDistribuicaoLocaisSetor } from "../../types/distribuicao_locais_setor/distribuicao_locais_setor";



export class SelectDistribuicaoSetor {

    async selectAll(empresa: string, query: { data_recadastro?: string }): Promise<IDistribuicaoLocaisSetor[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
          FROM ${empresa}.distribuicao_locais_setor `;

        let conditions: string[] = [];
        let values: any[] = [];

        if (query.data_recadastro && query.data_recadastro !== '') {
            conditions.push(' data_recadastro > ? ');
            values.push(`${query.data_recadastro}`);
        }
        
        let finalSql = sql;
        let whereClause = ' WHERE  ';

        if (conditions.length > 0) {
            finalSql = sql + whereClause + conditions.join('');
        }

        const [result] = await conn.query(finalSql, values);
        return result as IDistribuicaoLocaisSetor[];
    }

    async selectByParam(empresa: string, query: Partial<IDistribuicaoLocaisSetor>): Promise<IDistribuicaoLocaisSetor[]> {
        if (Object.keys(query).length <= 1) {
            throw new Error("Nenhum campo fornecido para filtrar.");
        }

        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
          FROM ${empresa}.distribuicao_locais_setor `;

        let conditions: string[] = [];
        let values: any[] = [];

        if (query.produto) {
            conditions.push(' produto = ? ');
            values.push(query.produto);
        }
        if (query.setor) {
            conditions.push(' setor = ? ');
            values.push(query.setor);
        }
        if (query.local) {
            conditions.push(' local = ? ');
            values.push(query.local);
        }
        if (query.unidade_medida) {
            conditions.push(' unidade_medida = ? ');
            values.push(`${query.unidade_medida}`);
        }
        if (query.quantidade) {
            conditions.push(' quantidade = ? ');
            values.push(`${query.quantidade}`);
        }
        if (query.data_cadastro) {
            conditions.push(' data_cadastro = ? ');
            values.push(`${query.data_cadastro}`);
        }
        if (query.data_recadastro) {
            conditions.push(' data_recadastro = ? ');
            values.push(`${query.data_recadastro}`);
        }
        
        let finalSql = sql;
        let whereClause = ' WHERE  ';

        if (conditions.length > 0) {
            finalSql = sql + whereClause + conditions.join(' AND ');
        }

        const [result] = await conn.query(finalSql, values);
        return result as IDistribuicaoLocaisSetor[];
    }

    async selectByParamUpdate(empresa: string, query: Partial<IDistribuicaoLocaisSetor>): Promise<IDistribuicaoLocaisSetor[]> {
        let sql = ` SELECT *,
            DATE_FORMAT(data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro
          FROM ${empresa}.distribuicao_locais_setor `;

        let conditions: string[] = [];
        let values: any[] = [];

        if (query.produto) {
            conditions.push(' produto = ? ');
            values.push(`${query.produto}`);
        }
        if (query.setor) {
            conditions.push(' setor = ? ');
            values.push(`${query.setor}`);
        }
        if (query.local) {
            conditions.push(' local = ? ');
            values.push(`${query.local}`);
        }
        if (query.unidade_medida) {
            conditions.push(' unidade_medida = ? ');
            values.push(`${query.unidade_medida}`);
        }
        if (query.quantidade) {
            conditions.push(' quantidade = ? ');
            values.push(`${query.quantidade}`);
        }
        if (query.data_cadastro) {
            conditions.push(' data_cadastro = ? ');
            values.push(`${query.data_cadastro}`);
        }
        if (query.data_recadastro) {
            conditions.push(' data_recadastro  < ? ');
            values.push(`${query.data_recadastro}`);
        }
        
        let finalSql = sql;
        let whereClause = ' WHERE  ';

        if (conditions.length > 0) {
            finalSql = sql + whereClause + conditions.join(' AND ');
        }

        const [result] = await conn.query(finalSql, values);
        return result as IDistribuicaoLocaisSetor[];
    }
}
