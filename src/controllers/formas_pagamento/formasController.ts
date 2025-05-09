import { Request, Response } from "express";
import { SelectForma_pagamento } from "../../models/formas_pagamento/select";
import { Insert_formaPagamento } from "../../models/formas_pagamento/insert";
import { DateService } from "../../services/dateService";
import { update_formaPagamento } from "../../models/formas_pagamento/update";
import { DecodedToken } from "../../services/decodedToken/decodedToken";

export class FormasController{
 

    async findAll(req:Request,res:Response){
       let select = new  SelectForma_pagamento();
  
         if(!req.headers.token ){
               return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
            } 
            let decodToken= DecodedToken(String(req.headers.token))
            let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
        
       let dbName  = `\`${empresa}\``;

       let data_recadastro:string ='';
       if(req.query.data_recadastro){
        data_recadastro = String(req.query.data_recadastro);
       }  

        let fpgt:any;  
          try{
            fpgt =   await   select.buscaGeral(dbName ,data_recadastro )
        return res.status(200).json(fpgt);
  
          }catch(e){ 
                console.error(e);
              return res.status(500).json({ erro: "Erro ao buscar formas de pagamento." });
          }
    }

    async insert(req:Request,res:Response){
    
      let insert = new Insert_formaPagamento();
      let dateService = new DateService();

      if(!req.headers.token ){
        return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
     } 
     let decodToken= DecodedToken(String(req.headers.token))
     let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
   
       let dbName  = `\`${empresa}\``;
       
       if(!req.body.id) req.body.id = 0; 
       if(!req.body.ativo) req.body.ativo = 'S'; 

       if(!req.body.descricao)  return res.status(400).json({erro:true, msg:"É necessario informar a descrição para gravar "});  
       if(!req.body.desc_maximo) req.body.desc_maximo = 0;  
       if(!req.body.parcelas) return res.status(400).json({erro:true, msg:"É necessario informar a quantidade de parcelas para gravar"});  
       if(!req.body.intervalo) req.body.intervalo = 0;  
       if(!req.body.recebimento) req.body.recebimento = 0;   
       if(!req.body.data_cadastro) req.body.data_cadastro =  dateService.obterDataAtual(); 
         req.body.data_recadastro = dateService.obterDataHoraAtual();         
      
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
               data_recadastro: req.body.data_recadastro,
               ativo: req.body.ativo
             });
         }
      }catch(e){
         console.log(e)
         return res.status(400).json({erro:true, msg:" Ocorreu um erro ao tentar gravar Forma de pagamento"}); 
        
        }
      }


      async update(req:Request,res:Response){
 
        let update = new update_formaPagamento();
        let dateService = new DateService(); 
        if(!req.headers.token ){
          return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
       } 
       let decodToken= DecodedToken(String(req.headers.token))
       let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
         let dbName  = `\`${empresa}\``;

         if(!req.body.codigo)  return res.status(400).json({erro:true, msg:"É necessario informar o codigo da forma de pagamento "});  
         if(!req.body.ativo) req.body.ativo = 'S'; 
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
                  data_recadastro: req.body.data_recadastro,
                  ativo: req.body.ativo

                });
            }
        }catch(e){
           console.log(e)
           return res.status(400).json({erro:true, msg:" Ocorreu um erro ao tentar atualizar Forma de pagamento"}); 
          
          }
      }
  
      async findByParam(req:Request,res:Response){
        if(!req.headers.token ){
          return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
       } 
       let decodToken= DecodedToken(String(req.headers.token))
       let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
 
         let dbName  = `\`${empresa}\``;

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