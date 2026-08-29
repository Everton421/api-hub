import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z  from "zod";
import { SelectUsersMlIntegrations   } from "../../../../models/users-ml-integration/select-users-ml-integration.ts";

import jwt from 'jsonwebtoken';
import { DecodedToken } from "../../../../services/decoded-token/decodedToken.ts";
import { CreateTableMLAccounts } from "../../../../database/tables-structures/create-table-ml-accounts.ts";
import { UpdateUsersMLIntegrations } from "../../../../models/users-ml-integration/update-users-ml-integration.ts";
import { DateService } from "../../../../utils/dateService.ts";
import { InsertUsersMlintegration } from "../../../../models/users-ml-integration/insert-users-ml-integration.ts";
import { GenerateMlCode } from "../utils/generate-code.ts";
import { SelectMLAccountClient } from "../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../models/ml-accounts/update-ml-accounts.ts";
import { InsertaMLAccountClient } from "../../../../models/ml-accounts/insert-ml-accounts.ts";
import { ExchangeCodeForMlToken } from "../services/auth/exchange-code-for-ml-token.ts";
import { DecodedMlStateToken } from "../services/auth/decoded-ml-state-token.ts";
import { GetMlUserCode } from "../services/auth/get-ml-user-code.ts";


export const mlIntegrationRoute: FastifyPluginAsyncZod = async ( server ) =>{
    server.get('/ml/integration/callback',{
        schema: { 
            tags: ['ml'],
            querystring: z.object({
                code: z.coerce.string(),
                state:z.coerce.string(),
                //state: z.object({
                //    codigo: z.coerce.number(),
                //    cnpj:z.string()
                //})
                })
        }
    } , async ( request, reply )=>{
        
        const selectMlAccountClient = new SelectMLAccountClient();
        const updateMlAccountClient = new UpdateMLAccountClient();
        const insertaMLAccountClient = new InsertaMLAccountClient();
        const decodedMlStateToken = new DecodedMlStateToken();
        
        const frontEndUrl = process.env.FRONT_END_URL || 'http://localhost:8000';
        const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

        const mlDecodedStateToken = new ExchangeCodeForMlToken(
            ML_API_URL,
            insertaMLAccountClient,
            selectMlAccountClient,
            updateMlAccountClient,
            decodedMlStateToken
        );

            try{
 

               // console.log(request.query);
               if(!request.query.code) return reply.status(500).send({ success:false, message: "CODE is missing."});
               if(!request.query.state) return reply.status(500).send({success:false, message: "STATE is missing."});


const { code, state } = request.query;

                const returnTokens = await mlDecodedStateToken.exchangeCodeForMlToken(code, state);

            if (!returnTokens?.access_token) {
                return reply.redirect(`${frontEndUrl}/marketplaces/integracoes?status=error&message=Nao+foi+possivel+obter+token`);
            }

            const decodedState = await decodedMlStateToken.decodedToken(state);

            if (!decodedState.success || !decodedState.payload) {
                console.log(`Retorno inesperado da função [ DecodedMlStateToken ] `, decodedState.message);
                return reply.redirect(`${frontEndUrl}/marketplaces/integracoes?status=error&message=Token+invalido`);
            }

            const payloadState = decodedState.payload;

            const payload = {
                    ml_user_id: returnTokens.ml_user_id,
                    system_user_code: payloadState.codigo,
                    cnpj: payloadState.cnpj
                };

            if (!process.env.SECRET_ML_ENCODE_STATE) {
                    throw new Error("SECRET_ML_ENCODE_STATE nao foi configurada.")
                }
                       const secret = process.env.SECRET_ML_ENCODE_STATE;

            const tempToken = jwt.sign(payload, secret, { expiresIn: '10m' }); // Vale por 10 min

            return reply.redirect(`${frontEndUrl}/marketplaces/integracoes?data=${tempToken}`);

            }catch(e){
                 console.log(e);
                   return reply.redirect(`${frontEndUrl}/marketplaces/integracoes?status=error&message=Erro+interno+na+integracao`);

            }
        

    });

    server.get('/ml/integration/getCode',{
        schema:{
            tags:['ml'],
            description:"Retorna a url de autorização, para que o MercadoLivre autorize o App a acessar a conta do usuario. ",
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                vendedor: z.coerce.number()
            }),
             response :{
                200: z.object({
                    uri: z.string().describe("Url de autorização.")
                }),
                500: z.object({
                success:z.boolean(),
                message:z.string() 
                })
            }
        }
   
} , async ( request, reply )=>{
    
        const decodToken = DecodedToken(String(request.headers.token))
        const empresa = decodToken.payload?.cnpj.replace(/\D/g, '');
        const createTableMLAccounts = new CreateTableMLAccounts();

        const dbName = `\`${empresa}\``;
        if(!empresa){
            return reply.status(500).send({ success:false, message: "Erro interno do servidor [JWT Secret]"})
        }
        const queryVendedor = request.query.vendedor;
   
         const resultCreateTable = await createTableMLAccounts.createTableMlAcounts(empresa);
        if(!resultCreateTable.sucess){
            return reply.status(500).send({success: false, message: "Erro interno do servidor." });
        }
    const secret = process.env.SECRET_ML_ENCODE_STATE;
    if (!secret) {
      console.error("Erro crítico: SECRET_ML_ENCODE_STATE não está definido!");
      return reply.status(500).send({success: false, message: "Erro interno do servidor [JWT Secret Missing]." });
    }


           const generateMlCode = new GenerateMlCode();
           const codeVerifier = generateMlCode.generateCodeVerifier();
           const codeChallenge = generateMlCode.generateCodeChallenge(codeVerifier);

           const payload = {
                cnpj: empresa,
                codigo: queryVendedor,
                code_verifier: codeVerifier
                }

    const token = jwt.sign(payload, secret)
    
         if(!process.env.APP_ID_ML) return reply.status(500).send({success: false, message: ` APP_ID_ML não foi configurada.`})
        const client_id = process.env.APP_ID_ML

         if(!process.env.REDIRECT_URI_ML) return reply.status(500).send({success: false, message: ` REDIRECT_URI_ML não foi configurada.`})
        const redirect_uri = process.env.REDIRECT_URI_ML
        
        const getMlUserCode = new GetMlUserCode(client_id, redirect_uri);
        const base_uri = getMlUserCode.getMlUserCode(token, codeChallenge);
    
        return reply.status(200).send({ uri: base_uri })


 }  );
 server.post("/ml/integration/finalizeIntegration", {
            schema:{
                tags:['ml'],
                
                headers: z.object({
                    token:z.string()
                }),
                body: z.object({
                    integrationName: z.string(),
                    tempToken: z.string()
                })
            }
 }, async ( request, reply )=>{

    try {

    const selectUsersMlIntegration = new SelectUsersMlIntegrations();
        const updateUsersMLIntegrations = new UpdateUsersMLIntegrations();
        const insertUsersMlintegration  = new InsertUsersMlintegration();
        const dateService = new DateService();

        if (!process.env.SECRET_ML_ENCODE_STATE) {
         return;
       }
       const secret = process.env.SECRET_ML_ENCODE_STATE;
       
       const { integrationName, tempToken } = request.body;

            let decoded: any;
              try {
                decoded = jwt.verify(tempToken, secret);
              } catch (err) {
                return reply.status(401).send({ msg: "Sessão de integração expirada. Tente novamente." });
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
      const validuserMlIntegration = await selectUsersMlIntegration.fincByIdMLandCodeSystem(system_user_code, ml_user_id);
          if (validuserMlIntegration.length > 0) {
              await updateUsersMLIntegrations.update({ integration_name: integrationName, cnpj: cnpj, created_at: dateService.obterDataHoraAtual(), system_user_code: system_user_code, ml_user_id: ml_user_id });
          } else {
              await insertUsersMlintegration.cadastrar({ cnpj: cnpj, created_at: dateService.obterDataHoraAtual(), system_user_code: system_user_code, ml_user_id: ml_user_id, integration_name:integrationName });
          }


      return reply.status(200).send({ success: true, message: "Integração concluída com sucesso!" });
} catch (error) {
      console.error(error);
      return reply.status(500).send({ msg: "Erro ao finalizar integração." });
    }
 })
}