import { conn } from "../../database/databaseConfig"

export class SelectPedido{
    
    async validaExistencia(empresa:any,codigo:number   ){
        return new Promise(async (resolve, reject) => {
            const code =  codigo 
            const sql = ` select *,
            DATE_FORMAT( data_cadastro, '%Y-%m-%d') AS data_cadastro,
             DATE_FORMAT( data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes USING utf8) as observacoes 
             from ${empresa}.pedidos where codigo =  ?  `;
           await conn.query(sql, [ code ],(err:any, result:any) => {
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


    async buscaPordata(empresa:any ,queryData:any, vendedor:number){


        let objSelect = new  SelectPedido();
        let param_data:any;
         if (!queryData) {
            param_data = objSelect.obterDataAtualSemHoras();
         } else {
             param_data = objSelect.formatarData(queryData);
             if (!param_data) {
                 return
             }
         }
        return new Promise( async ( resolve, reject )=>{

            const sql = `select co.*, c.nome  ,
             DATE_FORMAT(co.data_cadastro, '%Y-%m-%d') AS data_cadastro,
             DATE_FORMAT(co.data_recadastro, '%Y-%m-%d %H:%i:%s') AS data_recadastro,
            CONVERT(observacoes USING utf8) as observacoes 
            from ${empresa}.pedidos as co
            join ${empresa}.clientes c on c.codigo = co.cliente
                where   co.data_recadastro >= '${param_data}' and co.vendedor = ${vendedor} 
            `;
            console.log(sql)
            await conn.query(sql,   async (err:any, result:any) => {
                if (err) {
                    console.log(err);
                    reject(err)
                } else {
            resolve(result)
                }
            })
    }) 
    }

    async buscaPorDataInicialFinal(empresa:any ,dataInicial:string, dataFinal:string ,filter:string | null, vendedor:number ){


        let objSelect = new  SelectPedido();
  
      
        
        return new Promise( async ( resolve, reject )=>{

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
          
            await conn.query(sql, params,  async (err:any, result:any) => {
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


    async buscaCompleta(){



    }

}