export type ProductSectorType = {
    setor: number;
    produto: number;
    estoque: number;
    local_produto: string | null;
    local1_produto: string| null;
    local2_produto: string| null;
    local3_produto: string| null;
    local4_produto: string| null;
    data_recadastro: string;
    id_produto: string;
    id_setor: string;
};

export type GroupedSetorType = {
    codigo: number;
    descricao: string;
    ativo: string;
    id: string;
    estoque: number;
    local_produto: string | null;
    local1_produto: string | null;
    local2_produto: string | null;
    local3_produto: string | null;
    local4_produto: string | null;
};

export type GroupedProductSectorType = {
    produto: {
        codigo: number;
        descricao: string;
        id: string;
        controle_lote_serie: 'S' | 'N'
    };
    setor: GroupedSetorType[];
};