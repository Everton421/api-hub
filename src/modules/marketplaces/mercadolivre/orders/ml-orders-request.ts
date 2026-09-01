import axios from "axios";
import { type MlOrder, type MlUser } from "./types/ml-order-types.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

export type MlOrdersSearchFilters = {
    dateCreatedFrom?: string;
    dateCreatedTo?: string;
    dateUpdatedFrom?: string;
    dateUpdatedTo?: string;
    offset?: number;
    limit?: number;
};

export class MlOrdersRequest {
    /**
     * Busca os detalhes de um pedido do Mercado Livre (GET /orders/:id).
     * @param accessToken - Token de acesso válido da conta ML do vendedor.
     * @param orderId - ID do pedido no Mercado Livre.
     * @returns Pedido completo do Mercado Livre.
     */
    async getOrderById(accessToken: string, orderId: number | string): Promise<MlOrder> {
        const response = await axios.get<MlOrder>(`${ML_API_URL}/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    }

    /**
     * Busca os dados do comprador (usuário) no Mercado Livre (GET /users/:id).
     * @param accessToken - Token de acesso válido da conta ML do vendedor.
     * @param userId - ID do usuário (comprador) no Mercado Livre.
     * @returns Dados do usuário/comprador.
     */
    async getUserById(accessToken: string, userId: number): Promise<MlUser> {
        const response = await axios.get<MlUser>(`${ML_API_URL}/users/${userId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    }

    /**
     * Busca os IDs dos pedidos de um vendedor com filtros opcionais de data,
     * paginando automaticamente (GET /orders/search).
     * @param accessToken - Token de acesso válido da conta ML do vendedor.
     * @param sellerId - ID do vendedor no Mercado Livre.
     * @param filters - Filtros opcionais (datas de criação/atualização, offset, limit).
     * @returns Lista de IDs de pedidos encontrados.
     */
    async fetchOrderIds(accessToken: string, sellerId: number, filters: MlOrdersSearchFilters = {}): Promise<number[]> {
        const orderIds: number[] = [];
        const initialOffset = filters.offset ?? 0;
        const limit = filters.limit ?? 50;
        let offset = initialOffset;
        let total: number | undefined;

        do {
            const params: Record<string, string | number> = {
                seller: sellerId,
                offset,
                limit
            };

            if (filters.dateCreatedFrom) params['order.date_created.from'] = new Date(filters.dateCreatedFrom).toISOString();
            if (filters.dateCreatedTo) params['order.date_created.to'] = new Date(filters.dateCreatedTo).toISOString();
            if (filters.dateUpdatedFrom) params['order.date_last_updated.from'] = new Date(filters.dateUpdatedFrom).toISOString();
            if (filters.dateUpdatedTo) params['order.date_last_updated.to'] = new Date(filters.dateUpdatedTo).toISOString();

            const response = await axios.get<{ results: { id: number }[]; paging: { total: number; offset: number; limit: number } }>(`${ML_API_URL}/orders/search`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params
            });

            const data = response.data;
            for (const result of data.results) {
                orderIds.push(result.id);
            }

            total = data.paging?.total;
            offset += limit;

            if (total !== undefined && offset >= total) {
                break;
            }
        } while (true);

        return orderIds;
    }
}
