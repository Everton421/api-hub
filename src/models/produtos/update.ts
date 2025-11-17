import { conn } from "../../database/databaseConfig"

export class UpdateProdutos{

    async update ( empresa:any, produto:any){

       return new Promise( async ( resolve, reject)=>{
            let {
                codigo,
                ativo,
                class_fiscal,
                cst,
                data_cadastro,
                data_recadastro,
                descricao,
                caracteristica,
                estoque,
                grupo,
                marca,
                num_original,
                origem,
                unidade_medida,
                preco,
                sku,
                tipo,
                num_fabricante,
                observacoes1,
                observacoes2,
                observacoes3   } = produto

                const sql =` UPDATE  ${empresa}.produtos SET  
                                   estoque = ${estoque} ,
                                   ativo = '${ativo}',
                                   preco = ${preco} ,
                                   caracteristica = ${caracteristica},
                                   unidade_medida='${unidade_medida}',
                                   grupo = ${grupo} ,
                                   origem = ${origem} ,
                                   descricao = '${descricao}',
                                   num_fabricante = '${num_fabricante}' ,
                                   num_original = '${num_original}' ,
                                   sku = '${sku}' ,
                                   marca = ${marca} ,
                                   class_fiscal = '${class_fiscal}',
                                   data_cadastro = '${data_cadastro}',
                                   data_recadastro = '${data_recadastro}',  
                                   tipo = ${tipo}, 
                                   observacoes1 = '${observacoes1}',
                                   observacoes2 = '${observacoes2}',
                                   observacoes3 = '${observacoes3}'  
                                   where codigo = ${codigo}
                            `;

                            await conn.query(sql,   (err:any, result:any )=>{
                                if(err){
                                     console.log(err)
                                     reject(err);
                                }else{
                                    console.log(`produto atualizado com sucesso `)
                                     resolve(result);
                                }
                            })
                        })
        }

}
 