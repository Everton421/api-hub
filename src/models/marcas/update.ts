import { conn } from "../../database/databaseConfig"
import { marca } from "../../types/marcaProduto/marca";

export class UpdateMarca{


    async update ( empresa:any, marca:marca){

       return new Promise( async ( resolve, reject)=>{
            let {
                codigo,
                data_cadastro,
                data_recadastro,
                descricao,
                ativo
            } = marca

                const sql =` UPDATE  ${empresa}.marcas SET  
                                    codigo = ${codigo},
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
                                    console.log(`marca atualizada com sucesso `)
                                     resolve(result);
                                }
                            })
                        })
        }

}
 