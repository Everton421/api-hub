import { conn } from "../../database/databaseConfig";

export class InsertitensPedido {


    async cadastraProdutosDoPedido(produtos: any, empresa: any, codigoPedido: any) {
        return new Promise(async (resolve, reject) => {

            let i = 1;
            for (let p of produtos) {
                let {
                    codigo,
                    preco,
                    quantidade,
                    desconto,
                    total,
                    quantidade_separada,
                    quantidade_faturada
                } = p

                if (!preco) preco = 0;
                if (!quantidade) quantidade = 0;
                if (!desconto) desconto = 0;

                if (!total) total = 0;
                if(!quantidade_separada ) quantidade_separada = 0; 
                if(!quantidade_faturada ) quantidade_faturada = 0; 
                const sql = ` INSERT INTO ${empresa}.produtos_pedido ( pedido ,  codigo ,  desconto ,  quantidade ,  preco ,  total, quantidade_separada, quantidade_faturada ) VALUES (? , ?, ?, ?, ?, ?, ?, ? ) `;
                let dados = [codigoPedido, codigo, desconto, quantidade, preco, total, quantidade_separada, quantidade_faturada ]
                await conn.query(sql, dados, (error: any, resultado: any) => {
                    if (error) {
                        reject(" erro ao inserir produto do orcamento " + error);
                    } else {
                        resolve(resultado)
                        console.log(`produto  inserido com sucesso`);
                    }
                })

                if (i === produtos.length) {
                    return;
                }
                i++;
            }
        })
    }


    async cadastraParcelasDoPedido(parcelas: any, empresa: any, codigoPedido: any) {
        return new Promise(async (resolve, reject) => {
            parcelas.forEach(async (p: any) => {

                let {
                    pedido, parcela, valor, vencimento
                } = p

                let sql = `  INSERT INTO ${empresa}.parcelas ( pedido ,  parcela ,  valor, vencimento ) VALUES ( ?  , ?,  ?, ?  )`;
                let dados = [codigoPedido, parcela, valor, vencimento]


                await conn.query(sql, dados, (err: any, resultParcelas: any) => {
                    if (err) {
                        console.log("erro ao inserir parcelas !" + err)

                    } else {
                        console.log('  Parcela inserida com sucesso ')
                        resolve(codigoPedido)
                    }
                }
                )
            })
        })

    }



    async cadastraServicosDoPedido(servicos: any, codigoPedido: any, empresa: any) {

        return new Promise(async (resolve, reject) => {

            if (servicos.length > 0) {
                let i = 1;
                for (let s of servicos) {
                    let {
                        codigo,
                        preco,
                        quantidade,
                        desconto,
                        total,
                        valor,
                    } = s

                    if (!preco) preco = 0;
                    if (!quantidade) quantidade = 0;
                    if (!desconto) desconto = 0;
                    if (!total) total = 0;

                    const sql = ` INSERT INTO    ${empresa}.servicos_pedido  ( pedido ,  codigo ,  desconto ,  quantidade ,  valor ,  total ) VALUES ( ?, ?, ?, ?, ?, ?)   `;

                    let dados = [codigoPedido, codigo, desconto, quantidade, valor, total]
                    await conn.query(sql, dados, (error: any, resultado: any) => {
                        if (error) {
                            console.log(" erro ao inserir servico do orcamento " + error)
                            reject(" erro ao inserir servico do orcamento " + error);
                        } else {
                            resolve(resultado)
                            console.log(`servico  inserido com sucesso`);
                        }
                    })

                    if (i === servicos.length) {
                        return;
                    }
                    i++;

                }
            }
        })
    }

}