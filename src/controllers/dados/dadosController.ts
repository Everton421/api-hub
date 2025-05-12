import { Request, Response } from "express";
import { DecodedToken } from "../../services/decodedToken/decodedToken";
import { dadosFic } from "./dados";
import { InsertProdutos } from "../../models/produtos/insert";
import { InsertServico } from "../../models/servicos/insert";
import { Insert_clientes } from "../../models/cliente/insert";
import { Insert_Categorias } from "../../models/categorias/insert";
import { Insert_Marcas } from "../../models/marcas/insert";
import { Insert_Veiculos } from "../../models/veiculo/insert";
import { Insert_formaPagamento } from "../../models/formas_pagamento/insert";
import { Insert_tipos_os } from "../../models/tipos_os/insert";
import { Insert_fotos } from "../../models/fotos/insert";
import { Select_fotos } from "../../models/fotos/select";
import { Delete_fotos } from "../../models/fotos/delete";


export class DadosController{

    async main (req:Request,res:Response){

           if(!req.headers.token ){
                       return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
                    } 
                    let decodToken= DecodedToken(String(req.headers.token))
                    let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
                
               let dbName  = `\`${empresa}\``;

               const insertProduto = new InsertProdutos();
               const insertServico = new InsertServico();
               const insertCliente = new Insert_clientes();
               const insertCategorias = new Insert_Categorias();
               const insertMarcas = new Insert_Marcas();
               const insertVeiculos = new Insert_Veiculos();
               const insertFormaPagamento = new Insert_formaPagamento();
               const insertTiposOs = new Insert_tipos_os();

               const selectFotos = new Select_fotos();
              const deletarFotos  = new Delete_fotos();
               const insertFotos = new Insert_fotos();

                    const dados = dadosFic();    
                    const msgs = []

                    for( const i of dados.produtos){
                       let result:any = await insertProduto.insert(dbName, i)
                       console.log(result) 
                       if( !result.insertId || result.insertId < 1){
                            
                            return res.status(400).json({erro:true, msg:"Erro ao tentar inserir os produtos de teste"});   
                        } else{
                            msgs.push({msg: "Produtos registrados com sucesso"})
                        }
                    }
                    for( const i of dados.servicos){
                       let result:any = await insertServico.insert(dbName, i)
                            if( !result.insertId || result.insertId < 1){
                           return res.status(400).json({erro:true, msg:"Erro ao tentar inserir os servicos de teste"});   
                        } else{
                            msgs.push({msg: "Servicos registrados com sucesso"})

                        }
                    }
                     for( const i of dados.clientes){
                       let result:any = await insertCliente.cadastrar(dbName, i)
                        if( !result.insertId || result.insertId < 1){
                           return res.status(400).json({erro:true, msg:"Erro ao tentar inserir os clientes de teste"});   
                        } else{
                            msgs.push({msg: "clientes registrados com sucesso"})

                        }
                    }
                    for( const i of dados.categorias){
                               let result:any = await insertCategorias.cadastrar(dbName, i)
                         if( !result.insertId || result.insertId < 1){
                                      return res.status(400).json({erro:true, msg:"Erro ao tentar inserir as categorias de teste"});   
                                   }else{
                                     msgs.push({msg: "categorias registradas com sucesso"})
                               } 
                                }
                    for( const i of dados.marcas){
                           let result:any = await insertMarcas.cadastrar(dbName, i)
                         if( !result.insertId || result.insertId < 1){
                                  return res.status(400).json({erro:true, msg:"Erro ao tentar inserir as marcas de teste"});   
                               } else{
                                     msgs.push({msg: "marcas registradas com sucesso"})
                               } 
                            }
                    for( const i of dados.veiculos){
                      let result:any = await insertVeiculos.cadastrar(dbName, i)
                         if( !result.insertId || result.insertId < 1){
                             return res.status(400).json({erro:true, msg:"Erro ao tentar inserir os veiculos de teste"});   
                          }  else{
                                     msgs.push({msg: "veiculos registrados com sucesso"})
                               } 
                       }
                    for( const i of dados.formasDePagamento){
                        let result:any = await  insertFormaPagamento.cadastrar(dbName, i)
                         if( !result.insertId || result.insertId < 1){
                                return res.status(400).json({erro:true, msg:"Erro ao tentar inserir as formas de pagamento de teste"});   
                            }  else{
                                     msgs.push({msg: "formas de pagamento registradas com sucesso"})
                               }
                        }
                    for( const i of dados.tiposOs){
                        let result:any = await  insertTiposOs.cadastrar(dbName, i)
                         if( !result.insertId || result.insertId < 1){
                                return res.status(400).json({erro:true, msg:"Erro ao tentar inserir os tipos de OS de teste"});   
                            }   else{
                                     msgs.push({msg: " tipos de OS  registradas com sucesso"})
                               }
                        } 

                   /* for( const i of dados.fotos){
                                    let validItems:any = await selectFotos.buscaPorProduto(dbName,i.produto)
                                    if(validItems.length > 0 ){
                                        await deletarFotos.delete(dbName,i.produto);
                                    } 
                        }
                        */ 
                            return res.status(200).json({msg:msgs})
    }
}