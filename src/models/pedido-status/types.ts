import { type Situacao } from "../../services/SituacaoPermissao.ts";

export type CategoriaStatus = 'pedido' | 'pagamento' | 'frete';

export type PedidoStatusType = {
    id?: number;
    pedido: number;
    marketplace: string;
    categoria: CategoriaStatus;
    status_origem: string | null;
    status_detail: string | null;
    tags: string | null;
    situacao: Situacao | null;
    data_evento: string | null;
    payload_raw: string | null;
    data_cadastro?: string;
    data_recadastro?: string;
};
