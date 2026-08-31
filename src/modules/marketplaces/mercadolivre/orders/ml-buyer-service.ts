import { InsertClient } from "../../../../models/client/insert.ts";
import { SelectClient } from "../../../../models/client/select.ts";
import { UpdateClient } from "../../../../models/client/update.ts";
import { type ClientType } from "../../../../models/client/types/client-type.ts";
import { type MlUser } from "./types/ml-order-types.ts";
import { normalizeCnpj, normalizePhone, normalizeState, normalizeAddress } from "../../../../utils/normalize.ts";

export class MlBuyerService {
    /**
     * Localiza o cliente pelo CNPJ/CPF normalizado ou cria um novo, atualizando os dados
     * quando o cliente já existe. O campo `id` é mantido como '0' (default), pois é usado
     * por outra integração.
     * @param database - Nome do banco da empresa (tenant).
     * @param buyer - Dados do comprador vindos do Mercado Livre.
     * @param sellerCode - Código do vendedor no banco local.
     * @returns Código do cliente no banco local.
     */
    async findOrCreateBuyer(database: string, buyer: MlUser, sellerCode: number): Promise<number> {
        const selectClient = new SelectClient();
        const insertClient = new InsertClient();
        const updateClient = new UpdateClient();

        const cnpj = normalizeCnpj(buyer.identification?.number);
        const buyerName = `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() || buyer.nickname;
        const phone = normalizePhone(buyer.phone?.area_code, buyer.phone?.number);
        const now = new Date().toISOString().split('T')[0];
        const nowDatetime = new Date().toISOString().replace('T', ' ').split('.')[0];

        if (cnpj) {
            const byCnpj = await selectClient.findByCnpjNormalized(database, cnpj);
            if (byCnpj.length > 0 && byCnpj[0].codigo != null) {
                const existing = byCnpj[0];
                const existingCode: number = existing.codigo as number;
                this.updateIfNeeded(database, updateClient, existing, {
                    cnpj,
                    celular: phone || existing.celular,
                    nome: buyerName || existing.nome,
                    cidade: buyer.address?.city || existing.cidade || '',
                    estado: normalizeState(buyer.address?.state) || existing.estado || '',
                    bairro: existing.bairro || '',
                    cep: buyer.address?.zip_code || existing.cep || '',
                    endereco: this.buildAddress(buyer) || existing.endereco || '',
                    numero: existing.numero || ''
                });
                return existingCode;
            }
        }

        const result = await insertClient.insert(database, {
            id: '0',
            celular: phone,
            nome: buyerName,
            cep: buyer.address?.zip_code || '',
            endereco: this.buildAddress(buyer),
            ie: '',
            numero: '',
            cnpj: cnpj || '',
            cidade: buyer.address?.city || '',
            data_cadastro: now,
            data_recadastro: nowDatetime,
            vendedor: sellerCode,
            bairro: '',
            estado: normalizeState(buyer.address?.state),
            ativo: 'S'
        });

        return result.insertId;
    }

    /**
     * Monta a string de endereço do comprador a partir dos dados do Mercado Livre.
     * @param buyer - Dados do comprador.
     * @returns Endereço concatenado.
     */
    private buildAddress(buyer: MlUser): string {
        return normalizeAddress([
            buyer.address?.street_name,
            buyer.address?.address_line,
            buyer.address?.street_number,
            buyer.address?.comment
        ]);
    }

    /**
     * Mescla os dados novos com os do cliente existente e persiste as mudanças.
     * Mantém os valores atuais quando um campo não é informado.
     * @param database - Nome do banco da empresa (tenant).
     * @param updateClient - Modelo de atualização de cliente.
     * @param existing - Cliente existente no banco.
     * @param data - Dados novos a aplicar.
     */
    private updateIfNeeded(database: string, updateClient: UpdateClient, existing: ClientType, data: Partial<ClientType>): void {
        const merged: ClientType = {
            codigo: existing.codigo,
            id: data.id ?? existing.id,
            celular: data.celular ?? existing.celular,
            nome: data.nome ?? existing.nome,
            cep: data.cep ?? existing.cep,
            endereco: data.endereco ?? existing.endereco,
            ie: existing.ie || '',
            numero: data.numero ?? existing.numero,
            cnpj: data.cnpj ?? existing.cnpj,
            cidade: data.cidade ?? existing.cidade,
            data_cadastro: existing.data_cadastro,
            data_recadastro: existing.data_recadastro || '2000-01-01 00:00:00',
            vendedor: existing.vendedor,
            bairro: data.bairro ?? existing.bairro,
            estado: data.estado ?? existing.estado,
            ativo: existing.ativo || 'S'
        };
        updateClient.update(database, merged);
    }
}
