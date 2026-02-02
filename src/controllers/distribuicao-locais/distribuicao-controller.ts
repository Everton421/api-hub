import { Request, Response } from "express";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { IDistribuicaoLocaisSetor } from "../../types/distribuicao_locais_setor/distribuicao_locais_setor";
import { SelectDistribuicaoSetor } from "../../models/distribuicao_locais_setor/select";
import { UpdateDistribuicaoSetor } from "../../models/distribuicao_locais_setor/update";
import { InsertDistribuicaoLocaisSetor } from "../../models/distribuicao_locais_setor/insert";
import { SelectSetor } from "../../models/setor/select";
import { SelectLocais } from "../../models/locais/select";
import { publishMessage } from "../../services/broker/publish-message";

export class DistribuicaoController{



         
    async update(req:Request, res:Response ){

        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
        } 
        let decodToken= DecodedToken(String(req.headers.token))
                  if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    
        let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
        let  dbName = `\`${empresa}\``;

        let select = new SelectDistribuicaoSetor();
        let update = new UpdateDistribuicaoSetor();
        let insert = new InsertDistribuicaoLocaisSetor();


      if(Array.isArray(req.body)   ){

            if(req.body.length > 0 ){
                let dados:IDistribuicaoLocaisSetor[] = req.body
                let  itensProcessados = []

                for(let i of dados){
                    if(!i.produto) return res.status(400).json({erro:true, msg:"É necessario informar o produto para registrar a distribuição nos setores"})
                    if(!i.setor) return res.status(400).json({erro:true, msg:"É necessario informar o setor para registrar a distribuição nos setores"})
                    if(!i.local) return res.status(400).json({erro:true, msg:"É necessario informar o local para registrar a distribuição nos setores"})
                    if(!i.quantidade) return res.status(400).json({erro:true, msg:"É necessario informar a quantidade para registrar a distribuição nos setores"})
                    if(!i.unidade_medida) i.unidade_medida = "UND";

                    let ArrValidDistrlocal:IDistribuicaoLocaisSetor[] = await select.selectByParamUpdate(dbName, { produto:Number(i.produto), local:Number(i.local),setor:Number(i.setor) })
                                    
                    let selectSetor = new SelectSetor();
                    let selectLocal = new SelectLocais();    
                     let verifySector = await selectSetor.findByDescription(dbName, { codigo:i.setor})
                    if(!verifySector || verifySector.length === 0 )  return res.status(400).json({ erro:true, msg:`O setor: ${i.setor} informado no produto:${i.produto} nao foi encontrado!`})
                      let verifyLocal = await selectLocal.novaBusca(dbName, { ativo:'S',codigo:i.local,setor:i.setor});
                    if(!verifyLocal || verifyLocal.length === 0 ) return res.status(400).json({ erro:true, msg:`O local: ${i.local} do setor ${i.setor} informado no produto:${i.produto} não foi encontrado ou esta inativo !`})


                        if(  ArrValidDistrlocal.length > 0 ){
                             for( let j of ArrValidDistrlocal){
                                if( new Date(i.data_recadastro) > new Date(j.data_recadastro)){
                                    /// update
                                    console.log("Atualizando distribuicao...")
                                     let resultUpdateDistribuicao = await update.updateDistribuicao(dbName, i);
                                     if(resultUpdateDistribuicao.affectedRows > 0 ) {
                                                   await publishMessage( empresa , 'distribuicaolocais.atualizado', i)
                                    
                                        itensProcessados.push({msg:`Distribuição do produto ${i.produto} atualizada no local ${i.local}  do setor ${i.setor} !`,produto: i.produto, local:i.local, setor:i.setor}) 
                                    }
                                    }else{
                                        console.log(`A distribuição do produto ${i.produto} se encontra atualizada no local ${i.local} no setor ${i.setor}!`)
                                        itensProcessados.push({msg:`A distribuição do produto ${i.produto} se encontra atualizada no local ${i.local} do setor ${i.setor} !` ,produto: i.produto, local:i.local, setor:i.setor}) 
                                   }
                             }
                        }else{
                            // inserir distribuição 
                           let result =  await insert.insert(dbName,i);
                              if(result.insertId > 0 ){

                                                   await publishMessage( empresa , 'distribuicaolocais.inserido', i)
                               
                                itensProcessados.push({produto: i.produto, local:i.local, setor:i.setor}) 
                                        itensProcessados.push({msg:`Distribuição do produto ${i.produto} registrada no local ${i.local} do setor ${i.setor}!`
                                     ,produto: i.produto, local:i.local, setor:i.setor}) 
                                        }
                        }
                }
                        return res.status(200).json({ok:true, distribuicao:itensProcessados})
            
            }

    }
                                          

    }



    async findAll(req:Request, res:Response){
        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
        } 
        let decodToken= DecodedToken(String(req.headers.token))
        let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
        let  dbName = `\`${empresa}\``;

        let select = new SelectDistribuicaoSetor();

           let data_recadastro:string ='';
        if(req.query.data){
            data_recadastro = String(req.query.data);
        }  

        try{
            let resultDistribuicao = await select.selectAll(dbName, {data_recadastro:data_recadastro })
            return res.status(200).json(resultDistribuicao)
        }catch(e){
            console.log("Ocorreu um erro ao tentar consultar as distribuições!",e)
            return res.status(400).json({erro:true, msg:"Ocorreu um erro ao tentar consultar as distribuições!"});   

        }



    }

    async findByParam(req:Request, res:Response){
            if(!req.headers.token ){
                return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
            } 
            let decodToken= DecodedToken(String(req.headers.token))
            let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
            let  dbName = `\`${empresa}\``;

            let select = new SelectDistribuicaoSetor();

            let query:Partial<IDistribuicaoLocaisSetor> = req.query;
 
            try{
                let resultDistribuicao = await select.selectByParamUpdate(dbName,   query)
                return res.status(200).json(resultDistribuicao)
            }catch(e){
                console.log("Ocorreu um erro ao tentar consultar as distribuições!",e)
                return res.status(400).json({erro:true, msg:"Ocorreu um erro ao tentar consultar as distribuições!"});   

            }

        }


}