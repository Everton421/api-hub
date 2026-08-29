import axios from "axios";
import { MlAuthServices } from "./auth/ml-auth-services.ts";

export class GetUserTest {

    private readonly mlAuthServices: MlAuthServices;

    constructor(mlAuthServices: MlAuthServices) {
        this.mlAuthServices = mlAuthServices;
    }

    /**
     *
     * @param cnpj
     * @param systemUserCode
     * @param mlUserId
     * @returns
     */
    async getUser(cnpj: string, systemUserCode: number, mlUserId: number) {

        const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';
        let accessToken

        try {
            accessToken = await this.mlAuthServices.getValidMlAccessToken(cnpj, systemUserCode, mlUserId);
        } catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message);
            }
        }

        const response = await axios.post(`${ML_API_URL}/users/test_user`,
            {
                site_id: "MLB"
            }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        return response.data;
    }
}