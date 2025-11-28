import { Request, Response } from "express";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { SelectUsersMlIntegrations } from "../../models/users_ml-integration/select-users-ml-integration";
import { PostMlItemsService, PublishItem } from "../../services/ml-services/post-itens-ml";

export class PostItensController{
    
    async post(req: Request, res:Response ){

        try{
            
            const { title, price, category_id,   ml_user_id  } = req.body 
            if(!ml_user_id ) return res.status(400).json({ msg: "identificador ml_user_id nao fornecido." });


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
                const result = await mlService.publishItem(userCnpj, systemUserCode, mlUserId, itemData);
                return res.status(201).json(result);

        }catch(e){
            
        }   
    }
}