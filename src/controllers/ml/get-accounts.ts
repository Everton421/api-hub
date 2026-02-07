import { Request, Response } from "express";
import { SelectMLAccountClient } from "../../models/ml-accounts/select-ml-accounts";
import { DecodedToken } from "../../services/decoded-token/decodedToken";

export class MlAccountsController{

    async getAccounts(req:Request , res:Response ){
            const selectMLAccountClient = new SelectMLAccountClient();

            if(!req.headers.token ){
                return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
            }
            
            if(!req.params.codigo ){
                return res.status(400).json({erro:true, msg:"É necessario informar o codigo do usuario!"});   
            }
            
            
            const decodToken= DecodedToken(String(req.headers.token))
            const empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');
            const  dbName = `\`${empresa}\``;
            const codigo = req.params.codigo ;

            try{
                const resultAccount = await selectMLAccountClient.findByUserIdAndIntegration(dbName,Number(codigo))
               return res.status(200).json(resultAccount);

            }catch(e){
                return res.status(400).json({ erro:true, msg:'Erro ao tentar consultar o recurso '})
            }

    }
}