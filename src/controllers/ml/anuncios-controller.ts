import { Request, Response } from "express";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { SelectUsersMlIntegrations } from "../../models/users-ml-integration/select-users-ml-integration";
import { PostMlItemsService, PublishItem } from "../../services/ml-services/post-itens-ml";
 
import { queryAnuncio, SelectAnuncios } from "../../models/anuncios/select";
import { SelectAtributosAnuncios } from "../../models/atributos-anuncios/select";
import {    typeAtributosAnuncios } from "../../types/atributos-anuncios/type-atributos-anuncios";
import { typeAnuncios } from "../../types/anuncios/type-anuncio";
import { UpdateAnuncios } from "../../models/anuncios/update";
import { DeleteAnuncios } from "../../models/anuncios/delete";
import { DeleteAtributosAnuncios } from "../../models/atributos-anuncios/delete";

export class AnunciosController{
    
    async post(req: Request, res:Response ){

        try{
                const mlService = new PostMlItemsService();
                const selectUsersMl = new SelectUsersMlIntegrations();
            
            const { title, price, category_id,   ml_user_id, codigo_produto   } = req.body 
            const decoded = DecodedToken(String(req.headers.token));

            if(!ml_user_id ) return res.status(400).json({ msg: "identificador ml_user_id nao fornecido." });

            if(!codigo_produto ) return res.status(400).json({ msg: "identificador codigo_produto nao fornecido." });

            if(!title || !price || !category_id ) return res.status(400).json({ msg: "Campos obrigatórios: title, price, category_id." });
             
            if (decoded.erro || !decoded.payload) return res.status(401).json({ msg: "Token inválido" });
            
                 const userCnpj = decoded.payload.cnpj;
                 const systemUserCode = decoded.payload.codigo;

                const integracoes = await selectUsersMl.findBySystemUserCodeAndCnpj(systemUserCode,ml_user_id, userCnpj);

                if (!integracoes || integracoes.length === 0)  return res.status(400).json({ msg: "Usuário não possui conta ML vinculada." });
                 
                const mlUserId = integracoes[0].ml_user_id;
                const integrationId = integracoes[0].id

                const itemData: PublishItem = {
                    title: req.body.title,
                    price: Number(req.body.price),
                    quantity: Number(req.body.available_quantity), 
                    category_id: req.body.category_id,
                    listing_type_id: req.body.listing_type_id || "gold_special",
                    condition: req.body.condition || "new",
                    description: req.body.description,
                    pictures: req.body.pictures || [], 
                    brand: req.body.brand,  
                    model: req.body.model,   
                    attributes: req.body.attributes || [],
                    thumbnail: req.body.thumbnail
                };

                 const result = await mlService.publishItem(userCnpj, systemUserCode, mlUserId, codigo_produto,integrationId ,itemData);
                 return res.status(201).json(result);
                
        }catch(e){
            return res.status(500).json({ sucess:false, message:`${e} `})
        }   
    }
 
    async getAnuncios(req:Request, res:Response){
        
        const selectAnuncios = new SelectAnuncios();
        const selectAtributosAnuncios = new SelectAtributosAnuncios();

        if(!req.headers.token ){
               return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
          } 
            let decodToken= DecodedToken(String(req.headers.token))
            let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
    
         let  dbName = `\`${empresa}\``;

         let anuncios:typeAnuncios[] = []
         let limit 
         
         if(req.query.limit){
             limit  = Number(req.query.limit)
          }

           let data
           if( req.query.data_recadastro)    {
                data = String(req.query.data_recadastro) ;
 
             const auxData = new Date(data).getTime();
                    if( isNaN(auxData)){
                        return res.status(400).json({ erro:true, message:"Formato data_recadastro invalido."})
                    }
    
           }
 
       const atributes = []
          let anunciosCompleto:any = []  ;
         try{
 
            anuncios = await selectAnuncios.findAll(dbName, data);
 
            if(anuncios.length > 0 ){
                  anunciosCompleto = await Promise.all( anuncios.map( async ( i )=>{
                        let atributos:typeAtributosAnuncios[] = []
                    try{
                          atributos = await selectAtributosAnuncios.buscaPorIdAnuncio(dbName, i.id);
                    }catch(e){

                    }
                    return { 
                        ...i,
                        atributos
                    }
                }))
              
                    }
                   
             return res.status(200).json(anunciosCompleto);
         }catch(e){
            console.log('erro ao tentar consultar os anuncios ', e );
            return res.status(500).json({ sucess:false, message: 'erro ao tentar consultar os anuncios'});
         } 
    }

    async getAnunciosByParams(req:Request, res:Response){
    
           
        const selectAnuncios = new SelectAnuncios();
        const selectAtributosAnuncios = new SelectAtributosAnuncios();

        if(!req.headers.token ){
               return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
          } 
            let decodToken= DecodedToken(String(req.headers.token))
            let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
    
         let  dbName = `\`${empresa}\``;

         let anuncios:typeAnuncios[] = []
         let limit 
         
         if(req.query.limit){
             limit  = Number(req.query.limit)
          }

           let data
           if( req.query.data_recadastro)    {
                data = String(req.query.data_recadastro) ;
 
             const auxData = new Date(data).getTime();
                    if( isNaN(auxData)){
                        return res.status(400).json({ erro:true, message:"Formato data_recadastro invalido."})
                    }
    
           }
           
           const query = req.query as queryAnuncio

            if(!query.ativo){
                query.ativo = 'S'
            } 

            

       const atributes = []
          let anunciosCompleto:any = []  ;
         try{
 
            anuncios = await selectAnuncios.findByParams(dbName, query);
 
            if(anuncios.length > 0 ){
                  anunciosCompleto = await Promise.all( anuncios.map( async ( i )=>{
                        let atributos:typeAtributosAnuncios[] = []
                    try{
                          atributos = await selectAtributosAnuncios.buscaPorIdAnuncio(dbName, i.id);
                    }catch(e){

                    }
                    return { 
                        ...i,
                        atributos
                    }
                }))
              
                    }
                   
             return res.status(200).json(anunciosCompleto);
         }catch(e){
            console.log('erro ao tentar consultar os anuncios ', e );
            return res.status(500).json({ sucess:false, message: 'erro ao tentar consultar os anuncios'});
         } 
    
    }

 

   async getAnuncioById(req:Request, res:Response){
        
        const selectAnuncios = new SelectAnuncios();
        const selectAtributosAnuncios = new SelectAtributosAnuncios();

        if(!req.headers.token ){
               return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
          } 
            let decodToken= DecodedToken(String(req.headers.token))
            let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
    
         let  dbName = `\`${empresa}\``;

         let anuncios:typeAnuncios[] = []
        
            let id:number ;
           if( req.params.id)    {
                    id = Number(req.params.id) 
           }else{
             return res.status(400).json({ erro:true, msg: "É necessario informar o id do anúncio."});
           }
 
       const atributes = []
          let anunciosCompleto:any = []  ;
         try{
 
            anuncios = await selectAnuncios.findById(dbName, id);
 
            if(anuncios.length > 0 ){
                  anunciosCompleto = await Promise.all( anuncios.map( async ( i )=>{
                        let atributos:typeAtributosAnuncios[] = []
                    try{
                          atributos = await selectAtributosAnuncios.buscaPorIdAnuncio(dbName, i.id);
                    }catch(e){

                    }
                    return { 
                        ...i,
                        atributos
                    }
                }))
                    }
                   
             return res.status(200).json(anunciosCompleto);
         }catch(e){
            console.log(`erro ao tentar consultar os anuncio ${id} `, e );
            return res.status(500).json({ sucess:false, message: 'erro ao tentar consultar os anuncios'});
         }
 

    }

    async update(req:Request, res:Response){

        if(!req.headers.token ){
               return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
          } 
            let decodToken= DecodedToken(String(req.headers.token))
            let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
    
         let  dbName = `\`${empresa}\``;
          const updateAnuncios = new UpdateAnuncios();

              let id:number ;
           if( req.params.id)    {
                    id = Number(req.params.id) 
           }else{
             return res.status(400).json({ erro:true, msg: "É necessario informar o id do anúncio."});
           }

 
       
            if(!req.body.integration_id ) return res.status(400).json({ erro:true, msg: "É necessario informar a integration_id do anúncio."});
            if(!req.body.plataforma)  return res.status(400).json({ erro:true, msg: "É necessario informar o nome da plataforma do anúncio."});
            if(!req.body.estoque) return res.status(400).json({ erro:true, msg: "É necessario informar o estoque do anúncio."});
            if(!req.body.preco) return res.status(400).json({ erro:true, msg: "É necessario informar o preco do anúncio."});
            if(!req.body.unidade_medida) return res.status(400).json({ erro:true, msg: "É necessario informar a unidade_medida do anúncio."});
            if(!req.body.descricao) return res.status(400).json({ erro:true, msg: "É necessario informar a descricao do anúncio."});
            if(!req.body.titulo) return res.status(400).json({ erro:true, msg: "É necessario informar o titulo do anúncio."});
            if(!req.body.num_fabricante)   return res.status(400).json({ erro:true, msg: "É necessario informar o num_fabricante/ean do anúncio."});
            if(!req.body.ativo) return res.status(400).json({ erro:true, msg: "É necessario informar se o do anúncio esta ativo."});
            if(!req.body.sku_externo) req.body.sku_externo ='';
            if(!req.body.id_externo) req.body.id_externo ='';
            if(!req.body.link) return res.status(400).json({ erro:true, msg: "É necessario informar o link do anúncio."});
            if(!req.body.thumbnail)  return res.status(400).json({ erro:true, msg: "É necessario informar o a thumbnail do anúncio."}); 
           try{

            let resultUpdate = await updateAnuncios.update(dbName,req.body, id)
                if(resultUpdate && resultUpdate.affectedRows > 0 ){
                    return res.status(200).json(req.body);
                }

           }catch(e){   
                    return res.status(500).json({ erro:true, msg:"erro interno no servidor."});
       
           }    


    }

    async delete( req:Request, res:Response ) {
             if(!req.headers.token ){
               return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
          } 
            let decodToken= DecodedToken(String(req.headers.token))
            let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
    
         let  dbName = `\`${empresa}\``;
          const deleteAnuncios = new DeleteAnuncios();
          const deleteAtributosAnuncios = new DeleteAtributosAnuncios();
          const selectAnuncios = new SelectAnuncios(); 
              let id:number ;
           if( req.params.id)    {
                    id = Number(req.params.id) 
           }else{
             return res.status(400).json({ erro:true, msg: "É necessario informar o id do anúncio."});
           }


            const validaExisAnuncio = await selectAnuncios.findById(dbName, id );
            if(validaExisAnuncio.length === 0 ){
                return res.status(400).json({ erro:true, msg: "O anúncio informado não existe."});
            }

           try{
            const resultDeleteAnuncio  = await deleteAnuncios.delete(dbName, id);
            const resultDeleteAtributos = await deleteAtributosAnuncios.delete(dbName,  id)
            if(resultDeleteAnuncio.affectedRows > 0 && resultDeleteAtributos.affectedRows > 0 ){
                res.status(200).json({ ok:true, msg:"Anúncio deletado com sucesso."})
            }

           }catch(e){
                    return res.status(500).json({ erro:true, msg:"erro interno no servidor."});

           }


    }

}