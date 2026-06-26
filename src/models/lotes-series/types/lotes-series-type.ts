export type LotesSeriesType = {
    codigo?: number;
    produto: number;
    lote: string | null;
    serie: string | null;
};

export type LotesSeriesInput = {
    codigo?: number;
    produto: number;
    lote?: string | null;
    serie?: string | null;
};
