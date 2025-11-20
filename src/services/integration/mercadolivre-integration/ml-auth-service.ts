import axios from "axios";
import dayjs from "dayjs";

const ML_API_URL = 'https://api.mercadolibre.com';

export const exchangeCodeForToken = async (code: string) => {
    
    // Para x-www-form-urlencoded, usamos URLSearchParams
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    
    // IMPORTANTE: Use variáveis de ambiente (process.env) em produção!
    params.append('client_id', '4127824475666105'); 
    params.append('client_secret', 'LD6g81mVwJp3sz1IBtD0IiTMB0EhrLgX'); // ROTE ESTE SEGREDO IMEDIATAMENTE
    params.append('code', code);
    params.append('redirect_uri', 'https://b3abcbb1b172.ngrok-free.app/v1/ml/integrations/callback');
    
    // Se você configurou PKCE na sua aplicação, descomente a linha abaixo e passe o verifier
    // params.append('code_verifier', 'SEU_CODE_VERIFIER_AQUI'); 

    try {
        const response = await axios.post(`${ML_API_URL}/oauth/token`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
        });

        const { access_token, refresh_token, expires_in, user_id } = response.data;
        
        console.log('Resposta ML:', response.data);

        // Calcular data de expiração
        const expirationDate = dayjs().add(expires_in, 'seconds').toDate();

        return { access_token, refresh_token, expirationDate, ml_user_id: user_id };

    } catch (error: any) {
        // É bom logar o erro para entender se foi "invalid_grant" (code expirado) ou erro de configuração
        console.error('Erro ao trocar token:', error.response?.data || error.message);
        console.log("Resposta erro ML: ", error)
      //  throw error;
    }
};