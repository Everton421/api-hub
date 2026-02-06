import { Request, Response } from "express";
import { SelectForma_pagamento } from "../../models/formas_pagamento/select";
import { Insert_formaPagamento } from "../../models/formas_pagamento/insert";
import { DateService } from "../../services/date-service/dateService";
import { update_formaPagamento } from "../../models/formas_pagamento/update";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { queryFpgt } from "../../types/formas_pagamento/type-formas-pagamento";
import { publishMessage } from "../../services/broker/publish-message";

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
                  if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    
     let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
      const source = String(req.headers.source) || 'api_internal'  ;
   
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
         const item ={
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
             }
               await publishMessage( empresa , 'formaspagamento.inserido', item, source )
           return res.status(200).json(item);
         }
      }catch(e){
         console.log(e)
         return res.status(400).json({erro:true, msg:" Ocorreu um erro ao tentar gravar Forma de pagamento"}); 
        
        }
      }


      async update(req:Request,res:Response){
 
        const update = new update_formaPagamento();
        const select = new SelectForma_pagamento();

        let dateService = new DateService(); 
        if(!req.headers.token ){
          return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
       } 
       let decodToken= DecodedToken(String(req.headers.token))
             if( !decodToken.payload?.cnpj ) return res.status(400).json({erro:true, msg:"Identifiador unico da empresa nao foi informado"});    
       const source = String(req.headers.source) || 'api_internal'  ;

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
       req.body.data_recadastro = dateService.obterDataHoraAtual();     
  
         try{ 
          let queryfpgt:Partial<queryFpgt>= {
             codigo:req.body.codigo,
             limit:1
          }

          const verifFpgt = await select.novaBusca(dbName,queryfpgt  )
            if( verifFpgt.length > 0 ){
            let aux:any = await update.update(dbName, req.body)

              if(aux.affectedRows > 0 ){
                const item =  {
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

                  }
               await publishMessage( empresa , 'formaspagamento.atualizado', item, source)

                return res.status(200).json(item);
              }
         }else{
           return res.status(400).json({erro:true, msg:` Não foi encontrada Forma de pagamento codigo: ${req.body.codigo} `}); 

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