import { conn } from "../../database/databaseConfig"

type queryUltimoPedido = {
    id_externo: boolean
    id: boolean
    codigo: boolean
    total: boolean
}

export class SelectPedido {

    async validaExistencia(empresa: any, codigo: number) {
        return new Promise(async (resolve, reject) => {
            const code = codigo
            const sql = ` select *,
            DATE_FORMAT( data_cadastro, '%Y-%m-%d') AS data_cadastro,
             DATE_FORMAT( data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes USING utf8) as observacoes 
             from ${empresa}.pedidos where codigo =  ?  `;
            await conn.query(sql, [code], (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err)
                } else {
                    // console.log(result)

                    resolve(result);
                }
            })

        })
    }


    async buscaPordata(empresa: any, queryData: any, vendedor: number) {


        let objSelect = new SelectPedido();
        let param_data: any;
        if (!queryData) {
            param_data = objSelect.obterDataAtualSemHoras();
        } else {
            param_data = objSelect.formatarData(queryData);
            if (!param_data) {
                return
            }
        }
        return new Promise(async (resolve, reject) => {

            const sql = `select co.*, c.nome  ,
             DATE_FORMAT(co.data_cadastro, '%Y-%m-%d') AS data_cadastro,
             DATE_FORMAT(co.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes USING utf8) as observacoes 
            from ${empresa}.pedidos as co
            join ${empresa}.clientes c on c.codigo = co.cliente
                where   co.data_recadastro >= '${param_data}' and co.vendedor = ${vendedor} 
            `;
            await conn.query(sql, async (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    /**
     * 
     * @param empresa empresa a ser consultado o pedido 
     * @param queryData  dado para obter o ultimo pedido, ex: total: obtem o pedido com maior total, id: traz o pedido com o maior id 
     * @param vendedor 
     * @returns 
     */


    async buscaPorDataInicialFinal(empresa: any, dataInicial: string, dataFinal: string, filter: string | null, vendedor: number) {
        let objSelect = new SelectPedido();
        return new Promise(async (resolve, reject) => {

            const sql = `
            SELECT co.*, c.nome,
            DATE_FORMAT(co.data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(co.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes USING utf8) AS observacoes
            FROM ${empresa}.pedidos AS co
            JOIN ${empresa}.clientes c ON c.codigo = co.cliente
            WHERE co.vendedor = ?
            AND co.data_cadastro BETWEEN ? AND ?
            ${filter !== '' ? `AND c.nome LIKE  ? ` : ''}
            ${filter !== '' ? ` OR c.cnpj LIKE  ? ` : ''}

        `;



            const params = [vendedor, dataInicial, dataFinal];
            if (filter) {
                params.push(`%${filter}%`); // Adiciona o filtro com wildcards
                params.push(`%${filter}%`); // Adiciona o filtro com wildcards

            }

            // console.log(params)
            // console.log(sql)

            await conn.query(sql, params, async (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    resolve(result)
                }
            })

        })
    }



    async novaBusca(empresa: any, query: any) {

        let {
            dataInicial,
            dataFinal,
            vendedor,
            cliente,
            cnpj,
            limit,
            nome,
            tipo
        } = query

        let objSelect = new SelectPedido();

        return new Promise(async (resolve, reject) => {

            const baseSql = `
            SELECT pe.*, c.nome,
            DATE_FORMAT(pe.data_cadastro, '%Y-%m-%d') AS data_cadastro,
            DATE_FORMAT(pe.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes USING utf8) AS observacoes
            FROM ${empresa}.pedidos AS pe
            JOIN ${empresa}.clientes c ON c.codigo = pe.cliente

        `;

            const conditions: string[] = [];
            const params: any[] = [];


            if (!limit || isNaN(limit)) {
                limit = 20;
            }

            if (dataInicial && dataFinal) {
                conditions.push(`pe.data_cadastro BETWEEN '${dataInicial}' AND '${dataFinal}'  `);
            }

            if (cliente) {
                conditions.push("pe.cliente = ?");
                params.push(Number(cliente));
            }

            if (vendedor) {
                conditions.push("pe.vendedor = ?");
                params.push(Number(vendedor));
            }

            if (cnpj) {
                conditions.push("c.cnpj = ?");
                params.push(Number(cnpj));
            }

            if (tipo) {
                conditions.push("pe.tipo = ?");
                params.push(Number(tipo));
            }

            if (nome) {
                conditions.push("c.nome like  ?");
                params.push(`%${nome}%`);
            }

            let whereClause = "";

            if (conditions.length > 0) {
                whereClause = " WHERE " + conditions.join(" AND ");
            }

            let limitQuery = " LIMIT ? "

            params.push(Number(limit));

            const finalSql = baseSql + whereClause + " order by pe.data_recadastro " + limitQuery;

            await conn.query(finalSql, params, async (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    resolve(result)
                }
            })

        })
    }


    obterDataAtualSemHoras() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia} 00:00:00`;
    }

    formatarData(data: string): string | null {
        const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        if (!regex.test(data)) {
            return null;
        }
        return data;
    }


    async buscaCompleta() {

    }

    /**
     *  obtem os totais dos pedidos agrupados por data
     * @param empresa 
     * @param vendedor 
     * @returns 
     */
    async totalPedidosAgrupData(empresa: any, vendedor: number) {
        return new Promise(async (resolve, reject) => {

            let sqL = ` SELECT 
                       SUM(total_geral ) as total,
                       DATE_FORMAT(data_cadastro, '%Y-%d-%m') as data_cadastro
                  FROM
                   ${empresa}.pedidos 
                 WHERE  vendedor =  ?   
                 GROUP BY  data_cadastro;   `
            await conn.query(sqL, vendedor, async (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    resolve(result)
                }
            })

        })

    }

    /**
     *  obtem os ultimos inseridos pelo vendedor 
     * @param empresa 
     * @param vendedor 
     * @param limit 
     * @returns 
     */
    async ultimosInseridos(empresa: any, vendedor: number, limit: number) {
        return new Promise(async (resolve, reject) => {

            let sql = `
                      SELECT
                              p.id, COALESCE(p.id_externo,0) AS id_externo  , p.total_geral, p.situacao, c.nome, DATE_FORMAT(p.data_cadastro,'%Y-%m-%d') AS data_cadastro
                          FROM ${empresa}.pedidos AS p 
                              JOIN ${empresa}.clientes as c on c.codigo = p.cliente
                              WHERE p.vendedor  = ? 
                              order by p.data_cadastro DESC
                          LIMIT ?; `

            await conn.query(sql, [vendedor, limit], async (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    resolve(result)
                }
            })

        })
    }


    /**
     *  obtem os totais, media, etc
     * @param empresa 
     * @param vendedor 
     * @returns 
     */
    async totaisMedia(empresa: any, vendedor: any) {

        return new Promise(async (resolve, reject) => {
            let sql = `  SELECT  
                (
                    SELECT SUM( pf.total_geral  ) AS  total_faturado 
                    FROM ${empresa}.pedidos pf WHERE pf.situacao = 'FI' 
                    AND vendedor = ${vendedor} 
                ) AS total_faturado,
                    (
                    SELECT SUM(  total_geral  ) AS  total_faturado 
                    FROM ${empresa}.pedidos    
                    WHERE vendedor = ${vendedor}  
                ) AS total_pedidos,
                (
                    SELECT AVG( total_geral  ) AS  total_faturado 
                    FROM ${empresa}.pedidos    
                    WHERE  vendedor = ${vendedor} 
                ) AS media_pedidos,
                    (
                    SELECT COUNT( codigo)  
                    FROM ${empresa}.pedidos 
                    WHERE vendedor = ${vendedor} 
                ) AS quantidade_pedidos,
                ( 
                SELECT 
                    COUNT( codigo) 
                    FROM ${empresa}.clientes WHERE 
                    ativo = 'S' AND 
                    data_cadastro >=  DATE_FORMAT( NOW(), '%Y-%m-01') AND
                    vendedor = ${vendedor}  
                ) AS novos_clientes,
                (
                SELECT 
                    COUNT( codigo) 
                    FROM ${empresa}.clientes WHERE
                    ativo = 'S' AND
                     vendedor = ${vendedor}
                      OR vendedor = 0    
                ) AS total_clientes 
                    
                FROM ${empresa}.pedidos as p 
                WHERE p.vendedor = ${vendedor} 
                    GROUP BY 1; `
            await conn.query(sql, vendedor, async (err: any, result: any) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

}
