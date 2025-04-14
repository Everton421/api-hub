import { Request, Response } from "express";
import { SelectForma_pagamento } from "../../models/formas_pagamento/select";
import { Insert_formaPagamento } from "../../models/formas_pagamento/insert";
import { DateService } from "../../services/dateService";
import { update_formaPagamento } from "../../models/formas_pagamento/update";

export class FormasController{
 

    async buscaGeral(req:Request,res:Response){
      let empresa   = req.headers.cnpj 
      let select = new  SelectForma_pagamento();
  
       if(!empresa){
          return res.json(200).json({erro:"É necessario informar a empresa "});   
       } 
       let headerCnpj:any =   String(req.headers.cnpj) ;
       let cnpjF = headerCnpj.replace(/\D/g, '');
       let dbName  = `\`${cnpjF}\``;

        let fpgt:any;  
          try{
            fpgt =   await   select.buscaGeral(dbName  )
          if (fpgt.length === 0) {
            return res.status(404).json({ erro: "Nenhuma forma de pagamento encontrada." });
          }
        return res.status(200).json(fpgt);
  
          }catch(e){ 
                console.error(e);
              return res.status(500).json({ erro: "Erro ao buscar formas de pagamento." });
          }
    }

    async cadastrar(req:Request,res:Response){
      let empresa   = req.headers.cnpj 
      let select = new  SelectForma_pagamento();
      let insert = new Insert_formaPagamento();
      let obj = new FormasController()
      let dateService = new DateService();

       if(!empresa){
          return res.json(400).json({erro:true, msg:"É necessario informar a empresa "});   
       } 
  
       let headerCnpj:any =   String(req.headers.cnpj) ;

       let cnpjF = headerCnpj.replace(/\D/g, '');
       let dbName  = `\`${cnpjF}\``;
       
       if(!req.body.id) req.body.id = 0; 
       if(!req.body.descricao)  return res.status(400).json({erro:true, msg:"É necessario informar a descrição para gravar "});  
       if(!req.body.desc_maximo) req.body.desc_maximo = 0;  
       if(!req.body.parcelas) return res.status(400).json({erro:true, msg:"É necessario informar a quantidade de parcelas para gravar"});  
       if(!req.body.intervalo) req.body.intervalo = 0;  
       if(!req.body.recebimento) req.body.recebimento = 0;   
       if(!req.body.data_cadastro) req.body.data_cadastro =  dateService.obterDataAtual(); 
       if(!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();         
      
    try{
        let aux:any = await insert.cadastrar(dbName, req.body)
         if(aux.insertId > 0 ){
           req.body.codigo = aux.insertId 
          
           return res.status(200).json({ 
               codigo:   req.body.codigo,
               id: req.body.id,
               descricao: req.body.descricao,
               desc_maximo: req.body.desc_maximo,
               parcelas: req.body.parcelas,
               intervalo: req.body.intervalo,
               recebimento: req.body.recebimento,
               data_cadastro: req.body.data_cadastro,
               data_recadastro: req.body.data_recadastro
             });
         }
      }catch(e){
         console.log(e)
         return res.status(400).json({erro:true, msg:" Ocorreu um erro ao tentar gravar Forma de pagamento"}); 
        
        }
      }


      async atualizar(req:Request,res:Response){
        let empresa   = req.headers.cnpj 
        let update = new update_formaPagamento();
        let dateService = new DateService();
  
         if(!empresa){
            return res.json(400).json({erro:true, msg:"É necessario informar a empresa "});   
         } 
    
         let headerCnpj:any =   String(req.headers.cnpj) ;
  
         let cnpjF = headerCnpj.replace(/\D/g, '');
         let dbName  = `\`${cnpjF}\``;
         if(!req.body.codigo)  return res.status(400).json({erro:true, msg:"É necessario informar o codigo da forma de pagamento "});  
         
         if(!req.body.id) req.body.id = 0; 
         if(!req.body.descricao)  return res.status(400).json({erro:true, msg:"É necessario informar a descrição para gravar "});  
         if(!req.body.desc_maximo) req.body.desc_maximo = 0;  
         if(!req.body.parcelas) return res.status(400).json({erro:true, msg:"É necessario informar a quantidade de parcelas para gravar"});  
         if(!req.body.intervalo) req.body.intervalo = 0;  
         if(!req.body.recebimento) req.body.recebimento = 0;   
         if(!req.body.data_cadastro) req.body.data_cadastro =  dateService.obterDataAtual(); 
         if(!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();     
  
         try{
          let aux:any = await update.update(dbName, req.body)

            if(aux.affectedRows > 0 ){
             
              return res.status(200).json({ 
                  codigo:   req.body.codigo,
                  id: req.body.id,
                  descricao: req.body.descricao,
                  desc_maximo: req.body.desc_maximo,
                  parcelas: req.body.parcelas,
                  intervalo: req.body.intervalo,
                  recebimento: req.body.recebimento,
                  data_cadastro: req.body.data_cadastro,
                  data_recadastro: req.body.data_recadastro
                });
            }
        }catch(e){
           console.log(e)
           return res.status(400).json({erro:true, msg:" Ocorreu um erro ao tentar atualizar Forma de pagamento"}); 
          
          }
      }
  
      async buscaFormaPagamento(req:Request,res:Response){
        let empresa   = req.headers.cnpj 
  
         if(!empresa){
            return res.json(400).json({erro:true, msg:"É necessario informar a empresa "});   
         } 
    
         let headerCnpj:any =   String(req.headers.cnpj) ;
  
         let cnpjF = headerCnpj.replace(/\D/g, '');
         let dbName  = `\`${cnpjF}\``;

          let select = new SelectForma_pagamento();

         let formasPagamento;
         try{
          if( req.query   ){
            formasPagamento =   await   select.novaBusca(dbName, req.query)
         }
           return res.status(200).json(formasPagamento);
      }catch(e){ 
            console.error(e);
          return res.status(400).json({ erro:true, msg: "Erro ao buscar formas de Pagamento." });
      }
      }
}  