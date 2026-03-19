import { conn } from "../../database/databaseConfig";
import { IProdutoSetor } from "./types/produto-setor";

type query = {
    setor: string,
    produto: string,
    local_produto: string,
    local1_produto: string,
    local2_produto: string,
    local3_produto: string,
    local4_produto: string
}
export class SelectProdutoSetor {

    async findAll(empresa: any, data_recadastro: string) {
        return new Promise<IProdutoSetor[]>(async (resolve, reject) => {

            let sql = ` select 
            ps.*,
            s.id  as id_setor,
            p.id as id_produto,
               coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps
            join ${empresa}.setores s on s.codigo = ps.setor  
            join ${empresa}.produtos p on p.codigo = ps.produto

            `

            let paramQuery = [];
            let valueQuery = [];
            if (data_recadastro) {
                paramQuery.push(` WHERE ps.data_recadastro >  ? `)
                valueQuery.push(data_recadastro);
            }
            let finalSql = sql;

            if (paramQuery.length > 0) {
                finalSql = sql + paramQuery;
            } else {
                finalSql = sql + ` WHERE  s.ativo ='S'   ;`;
            }
            await conn.query(finalSql, valueQuery, (err: any, result: IProdutoSetor[]) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }

    /*
    async findByDescription(empresa: string, query:Partial<query>): Promise<IProdutoSetor[]> {
   
            let {
            setor,
            produto,
            local_produto,
            local1_produto,
            local2_produto,
            local3_produto,
            local4_produto
            } = query;
    
            let baseSql = `
                SELECT
                    *,
                 coalesce( DATE_FORMAT(data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
                FROM  ${empresa}.setores
            `;  
    
            const conditions: string[] = [];
            const params: any[] = [];
    
        
            if (setor) {
                conditions.push(" setor = ?"); // Placeholder (?) para o parâmetro
                params.push(setor);          // Adiciona o valor ao array de parâmetros
            }
            
            if (produto) {
                conditions.push(" produto = ?");
                params.push( produto );  
            }

            if(local_produto){
                conditions.push(' local_produto = ? ');
                params.push(`${local_produto}`)
            }
            if(local1_produto){
                conditions.push(' local1_produto = ? ');
                params.push(`${local1_produto}`)
            }
            if(local2_produto){
                conditions.push(' local2_produto = ? ');
                params.push(`${local2_produto}`)
            }
            if(local3_produto){
                conditions.push(' local3_produto = ? ');
                params.push(`${local3_produto}`)
            }
            if(local4_produto){
                conditions.push(' local4_produto = ? ');
                params.push(`${local4_produto}`)
            }


            let whereClause = "";
            
            if (conditions.length > 0) {
                whereClause = " WHERE " + conditions.join(" AND ");
            }
    
            //conditions.join(" LIMIT ?");
    
    
            const finalSql = baseSql + whereClause  
    
            try {
           
                 return new Promise <IProdutoSetor[]> ( async ( resolve , reject ) =>{
                    await conn.query(finalSql, params,(err:any, result:IProdutoSetor[] )=>{
                        if (err){
                            reject(err);
                        }else{
                            resolve(result)
    
                        } 
                    })
    
                 })
    
    
            } catch (err) {
                console.error("Erro ao executar a query:", err);
                throw new Error("Falha ao buscar setorres no banco de dados.");
                // Ou `reject(err)` se estivesse dentro do `new Promise` original, mas com async/await é melhor lançar.
            }
       }
       */


    async findByCode(empresa: any, produto: number) {
        return new Promise<IProdutoSetor[]>(async (resolve, reject) => {

            let sql = ` select 
            ps.*,
                 coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps 
            join setores s on s.codigo = ps.setor
            where produto = ? and s.ativo = 'S'; `

            await conn.query(sql, produto, (err: any, result: IProdutoSetor[]) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }
    async findByProdSector(empresa: any, produto: number, setor: number) {
        return new Promise<IProdutoSetor[]>(async (resolve, reject) => {
            let sql = ` select 
            ps.*,
            s.id  as id_setor,
            p.id as id_produto
                 coalesce( DATE_FORMAT(ps.data_recadastro, '%Y-%m-%d %H:%i:%s'), '0000-00-00 00:00:00') AS data_recadastro
            from ${empresa}.produto_setor ps 
            join ${empresa}.setores s  on s.codigo = ps.setor
            join ${empresa}.produtos p on p.codigo = ps.produto
            where ps.produto = ${produto}  and ps.setor = ${setor} 
            and s.ativo = 'S';
            `

            await conn.query(sql, (err: any, result: IProdutoSetor[]) => {
                if (err) reject(err);
                resolve(result)
            })
        })
    }
}