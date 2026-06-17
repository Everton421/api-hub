import axios from "axios";
import crypto from "node:crypto";
import dayjs from "dayjs";
import Jwt from "jsonwebtoken";
import { InsertaMLAccountClient } from "../../../../models/ml-accounts/insert-ml-accounts.ts";
import { SelectMLAccountClient } from "../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../models/ml-accounts/update-ml-accounts.ts";
import { type InsertUserMl } from "../../../../types/ml-account/type-ml-account.ts";

type dataStateuser = {
    cnpj: string
    codigo: number
    code_verifier?: string
}

function base64URLEncode(buffer: Buffer): string {
    return buffer.toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
    const bytes = crypto.randomBytes(32);
    return base64URLEncode(bytes);
}

export function generateCodeChallenge(verifier: string): string {
    const hash = crypto.createHash("sha256").update(verifier).digest();
    return base64URLEncode(hash);
}
interface responseDecodToken {
    success: boolean,
    message?: string
    payload?: dataStateuser
}
type state = {
    codigo: number,
    cnpj: string
}
const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export const exchangeCodeForMlToken = async (code: string, state: string) => {

    const insertaMLAccountClient = new InsertaMLAccountClient();
    const selectMlAccountClient = new SelectMLAccountClient();
    const updateMlAccountClient = new UpdateMLAccountClient();

    const CLIENT_ID = process.env.APP_ID_ML;
    const CLIENT_SECRET = process.env.SECRET_ML;
    const REDIRECT_URI = process.env.REDIRECT_URI_ML;

    if (!CLIENT_SECRET || !CLIENT_ID || !REDIRECT_URI) throw Error("credenciais ausentes");

    const decodedState = DecodedMlStateToken(String(state));
    if (!decodedState.success || !decodedState.payload) {
        console.log(`[X] não foi possivel decodificar o state.`, decodedState.message);
        return;
    }

    const dataUser = decodedState.payload;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    if (dataUser.code_verifier) {
        params.append('code_verifier', dataUser.code_verifier);
    }

    try {
        const response = await axios.post(`${ML_API_URL}/oauth/token`, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        });

        const { access_token, refresh_token, expires_in, user_id } = response.data;
        console.log({ access_token, refresh_token, expires_in, user_id })
        const expirationDate = dayjs().add(expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss');

        if (response.status === 200 && access_token) {

            let dbName = `\`${dataUser.cnpj}\``;

            const userMlAccount: InsertUserMl = {
                access_token: access_token,
                user_id: dataUser.codigo,
                ml_user_id: user_id,
                refresh_token: refresh_token,
                token_expires_in: expirationDate
            };


            let resultValidUser = await selectMlAccountClient.fincByIdMLandCodeSystem(dbName, dataUser.codigo, user_id);
                
             if (resultValidUser.length > 0) {
                console.log("[V] encotrado conta do usuario, atualizando daddos ...")
                const resultUpdate = await updateMlAccountClient.update(dbName, userMlAccount);
                resultUpdate.affectedRows > 0 && console.log("[V] dados de acesso atualizados com sucesso.")
            } else {
               const resultInsert=  await insertaMLAccountClient.cadastrar(dbName, userMlAccount);
                resultInsert.affectedRows > 0 && console.log("[V] dados de acesso registrados com sucesso.")
              
            }


        } 

        const result ={ access_token, refresh_token, expirationDate, ml_user_id: user_id } 
        return result;

    } catch (error: any) {
        console.error('Erro ao trocar token:', error.response?.data || error.message);
        throw error;
    }
};

 

/**
 ** Função Inteligente para pegar Token Válido
 * Se o token atual estiver valido, retorna ele.
 * Se estiver vencido (ou quase), faz o refresh, salva no banco e retorna o novo.
 * @param cnpj 
 * @param systemUserCode codigo do usuario na empresa
 * @param mlUserId codigo do usuario no mercadolivre
 * @returns 
 */
export const getValidMlAccessToken = async (cnpj: string, systemUserCode: number, mlUserId: number) => {
    const selectMlAccountClient = new SelectMLAccountClient();
    const updateMlAccountClient = new UpdateMLAccountClient();

    const dbName = `\`${cnpj}\``;

    const contas = await selectMlAccountClient.fincByIdMLandCodeSystem(dbName, systemUserCode, mlUserId);

    if (!contas || contas.length === 0) {
        throw new Error("Conta do Mercado Livre não encontrada para este usuário.");
    }

    const conta = contas[0]; // Assumindo que retorna array

    // 2. Verifica se precisa renovar (Margem de segurança de 10 minutos)
    // O token vence em: conta.token_expires_in
    const agora = dayjs();
    const dataExpiracao = dayjs(conta.token_expires_in);
    const diffMinutos = dataExpiracao.diff(agora, 'minutes');

    console.log(`Token vence em: ${dataExpiracao.format()}, Falta: ${diffMinutos} minutos`);

    // Se faltar mais de 10 minutos, retorna o token atual (cache)
    if (diffMinutos > 10) {
        return conta.access_token;
    }

    // 3. Token Vencido ou Vencendo: Fazer Refresh
    console.log("Token expirado ou próximo da expiração. Renovando...");

    try {
        const response = await axios.post(`${ML_API_URL}/oauth/token`, null, {
            params: {
                grant_type: 'refresh_token',
                client_id: process.env.APP_ID_ML,
                client_secret: process.env.SECRET_ML,
                refresh_token: conta.refresh_token // O token de refresh antigo
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;

        // Calcula nova data
        const newExpirationDate = dayjs().add(expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss');

        // 4. Atualiza no Banco
        const updateData: InsertUserMl = {
            access_token: access_token,
            refresh_token: refresh_token, // O ML pode retornar um novo refresh token também!
            token_expires_in: newExpirationDate,
            user_id: systemUserCode,
            ml_user_id: mlUserId
        };

        await updateMlAccountClient.update(dbName, updateData);

        return access_token;

    } catch (error: any) {
        console.error("Erro ao fazer refresh token:", error.response?.data);
        // Se der erro aqui, o refresh token expirou (6 meses) ou o usuário revogou acesso.
        // Você deve marcar no banco que a integração está "Desconectada".
        throw new Error("Acesso revogado. É necessário reconectar a conta.");
    }
}

export const getMlUserCode = async () => {

    const client_id = process.env.APP_ID_ML
    const redirect_uri = process.env.REDIRECT_URI_ML

    const base_uri = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}`

    return base_uri
}

export function DecodedMlStateToken(token: string): responseDecodToken {
    const secret = process.env.SECRET_ML_ENCODE_STATE;
    if (!secret) {
        return { success: false, message: `SECRET_ML_ENCODE_STATE secret nao informado.` }
    }
    let decoded;
    Jwt.verify(token, secret, (err: any, decodedPayload: any) => {
        if (err) {

            if (err.name === 'TokenExpiredError') {
                console.log(err.name)
                return { success: false, message: `Token expirado. ${err.name}` }

            }
            return { success: false, message: `Erro na verificação do jwt ${err.message}` }
        }
        if (!decodedPayload || !decodedPayload.cnpj) {
            console.log("Payoad do jwt invalido ", decodedPayload);
            return { success: false, message: `Payoad do jwt invalido ${decodedPayload}` }
        }
        decoded = decodedPayload;

    })

    return { success: true, message: '', payload: decoded }

}

