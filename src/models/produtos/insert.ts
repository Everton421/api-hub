import { conn } from "../../database/databaseConfig";
import { ProdutoBanco } from "../../types/produto/type-produto";


export class InsertProdutos {

    async insert(empresa: any, produto: ProdutoBanco) {

        return new Promise(async (resolve, reject) => {
            let {
                ativo,
                class_fiscal,
                cst,
                data_cadastro,
                data_recadastro,
                descricao,
                caracteristica,
                estoque,
                grupo,
                unidade_medida,
                marca,
                num_original,
                origem,
                preco,
                sku,
                tipo,
                num_fabricante,
                observacoes1,
                observacoes2,
                observacoes3,
                    id,
            } = produto

            const sql = ` INSERT INTO  ${empresa}.produtos  
                             (
                            id,
                            estoque ,
                            preco ,
                            unidade_medida,
                            grupo ,
                            origem ,
                            descricao ,
                            num_fabricante ,
                            num_original ,
                            sku ,
                            marca ,
                            class_fiscal ,
                            data_cadastro ,
                            data_recadastro ,
                            tipo,
                            observacoes1,
                            observacoes2,
                            observacoes3
                                ) VALUES (
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,
                                     ?,  
                                     ?, 
                                     ?,
                                     ?,
                                     ? ,
                                     ?
                                  )
                            `;

                            const values = [ 
                                                id,
                                                estoque,
                                                preco,
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
                                                observacoes3 ]

            await conn.query(sql,values, (err: any, result: any) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    console.log(`produto cadastrado com sucesso `)
                    resolve(result);
                }
            })
        })
    }

}
