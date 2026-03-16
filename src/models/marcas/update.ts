import { conn } from "../../database/databaseConfig";
import { marca } from "../../types/marcaProduto/type-marca";

export class UpdateMarca {


    async update(empresa: any, marca: marca) {

        return new Promise(async (resolve, reject) => {
            let {
                codigo,
                data_cadastro,
                data_recadastro,
                descricao,
              id,
                ativo
            } = marca

            const sql = ` UPDATE  ${empresa}.marcas SET  
                                    codigo          =  ?,
                                    id              =  ?,
                                    data_cadastro   =  ?,
                                    data_recadastro =  ?,
                                    descricao       =  ?,
                                    ativo           =  ?
                                    where codigo = ?
                            `;

                            const values = [
                                codigo,
                                id,
                                data_cadastro,
                                data_recadastro,
                                descricao,
                                ativo,
                                codigo,
                                ]
            await conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log(`marca atualizada com sucesso `)
                    resolve(result);
                }
            })
        })
    }

}
