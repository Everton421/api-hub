import { Request, Response } from "express";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { SelectLocais } from "../../models/locais/select";
import { DateService } from "../../services/date-service/dateService";
import { ILocal } from "../../types/locais/type-local";
import { InsertLocais,   } from "../../models/locais/insert";
import { UpdateLocais } from "../../models/locais/update";
import { publishMessage } from "../../services/broker/publish-message";


type query = {
            codigo:number,
            id:string,
            descricao:string,
            limit:number,
            ativo: 'S' | 'N'
}


export class LocaisController{

            async busca( req:Request, res:Response ){
                if(!req.headers.token ){
                return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
                }
                    let decodToken= DecodedToken(String(req.headers.token))
                            let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
                            let  dbName = `\`${empresa}\``;
                    const select = new SelectLocais();

                    let query:query |any  = req.query

                        try{
                            let result = await select.novaBusca(dbName, query)
                    return res.status(200).json(result)

                        }catch(e){
            console.log("ocorreu um erro ao consultar os locais", e)

            return res.status(400).json({erro:true, msg:"ocorreu um erro ao consultar os locais "})
                        }
                    
            }

            async insert(req:Request,res:Response){
         
                if(!req.headers.token ){
                    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
                 } 
                 let decodToken= DecodedToken(String(req.headers.token))
                  if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    

                 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
        
                const dateService = new DateService();
                 const select = new SelectLocais();
                 const insert = new InsertLocais();
            
                        let postLocal:ILocal = req.body; 
                    
                        let  dbName = `\`${empresa}\``;
                    
                         if(!postLocal.ativo) postLocal.ativo = 'S'; 
                    
                        if(!postLocal.id)  postLocal.id =  "0";
                        if(!postLocal.setor)  return res.status(400).json( { erro:true, msg:`E necessario informar um setor para registrar o local!`}) 
                        if(!postLocal.descricao)  return res.status(400).json( { erro:true, msg:`E necessario informar a descricao do local!`}) 
                        if(!postLocal.data_cadastro ) postLocal.data_cadastro = dateService.obterDataAtual();
                        if(!postLocal.data_recadastro ) postLocal.data_recadastro = dateService.obterDataHoraAtual();
            
                            let limit = 1;
        
                        let verifyLocal:any = await select.novaBusca( dbName, { setor: postLocal.setor, descricao:postLocal.descricao  }  )
                
                    if( verifyLocal.length > 0  )  return  res.status(400).json({ erro:true, msg:`A local ${postLocal.descricao} ja foi cadastrado no setor ${postLocal.setor}!`})
                    
                         
                                try{    
                                  let  resultInsertLocal = await insert.insert(dbName, postLocal)
                                
                                    if( resultInsertLocal.insertId > 0 ){

                                        const item = { 
                                            "codigo":resultInsertLocal.insertId,
                                            "descricao":postLocal.descricao,
                                            "setor": postLocal.setor,
                                            "data_cadastro":postLocal.data_cadastro,
                                            "data_recadastro":postLocal.data_recadastro,
                                            "ativo":postLocal.ativo,
                                            "id": postLocal.ativo
                                            }
                                                         await publishMessage( empresa , 'locais.inserido', item)
                                        
                                        return res.status(200).json(item)
                                    }
                                }catch(e){
                                        console.log(e);
                                        return res.status(400).json({erro:true, msg:"ocorreu um erro ao tentar registrar o local "})
                                }
        
            }

            async update(req:Request,res:Response){
                       if(!req.headers.token ){
                    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
                 } 
                 let decodToken= DecodedToken(String(req.headers.token))
                  if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    
                 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
        
                const dateService = new DateService();
                 const select = new SelectLocais();
                 const insert = new InsertLocais();
                 const update = new UpdateLocais();
                 
                 let postLocal:ILocal = req.body; 
                        
                        let  dbName = `\`${empresa}\``;

                    if( !req.body.codigo){
                        return res.status(400).json({erro:true, msg:"É necessario informar o codigo do local a ser atualizado !"});   
                    }
                     if( !req.body.setor){
                        return res.status(400).json({erro:true, msg:"É necessario informar o codigo do setor associado ao local a ser atualizado !"});   
                    }
                    
                    try{
                        let verifyLocal = await select.busca_por_codigo(dbName, req.body.codigo, 1 );
                        if( verifyLocal.length === 0 ){
                        return res.status(400).json({erro:true, msg:`Não foi encontrado local com o codigo ${req.body.codigo}`});   
                        }
                    }catch(e){ console.log(`Erro ao tentar buscar o local`, e)}

                    postLocal.data_recadastro = dateService.obterDataHoraAtual() 

                    try{
                        const item =  {  codigo: postLocal.codigo,setor:postLocal.setor , descricao: req.body.descricao };

                      let resultUpdateLocal = await update.updateByCondition(dbName, postLocal, item )  
                         if(resultUpdateLocal.affectedRows > 0 ){

                                  await publishMessage( empresa , 'locais.atualizado', item)

                            return res.status(200).json( { 'msg':`local atualizado com sucesso! ` })
                         } 
                    }catch(e){
                         console.log(`Erro ao tentar atualizar o local`, e) 
                         return res.status(400).json({erro:true, msg:`Erro ao tentar atualizar o local ${req.body.codigo}`});   
                        }

            }

}