import { conn } from "../../database/databaseConfig"
import { categoria } from "../../types/categoriaProduto/type-categoria";

export class updateCategoria{

    async update ( empresa:any, categoria:categoria){

       return new Promise( async ( resolve, reject)=>{
            let {
                codigo,
                data_cadastro,
                data_recadastro,
                descricao,
                ativo,
                id,
            } = categoria

                const sql =` UPDATE  ${empresa}.categorias SET  
                                     id='${id}',
                                    data_cadastro = '${data_cadastro}',
                                    data_recadastro = '${data_recadastro}',
                                    descricao = '${descricao}',
                                    ativo = '${ativo}'
                                   where codigo = ${codigo}
                            `;

                            await conn.query(sql,   (err:any, result:any )=>{
                                if(err){
                                     console.log(err)
                                     reject(err);
                                }else{
                                    console.log(`categoria atualizada com sucesso `)
                                     resolve(result);
                                }
                            })
                        })
        }

}
 