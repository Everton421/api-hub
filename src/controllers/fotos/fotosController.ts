import { Request, Response } from "express";
import { Select_fotos } from "../../models/fotos/select";
import { Delete_fotos } from "../../models/fotos/delete";
import { Insert_fotos } from "../../models/fotos/insert";

export class fotosController{

    async buscaGeral(req:Request ,res: Response){
           let empresa:any   = req.headers.cnpj 

           let select = new Select_fotos();
                 if(!req.headers.cnpj ){
                     return res.status(400).json({erro:true, msg:"É necessario informar a empresa "});   
                  } 
                  let headerCnpj:any  = empresa.replace(/\D/g, '');
                  let  dbName = `\`${headerCnpj}\``;

            try{
                    let resultado:any = await select.busca_geral(dbName);
                    if( resultado.length > 0 ){
                        return res.status(200).json(resultado)
                
                    }
        
             }catch(e){
                console.log("ocorreu um erro ao consultar as fotos dos produtos", e)
                return res.status(400).json({erro:true, msg:"ocorreu um erro ao consultar as fotos dos produtos"})
             }
    }

 
    async cadastrar_deletarFotos(req:Request ,res: Response){
        let empresa:any   = req.headers.cnpj 

        const select = new Select_fotos();
        const deletar  = new Delete_fotos();
        const insert = new Insert_fotos();

            if(!req.headers.cnpj ){
                  return res.status(400).json({erro:true, msg:"É necessario informar a empresa "});   
               } 
               let headerCnpj:any  = empresa.replace(/\D/g, '');
               let  dbName = `\`${headerCnpj}\``;


               if(!req.body.fotos) return res.status(400).json({erro:true, msg: "é necessario informar as fotos do produto"});
               if(!req.body.produto) return res.status(400).json({erro: true, msg:"é necessario informar o codigo do produto"});

               let dados  = req.body.fotos 
               let codigo_produto = req.body.produto

                 try{
                    let validItems:any = await select.buscaPorProduto(dbName,codigo_produto)
                    if(validItems.length > 0 ){
                        await deletar.delete(dbName,codigo_produto);
                    
                        for(let i of dados ){
                            await insert.cadastrar(dbName,i )
                        }
                      }else{
                        for(let i of dados ){
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
                let empresa:any   = req.headers.cnpj 
     
                let select = new Select_fotos();
                      if(!req.headers.cnpj ){
                          return res.status(400).json({erro:true, msg:"É necessario informar a empresa "});   
                       } 
                       let headerCnpj:any  = empresa.replace(/\D/g, '');
                       let  dbName = `\`${headerCnpj}\``;

                       let codigo = Number(req.params.codigo);

                 try{
                          let resultado:any = await select.buscaPorProduto( dbName, codigo );
                         if( resultado.length > 0 ){
                             return res.status(200).json(resultado)
                         } 
             
                  }catch(e){
                     console.log("ocorreu um erro ao consultar as fotos dos produtos", e)
                     return res.status(400).json({erro:true, msg:"ocorreu um erro ao consultar as fotos dos produtos"})
                  }
         }
     
}