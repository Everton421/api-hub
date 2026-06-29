export type LotesSeriesType = {
    codigo: number;
    produto: number;
    lote: string | null;
    serie: string | null;
    data_cadastro: string;
    data_recadastro: string;
};

export type LotesSeriesInput = {
    codigo?: number;
    produto: number;
    lote?: string | null;
    serie?: string | null;
    data_cadastro?: string;
    data_recadastro?: string;
};
