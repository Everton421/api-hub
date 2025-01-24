import { conn } from "../../database/databaseConfig"

export class SelectOrcamento{

    async validaExistencia(empresa:any,codigo:number   ){
        return new Promise(async (resolve, reject) => {
            const code =  codigo 
            const sql = ` select * from ${empresa}.pedidos where codigo =  ?  `;
            conn.query(sql, [ code ],(err:any, result:any) => {
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


        let objSelect = new  SelectOrcamento();
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

            const sql = `select *, CONVERT(observacoes USING utf8) as observacoes from ${empresa}.pedidos as co
                where   co.data_recadastro >= '${param_data}' and co.vendedor = ${vendedor}
            `;
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