import axios from "axios";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export interface IUpdateInventory {
    price?: number;
    available_quantity?: number;
}

export class UpdateMlItemInventoryService {
    async updateItem(
        accessToken: string,
        mlItemId: string,
        data: IUpdateInventory
    ): Promise<{ success: boolean; ml_id: string; response: any }> {
        try {
            const payload: Record<string, any> = {};
            if (data.price !== undefined) payload.price = data.price;
            if (data.available_quantity !== undefined) payload.available_quantity = data.available_quantity;

            const response = await axios.put(
                `${ML_API_URL}/items/${mlItemId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            return {
                success: true,
                ml_id: response.data.id,
                response: response.data
            };

        } catch (error: any) {
            console.log(error);
            console.error("Erro ao atualizar estoque/preço:", JSON.stringify(error.response?.data, null, 2));

            let errorMessage = "Erro ao atualizar estoque/preço no Mercado Livre.";

            if (error.response?.data?.cause) {
                const mlError = error.response.data.cause[0];
                errorMessage = `ML Recusou: ${mlError?.message || mlError} (Código: ${mlError?.code || mlError})`;

                if (mlError.code === "validation_error") {
                    errorMessage += ". Verifique os dados enviados.";
                }
            }

            throw new Error(errorMessage);
        }
    }
}
