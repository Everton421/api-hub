export type OrderType = {
    codigo: number;
    id: number;
    id_externo: number;
    id_interno: string;
    vendedor: number;
    situacao: string;
    situacao_separacao: string;
    contato: string;
    descontos: number;
    frete: number;
    forma_pagamento: number;
    quantidade_parcelas: number;
    total_geral: number;
    total_produtos: number;
    total_servicos: number;
    cliente: number;
    veiculo: number;
    data_cadastro: string;
    data_recadastro: string;
    tipo_os: number;
    enviado: string;
    tipo: number;
    observacoes: string;
};

export type OrderReceivedType = {
    codigo: number;
    id: number;
    id_externo?: number;
    id_interno?: string;
    vendedor?: number;
    situacao?: string;
    situacao_separacao?: string;
    contato?: string;
    descontos?: number;
    frete?: number;
    forma_pagamento?: number;
    quantidade_parcelas?: number;
    total_geral?: number;
    total_produtos?: number;
    total_servicos?: number;
    totalSemDesconto?: number;
    cliente?: {
        codigo: number;
        nome?: string;
    };
    veiculo?: number;
    data_cadastro?: string;
    data_recadastro?: string;
    tipo_os?: number;
    enviado?: string;
    tipo?: number;
    observacoes?: string;
    observacoes2?: string;
    just_ipi?: string;
    just_icms?: string;
    just_subst?: string;
    produtos: ProductOrderType[];
    servicos: ServiceOrderType[];
    parcelas: ParcelOrderType[];
};

export type ProductOrderType = {
    codigo: number;
    preco: number;
    quantidade: number;
    desconto: number;
    total: number;
    frete?: number;
    quantidade_separada?: number;
    quantidade_faturada?: number;
};

export type ServiceOrderType = {
    codigo: number;
    preco: number;
    quantidade: number;
    desconto: number;
    total: number;
    valor: number;
};

export type ParcelOrderType = {
    pedido: number;
    parcela: number;
    valor: number;
    vencimento: string;
};
