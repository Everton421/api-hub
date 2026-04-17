import axios from "axios";
import { getValidMlAccessToken } from "../integration/mercadolivre-integration/ml-auth-service.ts";

export class GetUserTest{
    /**
     * 
     * @param cnpj 
     * @param systemUserCode 
     * @param mlUserId 
     * @returns 
     */
    async getUser(cnpj: string,systemUserCode: number, mlUserId: number){

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';
        let accessToken
 

            try {
                accessToken = await getValidMlAccessToken(cnpj, systemUserCode, mlUserId);
            } catch (e) {
                if (e instanceof Error) {
                    throw new Error(e.message);
                }
            }

            const response = await axios.post(`${ML_API_URL}/Users/test_user`, 
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