import { conn } from "../../database/databaseConfig.ts";
import { type Requirements, type ProdutoRequerimento, type LoteSerieRequerimento } from "./types/requirements.ts";

export class SelectRequirements {
    async findAll(
        dbName: string,
        filters: {
            codigo?:number,
            situacao?: string;
            data_requerimento?: string;
            setor_origem?: number;
            setor_destino?: number;
            search?:string
            limit?: number;
        }
    ): Promise<Requirements[]> {
        const conditions: string[] = [];
        const values: (string | number)[] = [];

        if (filters.situacao) {
            conditions.push('situacao = ?');
            values.push(filters.situacao);
        }

        if (filters.data_requerimento) {
            conditions.push('data_requerimento = ?');
            values.push(filters.data_requerimento);
        }

        if (filters.setor_origem  ) {
            conditions.push('setor_origem = ?');
            values.push(filters.setor_origem);
        }

        if (filters.codigo  ) {
            conditions.push('codigo = ?');
            values.push(filters.codigo);
        }
        

        if (filters.setor_destino) {
            conditions.push('setor_destino = ?');
            values.push(filters.setor_destino);
        }

        if(filters.search){
        
                const arrayString = filters.search.split(' ').map((i)=>{
                    return `%${i}%`
                });
                 if(arrayString.length > 0 ){
                    for(const i of arrayString){
                        conditions.push(' historico like  ? ')
                        values.push(i);
                    }
                 }
            }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limitClause = filters.limit ? `LIMIT ${filters.limit}` : '';

        const sql = `SELECT  
                *,
            DATE_FORMAT(data_efetuacao, '%Y-%m-%d') AS data_efetuacao,
            DATE_FORMAT(data_requerimento, '%Y-%m-%d') AS data_requerimento
        FROM ${dbName}.requerimentos ${whereClause} ORDER BY codigo DESC ${limitClause}`;
            

        const [result] = await conn.query(sql, values);
        return result as Requirements[];
    }

    async findByCode(dbName: string, codigo: number): Promise<Requirements[]> {
        const sql = `SELECT  
        *,
            DATE_FORMAT(data_efetuacao, '%Y-%m-%d') AS data_efetuacao,
            DATE_FORMAT(data_requerimento, '%Y-%m-%d') AS data_requerimento
        FROM ${dbName}.requerimentos WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as Requirements[];
    }


    async verifyExistsByCode(dbName: string, codigo: number): Promise<{codigo:number}[]> {
        const sql = `SELECT  
        codigo
        FROM ${dbName}.requerimentos WHERE codigo = ?`;
        const [result] = await conn.query(sql, [codigo]);
        return result as Requirements[];
    }
}

export class SelectItemsRequirements {
    async findByRequerimento(dbName: string, requerimento: number): Promise<ProdutoRequerimento[]> {
        const sql = `SELECT pr.*,
            p.descricao 
        FROM ${dbName}.produtos_requerimento pr 
        join ${dbName}.produtos p on p.codigo = pr.produto
        WHERE pr.requerimento = ?`;
        const [result] = await conn.query(sql, [requerimento]);
        return result as ProdutoRequerimento[];
    }

    async findLotesByRequerimento(dbName: string, requerimento: number): Promise<LoteSerieRequerimento[]> {
        const sql = `SELECT * FROM ${dbName}.lotes_series_requerimento WHERE requerimento = ?`;
        const [result] = await conn.query(sql, [requerimento]);
        return result as LoteSerieRequerimento[];
    }

    async findLotesByRequerimentoAndProduto(
        dbName: string,
        requerimento: number,
        produto: number
    ): Promise<LoteSerieRequerimento[]> {
        const sql = `SELECT * FROM ${dbName}.lotes_series_requerimento WHERE requerimento = ? AND produto = ?`;
        const [result] = await conn.query(sql, [requerimento, produto]);
        return result as LoteSerieRequerimento[];
    }
}
