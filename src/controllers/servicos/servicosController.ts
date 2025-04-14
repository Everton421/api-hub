import { Request, Response } from "express";
import { Select_servicos } from "../../models/servicos/select";
import { InsertServico } from "../../models/servicos/insert";
import { updateServico } from "../../models/servicos/update";
import { DateService } from "../../services/dateService";
type service = {
  codigo : number,
  id: number,
  valor : number,
  aplicacao : string,
  tipo_serv : number,
  data_cadastro :string,
  data_recadastro : string
}

export class ServicosController{


   
  async buscaGeral(req:Request,res:Response){
    let empresa   = req.headers.cnpj 
   let select = new Select_servicos();

     if(!empresa){
        return res.json(400).json({erro:"É necessario informar a empresa "});   
     } 
     
     let headerCnpj:any =   String(req.headers.cnpj) ;
       empresa  = headerCnpj.replace(/\D/g, '');

     let  dbName = `\`${empresa}\``;


      let servicos:any

        try{
            servicos =   await   select.buscaGeral(dbName  )
                
      if (servicos.length === 0) {
        return res.status(404).json({ erro: "Nenhum servico encontrado." });
      }
      return res.status(200).json(servicos);

        }catch(e){ 
              console.error(e);
            return res.status(500).json({ erro: "Erro ao buscar servico." });
        }
 
      }

  async buscaPorCodigo(req:Request,res:Response){
    let empresa   = req.headers.cnpj 
    let select = new Select_servicos();
    let codigo = Number(req.query.codigo);
 
      if(!empresa){
         return res.json(400).json({erro:"É necessario informar a empresa "});   
      } 
      if(!req.query.codigo){
        return res.json(400).json({erro:"É necessario informar o codigo do servico "});   
      }

      let headerCnpj:any =   String(req.headers.cnpj) ;
        empresa  = headerCnpj.replace(/\D/g, '');
 
      let  dbName = `\`${empresa}\``;
      
 
       let servicos:any
 
         try{
             servicos =   await   select.buscaPorCodigo(dbName, codigo )
                 
       if (servicos.length === 0) {
         return res.status(200).json({ msg: "Nenhum servico encontrado." });
       }
       return res.status(200).json(servicos);
 
         }catch(e){ 
               console.error(e);
             return res.status(500).json({ erro: "Erro ao buscar servico." });
         }
 
  }


  
  async cadastrar(req:Request,res:Response){
    let empresa   = req.headers.cnpj 
    if(!empresa){
      return res.json(400).json({erro:"É necessario informar a empresa "});   
   } 
   let  dbName = `\`${empresa}\``;
  
     let insert = new InsertServico();
     let dateService = new DateService();
  
 
          if(!req.body.tipo_serv)    req.body.tipo_serv = 0 
          if(!req.body.valor)    req.body.valor = 0 
          if(!req.body.ativo)    req.body.ativo = 'S' 

          if(!req.body.aplicacao)         return res.status(200).json({ erro:true, msg: "É necessario informar a descrição para registrar o servico!"});
         if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual(); 
         if(!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();

          let servico = {
          "valor" :req.body.valor,
          "aplicacao" :req.body.aplicacao,
          "tipo_serv" :req.body.tipo_serv,
          "data_cadastro" :req.body.data_cadastro,
          "data_recadastro" :req.body.data_recadastro,
          "ativo"                : req.body.ativo
            
        }

       try{
            let resultinsertId:any = await insert.insert(dbName, servico);
              return res.status(200).json(
                {
                "codigo"               : resultinsertId.insertId,
                "valor"                : req.body.valor,
                "aplicacao"            : req.body.aplicacao,
                "tipo_serv"            : req.body.tipo_serv,
                "data_cadastro"        : req.body.data_cadastro,
                "data_recadastro"      : req.body.data_recadastro,
                "ativo"                : req.body.ativo
                      
              })
          }catch(e){
            return res.status(200).json({ erro:true, msg: `Ocorreu um erro ao cadastrar o servico!`});
  
           }
   
  }



async buscaServicosNext(req:Request,res:Response){

  if(!req.headers.cnpj ){
    return res.status(400).json({erro:true, msg:"É necessario informar a empresa "});   
 } 
 let headerCnpj:any =   req.headers.cnpj ;
 let empresa  = headerCnpj.replace(/\D/g, '');

 let  dbName = `\`${empresa}\``;

  let select = new Select_servicos();
  let servico:service[] = [] ;

  const parametro = req.params.servico;
 
  try{
    servico =   await   select.buscaPorCodigoDescricao(dbName, parametro  )
     if (servico.length === 0) {
       return res.status(400).json({ erro:true, msg: "Nenhum servico encontrado." });
     }
     return res.status(200).json(servico);
}catch(e){ 
      console.error(e);
    return res.status(400).json({ erro:true, msg: "Erro ao buscar servicos." });
}
}
 async buscaServicos(req:Request,res:Response){
        let empresa:any   = req.headers.cnpj 
 
        let select = new Select_servicos();

        if(!req.headers.cnpj ){
            return res.status(400).json({erro:true, msg:"É necessario informar a empresa "});   
         } 
         
          let headerCnpj:any  = empresa.replace(/\D/g, '');
          let  dbName = `\`${headerCnpj}\``;
    
         let servicos;
        
         try{
            if( req.query   ){
                servicos =   await   select.novaBusca(dbName, req.query)
           }
             return res.status(200).json(servicos);
        }catch(e){ 
              console.error(e);
            return res.status(400).json({ erro:true, msg: "Erro ao buscar os serviços." });
        }
    }
    

async update(req:Request,res:Response){
  let empresa   = req.headers.cnpj 
  if(!empresa){
    return res.json(400).json({erro:"É necessario informar a empresa "});   
 } 
 let  dbName = `\`${empresa}\``;

   let update = new updateServico();
   let dateService = new DateService();



        if(!req.body.tipo_serv)    req.body.tipo_serv = 0 
        if(!req.body.id )  req.body.id = 0; 
        if(!req.body.valor)    req.body.valor = 0 
        if(!req.body.codigo)         return res.status(200).json({ erro:true, msg: "É necessario informar o codigo para atualizar o servico!"});
        if(!req.body.ativo) req.body.ativo = 'S';
        if(!req.body.aplicacao)         return res.status(200).json({ erro:true, msg: "É necessario informar a descrição para atualizar o servico!"});
        if (!req.body.data_cadastro) req.body.data_cadastro = dateService.obterDataAtual(); 
        if(!req.body.data_recadastro) req.body.data_recadastro = dateService.obterDataHoraAtual();

        let servico = {
        "codigo": req.body.codigo,
        "id": req.body.id,   
        "valor" :req.body.valor,
        "aplicacao" :req.body.aplicacao,
        "tipo_serv" :req.body.tipo_serv,
        "data_cadastro" :req.body.data_cadastro,
        "data_recadastro" :req.body.data_recadastro,
        "ativo":req.body.ativo
        }

     try{
          let resultinsertId:any = await update.update(dbName, servico);
            return res.status(200).json(
              {
               "codigo": req.body.codigo,
              "id": req.body.id,   
              "valor"                : req.body.valor,
              "aplicacao"            : req.body.aplicacao,
              "tipo_serv"            : req.body.tipo_serv,
              "data_cadastro"        : req.body.data_cadastro,
              "data_recadastro"      : req.body.data_recadastro,
              "ativo"                :  req.body.ativo
            })
        }catch(e){
          return res.status(200).json({ erro:true, msg: `Ocorreu um erro ao atualizar o servico!`});

         }

 
}



}