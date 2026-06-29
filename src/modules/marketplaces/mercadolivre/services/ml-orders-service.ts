import axios from "axios";
import { InsertOrder } from "../../../../models/order/insert.ts";
import { SelectOrder } from "../../../../models/order/select.ts";
import { UpdateOrder } from "../../../../models/order/update.ts";
import { InsertClient } from "../../../../models/client/insert.ts";
import { SelectClient } from "../../../../models/client/select.ts";
import { SelectAnuncios } from "../../../../models/anuncios/select.ts";
import { getValidMlAccessToken } from "./ml-auth-service.ts";
import { publishMessage } from "../../../../services/broker/publish-message.ts";
import { type MlOrder, type MlBuyer } from "../types/ml-order-types.ts";
import { type OrderReceivedType, type ProductOrderType, type ParcelOrderType } from "../../../../models/order/types/order-type.ts";

const ML_API_URL = process.env.ML_API_URL || 'https://api.mercadolibre.com';

const ML_STATUS_MAP: Record<string, string> = {
    paid: 'AI',
    confirmed: 'AI',
    cancelled: 'RE',
    pending: 'EA',
    under_review: 'EA',
    partially_paid: 'FP'
};

export class MlOrdersService {
    async processOrder(cnpj: string, systemUserCode: number, mlUserId: number, mlOrderId: number) {
        const database = `\`${cnpj}\``;

        const accessToken = await getValidMlAccessToken(cnpj, systemUserCode, mlUserId);

        const mlOrder = await this.fetchOrderDetails(accessToken, mlOrderId);

        const buyerCode = await this.findOrCreateBuyer(database, mlOrder.buyer, systemUserCode);

        const localOrder = await this.mapToLocalOrder(database, mlOrder, buyerCode);

        const orderExists = await new SelectOrder().existsByExternalId(database, localOrder.id, 'V');

        if (orderExists) {
            await new UpdateOrder().updateByExternalId(database, localOrder, localOrder.id, 'V');
            await publishMessage(cnpj, 'pedido.atualizado', localOrder, 'ml_integration');
        } else {
            const result = await new InsertOrder().create(database, localOrder);
            await publishMessage(cnpj, 'pedido.inserido', { ...localOrder, internalCodigo: result.insertId }, 'ml_integration');
        }
    }

    private async fetchOrderDetails(accessToken: string, orderId: number): Promise<MlOrder> {
        const response = await axios.get(`${ML_API_URL}/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data as MlOrder;
    }

    private async findOrCreateBuyer(database: string, mlBuyer: MlBuyer, sellerCode: number): Promise<number> {
        const selectClient = new SelectClient();
        const insertClient = new InsertClient();

        const buyerName = `${mlBuyer.first_name} ${mlBuyer.last_name}`.trim() || mlBuyer.nickname;

        const existing = await selectClient.findByParams(database, { nome: buyerName });
        if (existing.length > 0 && existing[0].codigo) {
            return existing[0].codigo;
        }

        const phone = `${mlBuyer.phone?.area_code || ''}${mlBuyer.phone?.number || ''}`;
        const now = new Date().toISOString().split('T')[0];

        const result = await insertClient.insert(database, {
            id: String(mlBuyer.id),
            celular: phone,
            nome: buyerName,
            cep: '',
            endereco: '',
            ie: '',
            numero: '',
            cnpj: '',
            cidade: '',
            data_cadastro: now,
            data_recadastro: now,
            vendedor: sellerCode,
            bairro: '',
            estado: '',
            ativo: 'S'
        });

        return result.insertId;
    }

    private async mapToLocalOrder(database: string, mlOrder: MlOrder, buyerCode: number): Promise<OrderReceivedType> {
        const selectAnuncios = new SelectAnuncios();

        const produtos: ProductOrderType[] = [];
        for (const item of mlOrder.order_items) {
            const anuncios = await selectAnuncios.findByParams(database, { id_plataforma: item.item.id });
            const codigoProduto = anuncios.length > 0 ? anuncios[0].codigo_produto : 0;

            produtos.push({
                codigo: codigoProduto,
                preco: item.full_unit_price,
                quantidade: item.quantity,
                desconto: 0,
                total: item.full_unit_price * item.quantity,
                descricao: item.item.title,
                sequencia: 1,
                id: item.item.id
            });
        }

        const parcelas: ParcelOrderType[] = mlOrder.payments.map((p, index) => ({
            pedido: mlOrder.id,
            parcela: index + 1,
            valor: p.transaction_amount,
            vencimento: ''
        }));

        const situacao = (ML_STATUS_MAP[mlOrder.status] || 'EA') as OrderReceivedType['situacao'];
        const dataCadastro = mlOrder.date_created?.split('T')[0] || new Date().toISOString().split('T')[0];
        const dataRecadastro = mlOrder.last_updated?.replace('T', ' ').split('.')[0] || new Date().toISOString().replace('T', ' ').split('.')[0];

        return {
            id: String(mlOrder.id),
            id_externo: String(mlOrder.id),
            id_interno: String(mlOrder.id),
            operacao: 'V',
            situacao,
            situacao_separacao: 'N',
            contato: mlOrder.buyer.nickname,
            descontos: '0',
            frete: String(mlOrder.shipping?.cost || 0),
            forma_pagamento: 1,
            quantidade_parcelas: mlOrder.payments.length,
            total_geral: String(mlOrder.total_amount),
            total_produtos: String(mlOrder.total_amount),
            total_servicos: '0',
            cliente: {
                codigo: buyerCode,
                nome: `${mlOrder.buyer.first_name} ${mlOrder.buyer.last_name}`.trim()
            },
            veiculo: 0,
            data_cadastro: dataCadastro,
            data_recadastro: dataRecadastro,
            tipo_os: 0,
            enviado: 'N',
            tipo: 1,
            observacoes: `Pedido Mercado Livre #${mlOrder.id} - ${mlOrder.buyer.nickname}`,
            produtos,
            servicos: [],
            parcelas
        };
    }
}
