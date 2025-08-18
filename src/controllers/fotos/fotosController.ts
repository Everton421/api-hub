import { Request, Response } from "express";
import { Select_fotos } from "../../models/fotos/select";
import { Delete_fotos } from "../../models/fotos/delete";
import { Insert_fotos } from "../../models/fotos/insert";
import { DecodedToken } from "../../services/decodedToken/decodedToken";
import { DateService } from "../../services/dateService";

export class fotosController{

    async findAll(req:Request ,res: Response){
        
           let select = new Select_fotos();
           if(!req.headers.token ){
                  return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
               } 
               let decodToken= DecodedToken(String(req.headers.token))
               let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
              
                  let  dbName = `\`${empresa}\``;
                  let data_recadastro:string ='';
                  if(req.query.data_recadastro){
                   data_recadastro = String(req.query.data_recadastro);
                  } 
            try{
                    let resultado:any = await select.busca_geral(dbName, data_recadastro);
                        return res.status(200).json(resultado)
                
        
             }catch(e){
                console.log("ocorreu um erro ao consultar as fotos dos produtos", e)
                return res.status(400).json({erro:true, msg:"ocorreu um erro ao consultar as fotos dos produtos"})
             }
    }

 
    async insertOrUpdateItens(req:Request ,res: Response){
      
        const select = new Select_fotos();
        const deletar  = new Delete_fotos();
        const insert = new Insert_fotos();
      const dateService = new DateService();

        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
         } 
         let decodToken= DecodedToken(String(req.headers.token))
         let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
   
               let  dbName = `\`${empresa}\``;
 
               if(!req.body.fotos) return res.status(400).json({erro:true, msg: "é necessario informar as fotos do produto"});
               if(!req.body.produto) return res.status(400).json({erro: true, msg:"é necessario informar o codigo do produto"});

               let dados  = req.body.fotos 
               let codigo_produto = req.body.produto

                 try{
                    let validItems:any = await select.buscaPorProduto(dbName,codigo_produto)
                    if(validItems.length > 0 ){
                       let resultDeleteItens =  await deletar.delete(dbName,codigo_produto);
                        if( resultDeleteItens.serverStatus > 0 ){
                           for(let i of dados ){
                              if( !i.data_cadastro || i.data_cadastro === null ){
                                 i.data_cadastro = dateService.obterDataAtual();
                              }
                              if( !i.data_recadastro || i.data_recadastro === null ){
                                 i.data_recadastro = dateService.obterDataAtual();
                              }
                              await insert.cadastrar(dbName,i )
                           }
                        }

                      }else{
                        for(let i of dados ){
                           if( !i.data_cadastro || i.data_cadastro === null ){
                              i.data_cadastro = dateService.obterDataAtual();
                           }
                            if( !i.data_recadastro || i.data_recadastro === null ){
                              i.data_recadastro = dateService.obterDataAtual();
                           }
                            await insert.cadastrar(dbName,i )
                        }
                      }
                      res.status(200).json(
                        {   ok:true,
                             msg: 'fotos alteradas com sucesso'

                        })
                 }catch(e){ 
                    console.log(e)
                    res.status(400).json({ erro:true, msg: 'erro ao registrar as fotos do produto', codigo_produto})
                 }
               
            }
 
            async buscafotosNext(req:Request ,res: Response){
         
                let select = new Select_fotos();
                if(!req.headers.token ){
                    return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
                 } 
                 let decodToken= DecodedToken(String(req.headers.token))
                 let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
           
                       let  dbName = `\`${empresa}\``;

                       if(!req.query.codigo) return res.status(400).json({erro:true, msg:"É necessario informar o codigo do produto "});
                       let codigo = Number(req.query.codigo);

                 try{
                          let resultado:any = await select.buscaPorProduto( dbName, codigo );
                             return res.status(200).json(resultado)
             
                  }catch(e){
                     console.log("ocorreu um erro ao consultar as fotos dos produtos", e)
                     return res.status(400).json({erro:true, msg:"ocorreu um erro ao consultar as fotos dos produtos"})
                  }
         }
     
}