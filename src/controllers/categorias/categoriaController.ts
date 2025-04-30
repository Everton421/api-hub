import { Request, response, Response } from "express";
import { Select_clientes } from "../../models/cliente/select";
import { Insert_clientes } from "../../models/cliente/insert";
import { Cliente } from "../../models/cliente/interface_cliente";  
import { Select_Categorias } from "../../models/categorias/select";
import { Insert_Categorias } from "../../models/categorias/insert";
import { DateService } from "../../services/dateService";
import { updateCategoria } from "../../models/categorias/update";
import { categoria } from "../../types/categoriaProduto/categoria";
import { DecodedToken } from "../../services/decodedToken/decodedToken";

export class CategoriaController{

     
 
    async findAll( req:Request,res:Response  ){
   
        let select = new Select_Categorias();
        let insert = new Insert_Categorias();
      if(!req.headers.token ){
              return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
           } 
           let decodToken= DecodedToken(String(req.headers.token))
           let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
 
         let  dbName = `\`${empresa}\``;
         let limit = 1000
         try{

                let resultado:any = await select.busca_geral(dbName, limit);
                if( resultado.length > 0 ){
                    return res.status(200).json(resultado)
                }else{
                return res.status(404).json({ erro: "Nenhuma categoria encontrada." });
                }

         }catch(e){
            console.log("ocorreu um erro ao consultar as categorias", e)
        return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as categorias"})

         }
       
    
    }

    async findByParam(req:Request,res:Response){
        
        let select = new Select_Categorias();
        let insert = new Insert_Categorias();

        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
         } 
         let decodToken= DecodedToken(String(req.headers.token))
         let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

          let  dbName = `\`${empresa}\``;
    
         let categorias;
        
         try{
            if( req.query   ){
                categorias =   await   select.novaBusca(dbName, req.query)
           }
             return res.status(200).json(categorias);
        }catch(e){ 
              console.error(e);
            return res.status(400).json({ erro:true, msg: "Erro ao buscar categorias." });
        }
    }
    

    async findByDescription(req:Request,res:Response){
 
        let select = new Select_Categorias();
        let insert = new Insert_Categorias();

        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
         } 
         let decodToken= DecodedToken(String(req.headers.token))
         let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

          let  dbName = `\`${empresa}\``;

         let descricao   = String(req.query.descricao) 
         let codigo:number = Number(req.query.codigo);
         let id:number = Number(req.query.id);
         let limit:number = Number(req.query.limit);
            
         if( !req.query.limit ){
            limit = 20
         }

         if(req.query.descricao){
            try{
                    let resultado:any = await select.findByDescription( dbName,descricao, limit  );
                        return res.status(200).json(resultado)
            }catch(e){
                console.log("ocorreu um erro ao consultar as categorias", e)
            return res.status(400).json({erro:true, msg:"ocorreu um erro ao consultar as categorias"})
            }
         }

         if(req.query.codigo  ){
            if( !isNaN(codigo) ){
                try{
                        let resultado:any = await select.buscaPorCodigo( dbName,codigo, limit  );
                        return res.status(200).json(resultado)
                }catch(e){
                        console.log("ocorreu um erro ao consultar as categorias", e)
                     return res.status(200).json({erro:true, msg:`ocorreu um erro ao consultar as categorias usando o codigo ${codigo}`})
                }
            }else{
                return res.status(400).json({erro:true, msg:"O valor correspondente ao codigo é invalido "})
            }
             
         } 

         if(req.query.id ){
            if( !isNaN(id)){
                try{
                    let resultado:any = await select.buscaPorId( dbName,id, limit  );
                        return res.status(200).json(resultado)
                }catch(e){
                    console.log("ocorreu um erro ao consultar as categorias", e)
                return res.status(400).json({erro:true, msg:`ocorreu um erro ao consultar as categoria usando o id: ${id}`})
                }
            }else{
                return res.status(400).json({erro:true, msg:"O valor correspondente ao id é invalido "})
            }
       }

       if( !codigo || ! id || !descricao){
                   try{
                    let resultado:any = await select.busca_geral( dbName, limit   );
                        return res.status(200).json(resultado)
                }catch(e){
                    console.log("ocorreu um erro ao consultar as categorias", e)
                  return res.status(400).json({erro:true, msg:`ocorreu um erro ao consultar as categoria usando o id: ${id}`})
                }

       }
                

     }

     async findByCode(req:Request,res:Response){
     
        let select = new Select_Categorias();
        let insert = new Insert_Categorias();
        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
         } 
         let decodToken= DecodedToken(String(req.headers.token))
         let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');


         if(!req.params.codigo ){
            return res.status(400).json({erro:true, msg:"É necessario informar o codigo da categoria "});   
         } 
 
         let codigo = Number(req.params.codigo)

         let  dbName = `\`${empresa}\``;
            let limit = Number(req.query.limit)
            if(!req.query.limit){
                limit = 1
            }
          try{
 
                 let resultado:any = await select.buscaPorCodigo( dbName,codigo , limit );
  
                     return res.status(200).json(resultado)
          
          }catch(e){
             console.log("ocorreu um erro ao consultar as categorias", e)
         return res.status(200).json({erro:true, msg:"ocorreu um erro ao consultar as categorias"})
          }

     }

     async insert(req:Request,res:Response){
    if(!req.headers.token ){
        return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
     } 
     let decodToken= DecodedToken(String(req.headers.token))
     let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

    let select = new Select_Categorias();
    let insert = new Insert_Categorias();
        let dateService = new DateService();

            let postCategoria:any = req.body; 
           
             let  dbName = `\`${empresa}\``;
          
            if(!postCategoria.id)  postCategoria.id =  "0";
            if(!postCategoria.atvo) postCategoria.ativo= 'S';
            if(!postCategoria.descricao)  return res.status(400).json( { erro:true, msg:`E necessario informar a descricao da categoria!`}) 
            if(!postCategoria.data_cadastro ) postCategoria.data_cadastro = dateService.obterDataAtual();
            if(!postCategoria.data_recadastro ) postCategoria.data_recadastro = dateService.obterDataHoraAtual();
 
              let validCategor:any = await select.busca_por_descricao( dbName, postCategoria.descricao )
    
        if( validCategor.length > 0  )  return  res.status(400).json({ erro:true, msg:`A categoria ${postCategoria.descricao} ja foi cadastrada!`})
           
             let responseCategoria:any;
                     try{    
                           responseCategoria = await insert.cadastrar(dbName, postCategoria)
                    
                         if( responseCategoria.insertId > 0 ){
                             return res.status(200).json({ 
                                  "codigo":responseCategoria.insertId,
                                  "descricao":postCategoria.descricao,
                                  "data_cadastro":postCategoria.data_cadastro,
                                  "data_recadastro":postCategoria.data_recadastro,
                                  "ativo": postCategoria.ativo
                                 })
                         }
                     }catch(e){
                             console.log(e);
                             return res.status(400).json({erro:"ocorreu um erro ao tentar registrar a categoria"})
                     }

       }
	
        
       async update(req:Request,res:Response){
         
        if(!req.headers.token ){
            return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
         } 
         let decodToken= DecodedToken(String(req.headers.token))
         let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');


        let select = new Select_Categorias();
        let insert = new Insert_Categorias();
         let dateService = new DateService();
        let update = new updateCategoria();
    
                let postCategoria:any = req.body; 
               
                 let  dbName = `\`${empresa}\``;
             
                 if(!postCategoria.codigo)  return res.status(400).json( { erro:true, msg:`E necessario informar o codigo da categoria!`}) 
               if(!postCategoria.atvo) postCategoria.ativo= 'S';
                 if(!postCategoria.id)  postCategoria.id =  "0";
                 if(!postCategoria.descricao)  return res.status(200).json( { erro:true, msg:`E necessario informar a descricao da categoria!`}) 
                 if(!postCategoria.data_cadastro ) postCategoria.data_cadastro = dateService.obterDataAtual();
                 if(!postCategoria.data_recadastro ) postCategoria.data_recadastro = dateService.obterDataHoraAtual();
     
                 let resultCategory:categoria[] = []
                    if( postCategoria.codigo > 0 ){
                          resultCategory = await select.buscaPorCodigo( dbName,postCategoria.codigo, 1);
                    }

                    if(resultCategory.length > 0 ){
                        
                            let responseCategoria:any;
                            try{    
                                responseCategoria = await update.update(dbName, postCategoria)
                        
                                if( responseCategoria.affectedRows > 0    ){
                                    console.log(responseCategoria)
                                    return res.status(200).json({ 
                                        "codigo":postCategoria.codigo,
                                        "descricao":postCategoria.descricao,
                                        "data_cadastro":postCategoria.data_cadastro,
                                        "data_recadastro":postCategoria.data_recadastro,
                                        "ativo":postCategoria.ativo
                                        })
                                }
                            }catch(e){
                                    console.log(e);
                                    return res.status(400).json({erro:true, msg:"ocorreu um erro ao tentar registrar a categoria"})
                            }
                    }else{
                return res.status(400).json( { erro:true, msg:`Não foi encontrada categoria com o codigo ${postCategoria.codigo}  `}) 

                    }
               
    
           }
        

        }

 
