import { conn } from "../../database/databaseConfig"
import { marca } from "../../types/marcaProduto/type-marca";
import { tipo_os } from "../../types/tipo_os/type-tipo-os";

export class Update_tipo_os{


    async update ( empresa:any, tipo_os:tipo_os){

       return new Promise( async ( resolve, reject)=>{
            let {
                codigo,
                id,
                data_cadastro,
                data_recadastro,
                descricao,
                ativo
            } = tipo_os

                const sql =` UPDATE  ${empresa}.tipos_os SET  
                                    id = ${id},
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
                                    console.log(`tipo_os atualizada com sucesso `)
                                     resolve(result);
                                }
                            })
                        })
        }

}
 