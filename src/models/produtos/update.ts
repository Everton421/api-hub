import { conn } from "../../database/databaseConfig";

export class UpdateProdutos {

    async update(empresa: any, produto: any) {

        return new Promise(async (resolve, reject) => {
            let {
                codigo,
                ativo,
                class_fiscal,
                cst,
                data_cadastro,
                data_recadastro,
                descricao,
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
                observacoes3 } = produto

            const sql = ` UPDATE  ${empresa}.produtos SET  
                                   estoque          =  ?,
                                   ativo            =  ?,
                                   preco            =  ?,
                                   unidade_medida   =  ?,
                                   grupo            =  ?,
                                   origem           =  ?,
                                   descricao        =  ?,
                                   num_fabricante   =  ?,
                                   num_original     =  ?,
                                   sku              =  ?,
                                   marca            =  ?,
                                   class_fiscal     =  ?,
                                   data_cadastro    =  ?,
                                   data_recadastro  =  ?,  
                                   tipo             =  ?,
                                   observacoes1     =  ?,
                                   observacoes2     =  ?,
                                   observacoes3     =  ?  
                                   where codigo = ?
                            `;
                
                const values = [
                                estoque,
                                ativo,
                                String(preco),
                                unidade_medida,
                                grupo,
                                origem,
                                descricao,
                                num_fabricante,
                                num_original,
                                sku,
                                marca,
                                class_fiscal,
                                data_cadastro,
                                data_recadastro,
                                tipo,
                                observacoes1,
                                observacoes2,
                                observacoes3,
                                codigo
                ]

            await conn.query(sql, values, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log(`produto atualizado com sucesso `)
                    resolve(result);
                }
            })
        })
    }

}
