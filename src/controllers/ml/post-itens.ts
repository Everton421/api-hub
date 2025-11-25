import { Request, Response } from "express";
import { DecodedToken } from "../../services/decoded-token/decodedToken";
import { SelectUsersMlIntegrations } from "../../models/users_ml-integration/select-users-ml-integration";
import { PostMlItemsService, PublishItem } from "../../services/ml-services/post-itens-ml";

export class PostItensController{
    
    async post(req: Request, res:Response ){

        try{
            
            const { title, price, category_id, available_quantity  } = req.body 

            if(!title || !price || !category_id ){
                    return res.status(400).json({ msg: "Campos obrigatórios: title, price, category_id" });
            }
            const decoded = DecodedToken(String(req.headers.token));
            if (decoded.erro || !decoded.payload) return res.status(401).json({ msg: "Token inválido" });
            
                 const userCnpj = decoded.payload.cnpj;
                const systemUserCode = decoded.payload.codigo;

                // Busca a integração do usuário (pode extrair isso para um helper method para não repetir código)
                const selectUsersMl = new SelectUsersMlIntegrations();
                const integracoes = await selectUsersMl.findBySystemUserCodeAndCnpj(systemUserCode,userCnpj);
                if (!integracoes || integracoes.length === 0) {
                    return res.status(400).json({ msg: "Usuário não possui conta ML vinculada." });
                }
                const mlUserId = integracoes[0].ml_user_id;

                // Monta o DTO com os dados do Body
                const itemData: PublishItem = {
                    title: req.body.title,
                    price: Number(req.body.price),
                    quantity: Number(req.body.available_quantity), // Atenção ao nome do campo no front vs back
                    category_id: req.body.category_id,
                    listing_type_id: req.body.listing_type_id || "gold_special",
                    condition: req.body.condition || "new",
                    description: req.body.description,
                    pictures: req.body.pictures || [], // Array de strings
                    brand: req.body.brand, // Opcional
                    model: req.body.model,  // Opcional
                     attributes: req.body.attributes || []
                };

                const mlService = new PostMlItemsService();
                const result = await mlService.publishItem(userCnpj, systemUserCode, mlUserId, itemData);
                // const result = req.body
                return res.status(201).json(result);

        }catch(e){

        }   
    }
}