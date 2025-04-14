import { conn } from "../../database/databaseConfig";
import { formaPagamentoBanco } from "../../types/formas_pagamento/formas_pagamento";



export class update_formaPagamento{

    async update(empresa:string, fpgt:formaPagamentoBanco){
       return new Promise( async ( resolve, reject)=>{

        const { 
        codigo,
        id,
        descricao,
        desc_maximo,
        intervalo,
        parcelas,
        recebimento,
        data_cadastro,
        data_recadastro,
        ativo
        }= fpgt;

        const sql = `
        UPDATE ${empresa}.forma_pagamento SET
                id ='${id}',
                descricao ='${descricao}',
                desc_maximo ='${desc_maximo}',
                intervalo ='${intervalo}',
                parcelas ='${parcelas}',
                recebimento ='${recebimento}',
                data_cadastro ='${data_cadastro}',
                data_recadastro ='${data_recadastro}',
                ativo ='${ativo}'

                where codigo = ${codigo}
        ` 

          await conn.query(sql,   (err:any, result:any )=>{
                                        if(err){
                                             console.log(err)
                                             reject(err);
                                        }else{
                                            console.log(`forma de pagamento atualizada com sucesso! `)
                                             resolve(result);
                                        }
                                    })
                                })


    }
}