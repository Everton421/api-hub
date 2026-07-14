export type Requirements = {
    codigo: number
    data_requerimento: string
    requerente: number
    data_efetuacao: string
    responsavel: number
    pedido: number | null
    setor_origem: number
    setor_destino: number
    historico: string
    situacao: 'A' | 'C' | 'E'
}

export type ProdutoRequerimento = {
    requerimento: number
    produto: number
    quantidade: number
    custo: number | null
    descricao:string
}

export type LoteSerieRequerimento = {
    requerimento: number
    produto: number
    lote_serie: number
    quantidade: number
}