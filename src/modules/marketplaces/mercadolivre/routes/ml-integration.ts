import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z  from "zod";
import { SelectUserApi } from "../../../../models/user-api/select.ts";
import { SelectUsersMlIntegrations   } from "../../../../models/users-ml-integration/select-users-ml-integration.ts";
import { DecodedMlStateToken, exchangeCodeForMlToken  } from "../services/ml-auth-service.ts";
import jwt from 'jsonwebtoken';
import { DecodedToken } from "../../../../services/decoded-token/decodedToken.ts";
import { CreateTableMLAccounts } from "../../../../database/tables-structures/create-table-ml-accounts.ts";
import { UpdateUsersMLIntegrations } from "../../../../models/users-ml-integration/update-users-ml-integration.ts";
import { DateService } from "../../../../utils/dateService.ts";
import { InsertUsersMlintegration } from "../../../../models/users-ml-integration/insert-users-ml-integration.ts";


type state = {
    codigo: number,
    cnpj: string
}

export const mlIntegrationRoute: FastifyPluginAsyncZod = async ( server ) =>{
    server.get('/ml/integration/callback',{
        schema: { 
            tags: ['ml/integration'],
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
        const selectUserApi = new SelectUserApi();
        const selectUsersCompany = new SelectUsersMlIntegrations();

        const frontEndtUrl = process.env.FRONT_END_URL || 'http://localhost:8000';

            try{

               // console.log(request.query);
               if(!request.query.code) return reply.status(500).send({ success:false, message: "CODE is missing."});
               if(!request.query.state) return reply.status(500).send({success:false, message: "STATE is missing."});


                const code  = request.query.code;
                const state = request.query.state  ;

                const returnTokens = await exchangeCodeForMlToken(code , state );

            if (!returnTokens?.access_token) {
                return reply.redirect(`${frontEndtUrl}/marketplaces/integracoes?status=error&message=Nao+foi+possivel+obter+token`);
            }

            const decodedState = DecodedMlStateToken(request.query.state as any);
            if (!decodedState.success || !decodedState.payload) {
                console.log(`Retorno inesperado da função [ DecodedMlStateToken ] `, decodedState.message);
                return reply.redirect(`${frontEndtUrl}/marketplaces/integracoes?status=error&message=Token+invalido`);
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

          return reply.redirect(`${frontEndtUrl}/marketplaces/integracoes?data=${tempToken}`);

            }catch(e){
                 console.log(e);
                   return reply.redirect(`${frontEndtUrl}/marketplaces/integracoes?status=error&message=Erro+interno+na+integracao`);

            }
        

    });

    server.get('/ml/integration/getCode',{
        schema:{
            tags:['ml/integration'],
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
      console.error("Erro crítico: JWT_SECRET não está definido!");
      return reply.status(500).send({success: false, message: "Erro interno do servidor [JWT Secret Missing]." });
    }


           const payload = {
                cnpj: empresa,
                codigo: queryVendedor
                }

    const token = jwt.sign(payload, secret)
    
         if(!process.env.APP_ID_ML) return reply.status(500).send({success: false, message: ` APP_ID_ML não foi configurada.`})
        const client_id = process.env.APP_ID_ML  //4127824475666105

         if(!process.env.REDIRECT_URI_ML) return reply.status(500).send({success: false, message: ` REDIRECT_URI_ML não foi configurada.`})
        const redirect_uri = process.env.REDIRECT_URI_ML //https://3acc823e2f47.ngrok-free.app/v1/ml/integrations/callback
        
        
        const base_uri = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${token}`
    
        return reply.status(200).send({ uri: base_uri })


 }  );
 server.post("/ml/integration/finalizeIntegration", {
            schema:{
                tags:['ml/integration'],
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