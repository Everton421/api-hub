import { Request, Response } from "express";
import { exchangeCodeForToken } from "../../../services/integration/mercadolivre-integration/ml-auth-service";
import { DecodedToken } from "../../../services/decoded-token/decodedToken";
import jwt from 'jsonwebtoken';
import { CreateTableMLAccounts } from "../../../database/tables-structures/ml-accounts";

export class MlController{

async callback(req: Request, res: Response) {
    try {
        const returnTokens = await exchangeCodeForToken(req.query.code as any, req.query.state as any);

        if (returnTokens?.access_token) {
            // Sucesso: Redireciona com params para o front
            return res.redirect("http://localhost:8000/integracoes?status=success&message=Conta+conectada+com+sucesso");
        } else {
             return res.redirect("http://localhost:8000/integracoes?status=error&message=Nao+foi+possivel+obter+token");
        }
    } catch (error) {
        console.log(error);
        return res.redirect("http://localhost:8000/integracoes?status=error&message=Erro+interno+na+integracao");
    }
}



  /**
   *  obtem o codigo de autorização usado para trocar pelo tken de acesso
   * @param req 
   * @param res 
   */
  async getCode(req:Request, res:Response ){
        
    const createTableMlAccounts = new CreateTableMLAccounts();

           if(!req.headers.token ){
             return res.status(400).json({erro:true, msg:"É necessario informar o token!"});   
          } 
          let decodToken= DecodedToken(String(req.headers.token))
          let empresa  = decodToken.payload?.cnpj.replace(/\D/g, '');

         let  dbName = `\`${empresa}\``;
        
        const queryVendedor = req.query.vendedor;

          const resultCreateTable = await createTableMlAccounts.createTable(dbName);
          if(resultCreateTable && resultCreateTable.sucess === false ){
          return res.status(500).json({ msg: "Erro interno do servidor [Erro ao tentar registrar a tabela de usuarios do mercadolivre na empresa]." });

          }
          
        const secret = process.env.SECRET_ML_ENCODE_STATE;
          if (!secret) {
                            console.error("Erro crítico: JWT_SECRET não está definido!");
                            return res.status(500).json({ msg: "Erro interno do servidor [JWT Secret Missing]." });
                        }
           const payload = { 
                    cnpj: empresa,
                    codigo:queryVendedor
                } 
                
         const token = jwt.sign(  payload, secret   )

   const client_id=   process.env.APP_ID_ML  //4127824475666105
   const redirect_uri = process.env.REDIRECT_URI_ML //https://3acc823e2f47.ngrok-free.app/v1/ml/integrations/callback

    const base_uri=`https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${token}`

    return res.status(200).json({uri: base_uri})
  }


  async authMl(req:Request, res:Response){
        console.log(req.body)
  }
 
}
 