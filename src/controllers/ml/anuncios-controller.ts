import { Request, Response } from "express";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { SelectUsersMlIntegrations } from "../../models/users-ml-integration/select-users-ml-integration";
import { PostMlItemsService, PublishItem } from "../../services/ml-services/post-itens-ml";
import { typeAnuncios } from "../../types/anuncios/type-anuncio";
import { SelectAnuncios } from "../../models/anuncios/select";
import { SelectAtributosAnuncios } from "../../models/atributos-anuncios/select";

export class AnunciosController{
    
    async post(req: Request, res:Response ){

        try{
            
            const { title, price, category_id,   ml_user_id, codigo_produto   } = req.body 
            if(!ml_user_id ) return res.status(400).json({ msg: "identificador ml_user_id nao fornecido." });

            if(!codigo_produto ) return res.status(400).json({ msg: "identificador codigo_produto nao fornecido." });

            if(!title || !price || !category_id ){
                    return res.status(400).json({ msg: "Campos obrigatórios: title, price, category_id." });
            }
            const decoded = DecodedToken(String(req.headers.token));
            if (decoded.erro || !decoded.payload) return res.status(401).json({ msg: "Token inválido" });
            
                 const userCnpj = decoded.payload.cnpj;
                 const systemUserCode = decoded.payload.codigo;

                const selectUsersMl = new SelectUsersMlIntegrations();
                const integracoes = await selectUsersMl.findBySystemUserCodeAndCnpj(systemUserCode,ml_user_id, userCnpj);
                if (!integracoes || integracoes.length === 0) {
                    return res.status(400).json({ msg: "Usuário não possui conta ML vinculada." });
                }
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
                     attributes: req.body.attributes || []
                };

                const mlService = new PostMlItemsService();
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

       //   let data
       //   if( req.query.data_recadastro)    {
       //     const  data = req.query.data_recadastro;
//
       //     const auxData = new Date(data);
//
//
       //   }

       const atributes = []

         try{

            anuncios = await selectAnuncios.busca_geral(dbName  );

            if(anuncios.length > 0 ){
                    atributes.push(
                        anuncios.map( async ( i)=>{
                          await selectAtributosAnuncios.buscaPorIdAnuncio(dbName,i.id )
                        })
                    )

                    anuncios.forEach((i)=>{
                        
                    })
            }

         }catch(e){
            console.log('erro ao tentar consultar os anuncios ', e );
            return res.status(500).json({ sucess:false, message: 'erro ao tentar consultar os anuncios'});
         }


    }
}