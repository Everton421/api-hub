import dayjs from "dayjs";
import { SelectMLAccountClient } from "../../../../../models/ml-accounts/select-ml-accounts.ts";
import { UpdateMLAccountClient } from "../../../../../models/ml-accounts/update-ml-accounts.ts";
import axios from "axios";
import { type InsertUserMl } from "../../../../../types/ml-account/type-ml-account.ts";

type MlTokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
};

export class MlAuthServices {
    private readonly selectMlAccountClient: SelectMLAccountClient;
    private readonly updateMlAccountClient: UpdateMLAccountClient;
    private readonly ML_API_URL: string;

    constructor(
        selectMlAccountClient: SelectMLAccountClient,
        updateMlAccountClient: UpdateMLAccountClient,
        ML_API_URL: string = process.env.ML_API_URL || 'https://api.mercadolibre.com'
    ) {
        this.selectMlAccountClient = selectMlAccountClient;
        this.updateMlAccountClient = updateMlAccountClient;
        this.ML_API_URL = ML_API_URL;
    }

    async getValidMlAccessToken(cnpj: string, systemUserCode: number, mlUserId: number): Promise<string> {
        const dbName = `\`${cnpj}\``;

        const contas = await this.selectMlAccountClient.fincByIdMLandCodeSystem(dbName, systemUserCode, mlUserId);

        if (!contas || contas.length === 0) {
            throw new Error("Conta do Mercado Livre não encontrada para este usuário.");
        }

        const conta = contas[0];

        // Verifica se precisa renovar (margem de segurança de 10 minutos)
        const agora = dayjs();
        const dataExpiracao = dayjs(conta.token_expires_in);
        const diffMinutos = dataExpiracao.diff(agora, 'minutes');

        console.log(`Token vence em: ${dataExpiracao.format()}, Falta: ${diffMinutos} minutos`);

        if (diffMinutos > 10) {
            return conta.access_token;
        }

        console.log("Token expirado ou próximo da expiração. Renovando...");

        try {
            const response = await axios.post<MlTokenResponse>(`${this.ML_API_URL}/oauth/token`, null, {
                params: {
                    grant_type: 'refresh_token',
                    client_id: process.env.APP_ID_ML,
                    client_secret: process.env.SECRET_ML,
                    refresh_token: conta.refresh_token
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });

            const { access_token, refresh_token, expires_in } = response.data;

            const newExpirationDate = dayjs().add(expires_in, 'seconds').format('YYYY-MM-DD HH:mm:ss');

            const updateData: InsertUserMl = {
                access_token: access_token,
                refresh_token: refresh_token,
                token_expires_in: newExpirationDate,
                user_id: systemUserCode,
                ml_user_id: mlUserId
            };

            await this.updateMlAccountClient.update(dbName, updateData);

            return access_token;
        } catch (error: any) {
            console.error("Erro ao fazer refresh token:", error.response?.data);
            throw new Error("Acesso revogado. É necessário reconectar a conta.");
        }
    }
}