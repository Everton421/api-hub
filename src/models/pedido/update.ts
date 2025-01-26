import { Request, Response, request, response } from "express";
import { conn  } from "../../database/databaseConfig";
import { CreateOrcamento } from "./insert";


export class UpdateOrcamento{
    
    
    async  updateTabelaPedido( empresa:any ,orcamento:any, codigo:number ) {
        return new Promise(async (resolve, reject) => {
            let sql = `
                UPDATE ${empresa}.pedidos  
                set 
                cliente             =  ${orcamento.codigo_cliente},
                total_geral         =  ${orcamento.total_geral} ,
                total_produtos      =  ${orcamento.total_produtos} ,
                total_servicos      =  ${orcamento.total_servicos} ,
                tipo_os             =  ${orcamento.tipo_os},
                tipo                =  ${orcamento.tipo},
                quantidade_parcelas =  ${orcamento.quantidade_parcelas} ,
                contato             = '${orcamento.contato}',
                veiculo             =  ${orcamento.veiculo},
                forma_pagamento     =  ${orcamento.forma_pagamento},
                observacoes         = '${orcamento.observacoes}',
                data_cadastro       = '${orcamento.data_cadastro}',
                data_recadastro     = '${orcamento.data_recadastro}',
                enviado             = 'S',
                observacoes         =  '${orcamento.observacoes}',
                situacao            = '${orcamento.situacao}'
                where codigo = ${codigo}
            `
            conn.query(sql, (err:any, result:any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.affectedRows);
                }
            })
        })
    }

    async   deleteProdutosPedido( empresa:any, codigo: number) {
        return new Promise((resolve, reject) => {

            let sql2 = ` delete from ${empresa}.produtos_pedido
                                    where pedido = ${codigo}
                                `
            conn.query(sql2, (err:any, result:any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

    }

    async   deleteServicosPedido(empresa:any ,codigo: number) {
        return new Promise((resolve, reject) => {

            let sql2 = ` delete from ${empresa}.servicos_pedido
                                    where pedido = ${codigo}
                                `
            conn.query(sql2, (err:any, result:any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })

    }

    async   deleteParcelasPedido(empresa:any,codigo: number) {
        return new Promise((resolve, reject) => {

            let sql2 = ` delete from ${empresa}.parcelas
                                    where pedido = ${codigo}
                                `
            conn.query(sql2, (err:any, result:any) => {
                if (err) {
                   reject(err);
                } else {
                    resolve(result);
                }
            })
        })

    }

    async   buscaProdutosDoOrcamento(empresa:any, codigo: number) {
        return new Promise((resolve, reject) => {
            const sql = ` select *  from ${empresa}.produtos_pedido where pedido = ? `
            conn.query(sql, [codigo], async (err:any, result:any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
    async   buscaServicosDoOrcamento( empresa:any,codigo: number) {
        return new Promise((resolve, reject) => {
            const sql = ` select *  from ${empresa}.servicos_pedido where pedido = ? `
            conn.query(sql, [codigo], async (err:any, result:any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }
    async   buscaParcelasDoOrcamento(empresa:any,codigo: number) {
        return new Promise((resolve, reject) => {
            const sql = ` select *,  DATE_FORMAT(vencimento, '%Y-%m-%d') AS vencimento   from ${empresa}.parcelas where pedido = ? `
            conn.query(sql, [codigo], async (err:any, result:any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        })
    }

   
    async update(empresa:any,orcamento:any, codigoOrcamento:number ) {
      return new Promise ( async (resolve, reject )=>{
 
      
        let objUpdate = new UpdateOrcamento();
        let objInsert = new CreateOrcamento();
        function converterData(data: string): string {
            const [dia, mes, ano] = data.split('/');
            return `${ano}/${mes}/${dia}`;
        }

        function obterDataAtual() {
            const dataAtual = new Date();
            const dia = String(dataAtual.getDate()).padStart(2, '0');
            const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
            const ano = dataAtual.getFullYear();
            return `${ano}-${mes}-${dia}`;
        }


        function formatarData(data:any) {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            return `${ano}-${mes}-${dia}`;
        }
        

        function formatarDataHora(data:any) {
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            const hora = String(data.getHours()).padStart(2, '0');
            const minuto = String(data.getMinutes()).padStart(2, '0');
            const segundo = String(data.getSeconds()).padStart(2, '0');
            return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
        }
        

        const dataAtual = obterDataAtual();


        const servicos = orcamento.servicos;
        const parcelas = orcamento.parcelas;
        const produtos = orcamento.produtos;

        let statusAtualizacao: any;
        let statusDeletePro_orca: any;
        let statusDeletePar_orca: any;
      
            try {
                statusAtualizacao = await objUpdate.updateTabelaPedido(empresa,orcamento,codigoOrcamento );
            } catch (err) {
                reject(err)
                return;
            }
            const validaServicos:any = await objUpdate.buscaServicosDoOrcamento( empresa,codigoOrcamento )
              
            if( validaServicos.length > 0 ){
             
              try {
                  await  objUpdate.deleteServicosPedido( empresa,codigoOrcamento )
              } catch (e) {
                 reject(e);
                  return;
              }

              if (servicos.length > 0) {

                  try {
                      await objInsert.cadastraServicosDoPedido(   servicos,codigoOrcamento, empresa )
                  } catch (e) { 
                      reject(e);
                       return;
                  }

              }
            if (statusAtualizacao) {
                const validaProdutos:any = await objUpdate.buscaProdutosDoOrcamento( empresa,codigoOrcamento )
                if( validaProdutos.length > 0 ){
                    try {
                        statusDeletePro_orca = await objUpdate.deleteProdutosPedido(empresa,codigoOrcamento);
                    } catch (err) {
                        reject(err)
                         return;
                    }
                    
                    if (produtos.length > 0) {
                        if (statusDeletePro_orca) {
                            try {
                                await objInsert.cadastraProdutosDoPedido(produtos,empresa,codigoOrcamento);
                            } catch (err) {
                                 reject(err)
                                  return;
                            }
                        }
                    }
                }
           
            }

              const validaParcelas:any = await objUpdate.buscaParcelasDoOrcamento(empresa, codigoOrcamento )

                if( validaParcelas.length > 0 ){
                      //  if(statusAtualizacao ){
                            try{
                                statusDeletePar_orca = await objUpdate.deleteParcelasPedido(empresa,codigoOrcamento);
                                }catch(err){
                                    reject(err)
                                    return;
                                }   
                       //     } 

                        //if(statusDeletePar_orca){
                        try{
                            await objInsert.cadastraParcelasDoPedido (parcelas,empresa, codigoOrcamento );
                        }catch(err){
                             reject(err)
                              return;
                        }
                  //  } 
                    } 
                    resolve(codigoOrcamento)
        }else {
            
            resolve(codigoOrcamento)
        }
    })

    }


}