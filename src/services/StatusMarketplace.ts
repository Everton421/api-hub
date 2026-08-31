import { type Situacao } from "./SituacaoPermissao.ts";

export type CategoriaStatus = 'pedido' | 'pagamento' | 'frete';

export interface MarketplaceStatusMap {
    sigla: string;
    nome: string;
    mapeamento: Record<string, Situacao>;
    fallback: Situacao;
}

export const MAPS_MARKETPLACE: Record<string, MarketplaceStatusMap> = {
    ML: {
        sigla: 'ML',
        nome: 'Mercado Livre',
        mapeamento: {
            paid: 'AI',
            confirmed: 'AI',
            cancelled: 'RE',
            pending: 'EA',
            under_review: 'EA',
            partially_paid: 'FP',
            nulled: 'RE',
            partially_refunded: 'EA',
            in_mediation: 'EA',
            closed: 'AI'
        },
        fallback: 'EA'
    }
};

export function getMarketplaceMap(marketplace: string): MarketplaceStatusMap | undefined {
    return MAPS_MARKETPLACE[marketplace?.toUpperCase()];
}

export function derivarSituacao(marketplace: string, status: string): Situacao {
    const map = getMarketplaceMap(marketplace);
    if (!map) return 'EA';
    return map.mapeamento[status] || map.fallback;
}

export function listarCategoriasStatus(): CategoriaStatus[] {
    return ['pedido', 'pagamento', 'frete'];
}
