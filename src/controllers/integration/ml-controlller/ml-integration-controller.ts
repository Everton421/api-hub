import { Request, Response } from "express";
import { DecodedStateToken, exchangeCodeForToken } from "../../../services/integration/mercadolivre-integration/ml-auth-service";
import { DecodedToken } from "../../../services/decoded-token/decodedToken";
import jwt from 'jsonwebtoken';
import { CreateTableMLAccounts } from "../../../database/tables-structures/create-table-ml-accounts";
import { DateService } from "../../../services/date-service/dateService";
import { InsertUsersMlintegration } from "../../../models/users-ml-integration/insert-users-ml-integration";
import { UpdateUsersMLIntegrations } from "../../../models/users-ml-integration/update-users-ml-integration";
import { SelectUsersMlIntegrations } from "../../../models/users-ml-integration/select-users-ml-integration";

export class MlIntegrationController{

async callback(req: Request, res: Response) {
  console.log(req.query)
    try {
        const returnTokens = await exchangeCodeForToken(req.query.code as any, req.query.state as any);

        if (!returnTokens?.access_token) {
     
             return res.redirect("http://localhost:8000/integracoes?status=error&message=Nao+foi+possivel+obter+token");
        }

      const payloadState  =  DecodedStateToken(req.query.state as any).payload;
        
      if(!payloadState || payloadState === undefined){
          return;
        }

         const payload = {
            ml_user_id: returnTokens.ml_user_id,
            system_user_code: payloadState.codigo, // Assumindo que vc decodificou o state antes
            cnpj:payloadState.cnpj
          };
 
        const secret = process.env.SECRET_ML_ENCODE_STATE; 
        
        if(!secret )  {
          return;
        }

        const tempToken = jwt.sign(payload, secret, { expiresIn: '10m' }); // Vale por 10 min

        // 3. Redireciona para a tela de "Nomear Integração" no Next.js
        // Passamos o token na URL
        return res.redirect(`http://localhost:8000/integracoes?data=${tempToken}`);


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


  async finalizeIntegration(req:Request, res:Response){
         try {

    const updateUsersMlIntegration = new UpdateUsersMLIntegrations();
    const selectUsersMlIntegration = new SelectUsersMlIntegrations();
    const insertUsersMlIntegration = new InsertUsersMlintegration();


        const { integrationName, tempToken } = req.body;
        const dateService = new DateService();
     
        if (!integrationName || !tempToken) {
            return res.status(400).json({ msg: "Dados incompletos." });
        }

        // 1. Decodifica o token temporário para pegar os IDs
        const secret = process.env.SECRET_ML_ENCODE_STATE;
        if(!secret){
          return;
        }
        let decoded: any;
        try {
            decoded = jwt.verify(tempToken, secret);
        } catch (err) {
            return res.status(401).json({ msg: "Sessão de integração expirada. Tente novamente." });
        }

        const { ml_user_id, system_user_code } = decoded;
        
        // Obter CNPJ do usuário logado (via AuthMiddleware que deve estar nessa rota)
        // Ou se você passou o CNPJ no payload do token temporário, pode pegar de lá.
        // Assumindo que o AuthMiddleware popula req.user:
        // const cnpj = req.user.cnpj; 
        // Mas como você usa o state, talvez seja melhor passar o CNPJ no payload do JWT acima também.
        
        // Vamos supor que o CNPJ veio no payload do JWT temporário para facilitar:
        const cnpj = decoded.cnpj; 

        // 2. FINALMENTE insere na tabela principal
    const validuserMlIntegration = await selectUsersMlIntegration.fincByIdMLandCodeSystem(system_user_code , ml_user_id);
          //   if (validuserMlIntegration.length > 0) {
          //       await updateUsersMlIntegration.update({ integration_name: integrationName, cnpj: cnpj, created_at: dateService.obterDataHoraAtual(), system_user_code: system_user_code, ml_user_id: ml_user_id });
          //   } else {
          //       await insertUsersMlIntegration.cadastrar({ cnpj: cnpj, created_at: dateService.obterDataHoraAtual(), system_user_code: system_user_code, ml_user_id: ml_user_id, integration_name:integrationName });
          //   }
 
          
        return res.status(200).json({ msg: "Integração concluída com sucesso!" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Erro ao finalizar integração." });
    }
  }
 
}
 