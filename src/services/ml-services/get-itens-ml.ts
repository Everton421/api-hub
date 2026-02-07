import axios from "axios";
import { getValidAccessToken } from "../integration/mercadolivre-integration/ml-auth-service"; // Importe do arquivo que criamos antes

const ML_API_URL = 'https://api.mercadolibre.com';

export class GetMlItemsService {

    async getItemsFromSeller(cnpj: string, systemUserCode: number, mlUserId: number) {
        try {
            // 1. GARANTE O TOKEN (Se estiver vencido, ele renova sozinho aqui)
            const accessToken = await getValidAccessToken(cnpj, systemUserCode, mlUserId);

            // 2. Busca os IDs dos itens do vendedor
            // Endpoint: /users/{id}/items/search
            const searchResponse = await axios.get(`${ML_API_URL}/users/${mlUserId}/items/search`, {
                headers: { Authorization: `Bearer ${accessToken}` },

                params: {
                    limit: 5, // Vamos pegar só 5 para testar
                    status: 'active' // Opcional: pegar só os ativos
                }
            });

            const itemIds = searchResponse.data.results; // Array de IDs: ["MLB123", "MLB456"]

            if (itemIds.length === 0) {
                return { message: "Nenhum anúncio encontrado nesta conta.", items: [] };
            }

            // 3. (BÔNUS) Busca os detalhes desses itens (Multiget)
            // Endpoint: /items?ids=MLB123,MLB456
            const itemsResponse = await axios.get(`${ML_API_URL}/items`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    ids: itemIds.join(',') // Transforma array em string separada por virgula
                }
            });

            // Mapeia para devolver um JSON limpo
            const itemsDetails = itemsResponse.data.map((i: any) => ({
                id: i.body.id,
                title: i.body.title,
                price: i.body.price,
                quantity: i.body.available_quantity,
                permalink: i.body.permalink,
                thumbnail: i.body.thumbnail
            }));

            return {
                seller_id: mlUserId,
                total_found: searchResponse.data.paging.total,
                items: itemsDetails
            };

        } catch (error: any) {
            console.error("Erro ao buscar itens:", error.response?.data || error.message);
            throw new Error("Falha ao buscar itens no Mercado Livre");
        }
    }
}