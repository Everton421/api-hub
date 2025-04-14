import { Request, Response } from "express";
import { SelectForma_pagamento } from "../../models/formas_pagamento/select";
import { SelectTipo_os } from "../../models/tipos_os/select";
import { DateService } from "../../services/dateService";
import { Insert_tipos_os } from "../../models/tipos_os/insert";
import { Update_tipo_os } from "../../models/tipos_os/update";
import { tipo_os } from "../../types/tipo_os/tipo_os";

export class TipoOsController{
 

    async buscaGeral(req:Request,res:Response){
      let empresa   = req.headers.cnpj 
      let select = new  SelectTipo_os();
  
       if(!empresa){
          return res.json(400).json({erro:"É necessario informar a empresa "});   
       } 


       let headerCnpj:any =   String(req.headers.cnpj) ;
       empresa  = headerCnpj.replace(/\D/g, '');

        let  dbName = `\`${empresa}\``;
        let tipoOS:any;  
  
          try{
            tipoOS =   await   select.buscaGeral(dbName  )
                  
        if (tipoOS.length === 0) {
          return res.status(404).json({ erro: "Nenhum tipo de os encontrado." });
        }
        return res.status(200).json(tipoOS);
  
          }catch(e){ 
                console.error(e);
              return res.status(500).json({ erro: "Erro ao buscar  tipos de os pagamento." });
          }
    }
  

    async buscaTiposDeOs(req:Request,res:Response){
      let empresa   = req.headers.cnpj 

       if(!empresa){
          return res.json(400).json({erro:true, msg:"É necessario informar a empresa "});   
       } 
  
       let headerCnpj:any =   String(req.headers.cnpj) ;

       let cnpjF = headerCnpj.replace(/\D/g, '');
       let dbName  = `\`${cnpjF}\``;

        let select = new SelectTipo_os();

       let tiposDeOs;
       try{
        if( req.query   ){
          tiposDeOs =   await   select.novaBusca(dbName, req.query)
       }
         return res.status(200).json(tiposDeOs);
    }catch(e){ 
          console.error(e);
        return res.status(400).json({ erro:true, msg: "Erro ao buscar tipo de OS." });
    }
    }
  
      
      async cadastrar(req:Request,res:Response){
        let empresa   = req.headers.cnpj 
        if(!empresa){
          return res.json(400).json({erro:"É necessario informar a empresa "});   
       } 
       let  dbName = `\`${empresa}\``;
      
         let insert = new Insert_tipos_os();
         let dateService = new DateService();
      
            if(!req.body.id) req.body.id = 0;
              if(!req.body.descricao)         return res.status(400).json({ erro:true, msg: "É necessario informar a descrição para registrar o tipo de OS!"});
             if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual(); 
             if(!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();
    
            
           try{
                let resultinsertId:any = await insert.cadastrar(dbName, req.body);
                  return res.status(200).json(
                    {
                    "codigo"               : resultinsertId.insertId,
                    "descricao"            : req.body.descricao,
                    "data_cadastro"        : req.body.data_cadastro,
                    "data_recadastro"      : req.body.data_recadastro,
                          
                  })
                  
              }catch(e){
                return res.status(200).json({ erro:true, msg: `Ocorreu um erro ao cadastrar tipo de OS !`});
      
               }
       
      }

      async atualizar(req:Request,res:Response){
        let cnpj:any   = req.headers.cnpj 

             let select = new SelectTipo_os();
                        let dateService = new DateService();
                       let update = new Update_tipo_os();
                                
                       let  empresa = `\`${cnpj}\``;
                                if(!req.body.codigo){
                                  return res.status(400).json( { erro:true, msg:`E necessario informar o codigo do tipo de OS!`})
                                }else{
                                  req.body.codigo = Number(req.body.codigo)
                                } 
                                if(!req.body.id)  req.body.id =  "0";
                                if(!req.body.descricao)  return res.status(400).json( { erro:true, msg:`E necessario informar a descricao do tipo de OS!`}) 
                                if(!req.body.data_cadastro ) req.body.data_cadastro = dateService.obterDataAtual();
                                if(!req.body.data_recadastro ) req.body.data_recadastro = dateService.obterDataHoraAtual();
                    
                    let resultTipo_os:tipo_os[] = []
                    
                    if(Number(req.body.codigo) > 0 ){
                      resultTipo_os = await select.buscaPorCodigo( empresa, req.body.codigo);
                  } 
                  if( resultTipo_os.length > 0 ){
                      let result:any = await update.update(empresa, req.body);
                      console.log(result)
                    
                      if(result.affectedRows > 0  ){
                        return res.status(200).json(
                          {
                            "codigo": req.body.codigo,
                            "id": req.body.id,
                            "descricao": req.body.descricao,
                            "data_cadastro": req.body.data_cadastro,
                            "data_recadastro": req.body.data_recadastro
                          }
                         )
                    }else{
                      return res.status(400).json( { erro:true, msg:`Ocoreru um erro ao atualizar tipo de OS!`})

                    }
                  }
    
        
      }
    
}  