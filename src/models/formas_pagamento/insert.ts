import { conn } from "../../database/databaseConfig"
import { fpgt } from "./typeFpgt";


export class Insert_formaPagamento{

    async cadastrar(empresa:string, forma_pagamento:fpgt){
        return new Promise( async (resolve, reject)=>{

            let sql =
            `
            INSERT into ${empresa}.forma_pagamento
            (
            id,
            descricao,
            desc_maximo,
            parcelas,
            intervalo,
            recebimento,
            data_cadastro,
            data_recadastro
            ) values
            (?, ? ,? ,?, ?, ? ,? ,?  ) 
            `
            let arr  = [  forma_pagamento.id, forma_pagamento.descricao, forma_pagamento.desc_maximo, forma_pagamento.parcelas,
                forma_pagamento.intervalo, forma_pagamento.recebimento, forma_pagamento.data_cadastro, forma_pagamento.data_recadastro
             ]
            await conn.query(sql, arr,(err:any, result:any)=>{
                if(err) reject(err);
                else resolve(result)
            })
        })
    }
}

 