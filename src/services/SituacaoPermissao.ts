export type Situacao = 'EA' | 'AI' | 'FI' | 'FP' | 'RE' | 'BM';

export type SituacaoVisivel = {
    situacao: Situacao;
    descricao: string;
};

export const VER_TODOS_PERMISSAO = 'pedidos.ver_todos';

export const PERMISSAO_SITUACAO: Record<string, Situacao> = {
    'pedidos.ver_em_aberto': 'EA',
    'pedidos.ver_aprovados': 'AI',
    'pedidos.ver_faturados': 'FI',
    'pedidos.ver_faturados_parcialmente': 'FP',
    'pedidos.ver_cancelados': 'RE',
    'pedidos.ver_baixados': 'BM'
};

export const SITUACAO_DESCRICAO: Record<Situacao, string> = {
    EA: 'Em aberto/orçamento',
    AI: 'Aprovado',
    FI: 'Faturado integralmente',
    FP: 'Faturado parcialmente',
    RE: 'Cancelado/Recusado',
    BM: 'Baixado manualmente'
};

export const TODAS_SITUACOES: Situacao[] = ['EA', 'AI', 'FI', 'FP', 'RE', 'BM'];

export function temPermissaoVerTodos(permissaoIds: string[]): boolean {
    return permissaoIds.includes(VER_TODOS_PERMISSAO);
}

export function derivarSituacoes(permissaoIds: string[]): SituacaoVisivel[] {
    if (temPermissaoVerTodos(permissaoIds)) {
        return TODAS_SITUACOES.map(situacao => ({ situacao, descricao: SITUACAO_DESCRICAO[situacao] }));
    }

    const situacoes = permissaoIds
        .map(id => PERMISSAO_SITUACAO[id])
        .filter((s): s is Situacao => s !== undefined);

    return situacoes.map(situacao => ({ situacao, descricao: SITUACAO_DESCRICAO[situacao] }));
}
