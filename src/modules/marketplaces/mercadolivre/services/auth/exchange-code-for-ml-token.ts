import axios from "axios";
import dayjs from "dayjs";
import { type InsertUserMl } from "../../../../../types/ml-account/type-ml-account.ts";
import { InsertaMLAccountClient } from "../../../../../models/ml-accounts/insert-ml-accounts.ts";
import { SelectMLAccountClient } from "../../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../../models/ml-accounts/update-ml-accounts.ts";
import { DecodedMlStateToken } from "./decoded-ml-state-token.ts";

type MlTokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user_id: number;
};

export type ExchangeCodeForMlTokenResult = {
    access_token: string;
    refresh_token: string;
    expirationDate: string;
    ml_user_id: number;
};

export class ExchangeCodeForMlToken {
    private readonly ML_API_URL: string;

    private readonly insertMLAccountClient: InsertaMLAccountClient;
    private readonly selectMlAccountClient: SelectMLAccountClient;
    private readonly updateMlAccountClient: UpdateMLAccountClient;
    private readonly decodedMlStateToken: DecodedMlStateToken;

    constructor(
        ML_API_URL: string,
        insertMLAccountClient: InsertaMLAccountClient,
        selectMlAccountClient: SelectMLAccountClient,
        updateMlAccountClient: UpdateMLAccountClient,
        decodedMlStateToken: DecodedMlStateToken
    ) {
        this.ML_API_URL = ML_API_URL;
        this.insertMLAccountClient = insertMLAccountClient;
        this.selectMlAccountClient = selectMlAccountClient;
        this.updateMlAccountClient = updateMlAccountClient;
        this.decodedMlStateToken = decodedMlStateToken;
    }

    /**
     *   Obtem o token do mercadolivre
     * @param code
     * @param state
     * @returns
     */
    async exchangeCodeForMlToken(code: string, state: string): Promise<ExchangeCodeForMlTokenResult | undefined> {

        const CLIENT_ID = process.env.APP_ID_ML;
        const CLIENT_SECRET = process.env.SECRET_ML;
        const REDIRECT_URI = process.env.REDIRECT_URI_ML;

        if (!CLIENT_SECRET || !CLIENT_ID || !REDIRECT_URI) throw Error("credenciais ausentes");

        const decodedState = await this.decodedMlStateToken.decodedToken(String(state));
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
            const response = await axios.post<MlTokenResponse>(`${this.ML_API_URL}/oauth/token`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            });

            const { access_token, refresh_token, expires_in, user_id } = response.data;
            console.log({ access_token, refresh_token, expires_in, user_id })
            const expirationDate = dayjs().add(expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss');

            if (response.status === 200 && access_token) {

                const dbName = `\`${dataUser.cnpj}\``;

                const userMlAccount: InsertUserMl = {
                    access_token: access_token,
                    user_id: dataUser.codigo,
                    ml_user_id: user_id,
                    refresh_token: refresh_token,
                    token_expires_in: expirationDate
                };

                const resultValidUser = await this.selectMlAccountClient.fincByIdMLandCodeSystem(dbName, dataUser.codigo, user_id);

                if (resultValidUser.length > 0) {
                    console.log("[V] encotrado conta do usuario, atualizando daddos ...")
                    const resultUpdate = await this.updateMlAccountClient.update(dbName, userMlAccount);
                    resultUpdate.affectedRows > 0 && console.log("[V] dados de acesso atualizados com sucesso.")
                } else {
                    const resultInsert = await this.insertMLAccountClient.cadastrar(dbName, userMlAccount);
                    resultInsert.affectedRows > 0 && console.log("[V] dados de acesso registrados com sucesso.")
                }
            }

            const result: ExchangeCodeForMlTokenResult = { access_token, refresh_token, expirationDate, ml_user_id: user_id }
            return result;

        } catch (error: any) {
            console.error('Erro ao trocar token:', error.response?.data || error.message);
            throw error;
        }
    };
}