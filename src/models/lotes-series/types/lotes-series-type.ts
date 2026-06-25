export type LotesSeriesType = {
    codigo: number;
    produto: number;
    lote: string | null;
    serie: string | null;
};

export type LotesSeriesInput = {
    produto: number;
    lote?: string | null;
    serie?: string | null;
};
