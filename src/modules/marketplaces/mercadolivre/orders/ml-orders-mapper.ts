import { SelectAnuncios } from "../../../../models/anuncios/select.ts";
import { DateService } from "../../../../utils/dateService.ts";
import { derivarSituacao } from "../../../../services/StatusMarketplace.ts";
import { type MlOrder } from "./types/ml-order-types.ts";
import { type OrderReceivedType, type ProductOrderType, type ParcelOrderType } from "../../../../models/order/types/order-type.ts";

export class MlOrdersMapper {
    /**
     * Converte um pedido do Mercado Livre para o formato de pedido local do sistema.
     * @param database - Nome do banco da empresa (tenant).
     * @param mlOrder - Pedido recebido do Mercado Livre.
     * @param buyerCode - Código do cliente (comprador) no banco local.
     * @param systemUserCode - Código do usuário do sistema responsável.
     * @returns Pedido no formato local (OrderReceivedType).
     */
    async mapToLocalOrder(database: string, mlOrder: MlOrder, buyerCode: number, systemUserCode: number): Promise<OrderReceivedType> {
        const selectAnuncios = new SelectAnuncios();

        const produtos: ProductOrderType[] = [];
        for (const item of mlOrder.order_items) {
            const anuncios = await selectAnuncios.findByParams(database, { id_plataforma: item.item.id });
            const codigoProduto = anuncios.length > 0 ? anuncios[0].codigo_produto : 0;

            produtos.push({
                codigo: codigoProduto,
                preco: item.unit_price,
                quantidade: item.quantity,
                desconto: 0,
                total: item.unit_price * item.quantity,
                descricao: item.item.title,
                sequencia: 1,
                id: item.item.id
            });
        }

        const dateService = new DateService();
        const parcelas: ParcelOrderType[] = mlOrder.payments.map((p, index) => ({
            pedido: mlOrder.id,
            parcela: index + 1,
            valor: p.transaction_amount,
            vencimento: dateService.obterDataAtual()
        }));

        const situacao = derivarSituacao('ML', mlOrder.status);
        const dataCadastro = mlOrder.date_created?.split('T')[0] || new Date().toISOString().split('T')[0];
        const dataRecadastro = mlOrder.last_updated?.replace('T', ' ').split('.')[0] || new Date().toISOString().replace('T', ' ').split('.')[0];

        return {
            id: '0',
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
            parcelas,
            vendedor: systemUserCode,
            usuario: systemUserCode,
            usuario_separacao: 0,
            inicio_separacao: '2000-01-01 00:00:00',
            fim_separacao: '2000-01-01 00:00:00',
            status_separacao: 'NAO INICIADA',
            filial: 0,
            marketplace: 'ML'
        };
    }
}
