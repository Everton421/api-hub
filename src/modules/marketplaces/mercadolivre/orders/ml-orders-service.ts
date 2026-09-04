import { InsertOrder } from "../../../../models/order/insert.ts";
import { SelectOrder } from "../../../../models/order/select.ts";
import { UpdateOrder } from "../../../../models/order/update.ts";
import { publishMessage } from "../../../../services/broker/publish-message.ts";
import { type MlOrdersSearchFilters, MlOrdersRequest } from "./ml-orders-request.ts";
import { MlOrdersMapper } from "./ml-orders-mapper.ts";
import { MlBuyerService } from "./ml-buyer-service.ts";
import { MlStatusService } from "./ml-status-service.ts";
import { MlAuthServices } from "../services/auth/ml-auth-services.ts";

export class MlOrdersService {
    private readonly mlAuthServices: MlAuthServices;
    private readonly mlOrdersRequest: MlOrdersRequest;
    private readonly mlOrdersMapper: MlOrdersMapper;
    private readonly mlBuyerService: MlBuyerService;
    private readonly mlStatusService: MlStatusService;

    constructor(mlAuthServices: MlAuthServices) {
        this.mlAuthServices = mlAuthServices;
        this.mlOrdersRequest = new MlOrdersRequest();
        this.mlOrdersMapper = new MlOrdersMapper();
        this.mlBuyerService = new MlBuyerService();
        this.mlStatusService = new MlStatusService();
    }

    /**
     * Busca os IDs de pedidos de um vendedor no Mercado Livre com filtros opcionais.
     * @param cnpj - CNPJ da empresa (tenant).
     * @param systemUserCode - Código do usuário do sistema.
     * @param mlUserId - ID do usuário/seller no Mercado Livre.
     * @param filters - Filtros opcionais (datas, offset, limit).
     * @returns Lista de IDs de pedidos encontrados.
     */
    async fetchOrderIds(cnpj: string, systemUserCode: number, mlUserId: number, filters: MlOrdersSearchFilters = {}): Promise<number[]> {
        const accessToken = await this.mlAuthServices.getValidMlAccessToken(cnpj, systemUserCode, mlUserId);
        return this.mlOrdersRequest.fetchOrderIds(accessToken, mlUserId, filters);
    }

    /**
     * Processa um pedido do Mercado Livre: busca o pedido e o comprador, garante o
     * cliente no banco, converte o pedido para o formato local e insere/atualiza no
     * banco, publicando a mensagem correspondente no broker.
     * @param cnpj - CNPJ da empresa (tenant).
     * @param systemUserCode - Código do usuário do sistema.
     * @param mlUserId - ID do usuário/seller no Mercado Livre.
     * @param mlOrderId - ID do pedido no Mercado Livre.
     */
    async processOrder(cnpj: string, systemUserCode: number, mlUserId: number, mlOrderId: number) {
        const database = `\`${cnpj}\``;

        const accessToken = await this.mlAuthServices.getValidMlAccessToken(cnpj, systemUserCode, mlUserId);

        const mlOrder = await this.mlOrdersRequest.getOrderById(accessToken, mlOrderId);

        const buyerDetails = await this.mlOrdersRequest.getUserById(accessToken, mlOrder.buyer.id);

        const buyerCode = await this.mlBuyerService.findOrCreateBuyer(database, buyerDetails, systemUserCode);

        const localOrder = await this.mlOrdersMapper.mapToLocalOrder(database, mlOrder, buyerCode, systemUserCode);

        const orderExists = await new SelectOrder().existsByExternalIdRef(database, localOrder.id_externo || '', 'V');
        
        const orderExists2 = await new SelectOrder().findexistsByExternalId(database, localOrder.id_externo || '', 'V');

        let codigoPedido: number=0;

        if (orderExists2.length > 0 ) {
            const {data_cadastro, data_recadastro  } = orderExists2[0];
                    const existing = await new SelectOrder().findByExternalIdRef(database, localOrder.id_externo || '', 'V');

                if(new Date(mlOrder.last_updated) > new Date(data_recadastro) ) {
                    await new UpdateOrder().updateByExternalIdRef(database, localOrder, localOrder.id_externo || '', 'V');

                    codigoPedido = existing.length > 0 ? (existing[0].codigo as number) : 0;
                    await publishMessage(cnpj, 'pedido.atualizado', localOrder, 'ml_integration');
                }

        } else {
            const result = await new InsertOrder().create(database, localOrder);
            codigoPedido = result.insertId;
            await publishMessage(cnpj, 'pedido.inserido', { ...localOrder, internalCodigo: result.insertId }, 'ml_integration');
        }

        if (codigoPedido > 0) {
            await this.mlStatusService.registrarStatus(database, codigoPedido, mlOrder);
        }
    }
}
