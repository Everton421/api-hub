import axios from "axios";
import dayjs from "dayjs";
import  Jwt   from "jsonwebtoken";
import { InsertaMLAccountClient   } from "../../../models/ml-accounts/insert-ml-accounts";

import { InsertUserMl } from "../../../types/ml-account/ml-account";
import { SelectMLAccountClient } from "../../../models/ml-accounts/select-ml-accounts";
import { UpdateMLAccountClient } from "../../../models/ml-accounts/update-ml-accounts";
import { UpdateUsersMLIntegrations } from "../../../models/users_ml-integration/update-users-ml-integration";
import { SelectUsersMlIntegrations } from "../../../models/users_ml-integration/select-users-ml-integration";
import { InsertUsersMlintegration } from "../../../models/users_ml-integration/insert-users-ml-integration";
import { DateService } from "../../date-service/dateService";
type state= { 
    codigo:number,
    cnpj:string
}


type dataStateuser = {
    cnpj:string
    codigo:number
}

type responseTokenRequest = 
{
   access_token: string,
   token_type: string ,
   expires_in: number,
   scope: string, 
   user_id: number,
   refresh_token: string
}

const ML_API_URL = 'https://api.mercadolibre.com';

export const exchangeCodeForToken = async (code: string, state:state) => {
    const dateService = new DateService();

    const insertaMLAccountClient = new InsertaMLAccountClient();
    const selectMlAccountClient = new SelectMLAccountClient()
    const updateMlAccountClient = new UpdateMLAccountClient();

    const updateUsersMlIntegration = new UpdateUsersMLIntegrations();
    const selectUsersMlIntegration = new SelectUsersMlIntegrations();
    const insertUsersMlIntegration = new InsertUsersMlintegration();

    const CLIENT_ID= process.env.APP_ID_ML
    const CLIENT_SECRET = process.env.SECRET_ML
    
    if(!CLIENT_SECRET || !CLIENT_ID){
        return 
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    
    params.append('client_id', CLIENT_ID); 
    params.append('client_secret', CLIENT_SECRET); // ROTE ESTE SEGREDO IMEDIATAMENTE
    params.append('code', code);
    params.append('redirect_uri', 'https://3acc823e2f47.ngrok-free.app/v1/ml/integrations/callback');
    params.append('state', JSON.stringify(state));
   
    try {
        const response = await axios.post(`${ML_API_URL}/oauth/token`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
        });

        const { access_token, refresh_token, expires_in, user_id } = response.data;

        const expirationDate = dayjs().add(expires_in, 'seconds').toDate();
            if(response.status ===200 && response.data.access_token){

                const responseRequest = response.data as responseTokenRequest;
                    const dataUser = DecodedToken( String(state) ).payload
                    if(!dataUser || dataUser === undefined ) return;

                       let  dbName = `\`${dataUser.cnpj}\``;
                    const userMlAccount:InsertUserMl = 
                                { 
                                     access_token: responseRequest.access_token,
                                      user_id:dataUser.codigo ,
                                        ml_user_id: responseRequest.user_id,
                                        refresh_token: responseRequest.refresh_token,
                                        token_expires_in: String(responseRequest.expires_in)
                                        };
                                    let resultValidUser = await selectMlAccountClient.fincByIdMLandCodeSystem(dbName,dataUser.codigo,  responseRequest.user_id )
                                        if(resultValidUser.length > 0 ){
                                            const resultUpdateMlAccountClient=    await updateMlAccountClient.update(dbName,userMlAccount )
                                        }else{
                                           const resultInsertMlAccountClient = await insertaMLAccountClient.cadastrar(dbName,userMlAccount )
                                        }
                                    let validuserMlIntegration = await selectUsersMlIntegration.fincByIdMLandCodeSystem(dataUser.codigo,responseRequest.user_id )    
                                        if( validuserMlIntegration.length > 0 ){
                                            const resultUpdateMlIntegration = await updateUsersMlIntegration.update( { cnpj: dataUser.cnpj, created_at: dateService.obterDataHoraAtual(),system_user_code: dataUser.codigo, ml_user_id:responseRequest.user_id })
                                        }else{
                                           const resultInsertMlIntegration = await insertUsersMlIntegration.cadastrar( { cnpj: dataUser.cnpj, created_at: dateService.obterDataHoraAtual() ,system_user_code: dataUser.codigo, ml_user_id:responseRequest.user_id })     
                                        }

            }
        return { access_token, refresh_token, expirationDate, ml_user_id: user_id };

    } catch (error: any) {
        console.error('Erro ao trocar token:', error.response?.data || error.message);
        console.log("Resposta erro ML: ", error)
    }
   
};



  export const getUserCode = async ()=>{

   const client_id=   process.env.APP_ID_ML  
   const redirect_uri = process.env.REDIRECT_URI_ML  

    const base_uri=`https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}`

        return base_uri
  }

interface responseDecodToken  { 
    erro:boolean,
    msg?:string
    payload?:dataStateuser 
}

  export function DecodedToken( token:string ): responseDecodToken {
          const secret = process.env.SECRET_ML_ENCODE_STATE;
          if(!secret ){
              return { erro: true, msg: `secret nao informado`}
          }
          let decoded ;
              Jwt.verify( token, secret , (err:any, decodedPayload: any )=>{
                      if(err){
              
                      if (err.name === 'TokenExpiredError') {
                              //return res.status(401).json({ msg: 'Token expirado.' });
                          console.log(err.name)
                          return { erro:"true", msg: `'Token expirado. ' ${err.name}`}
  
                      }
                       //   console.log(`Erro na verificação do jwt `, err.message);
                          return { erro:"true", msg: `Erro na verificação do jwt ${err.message}`}
                      }  
                      if(!decodedPayload || !decodedPayload.cnpj){
                          console.log("Payoad do jwt invalido ", decodedPayload);
                          return { erro:"true", msg: `Payoad do jwt invalido ${decodedPayload}`}
                      }
                      decoded = decodedPayload;
                      
                  })
                  
        return { erro: false ,   payload:decoded, msg:''}
  
  }