export type formaPagamentoBanco ={ 
    codigo:number,
    id:number,
    descricao:string,
    desc_maximo:number,
    parcelas:number,
    intervalo:number,
    recebimento:number,
    data_cadastro:string,
    data_recadastro:string
    ativo:string
}
export type queryFpgt= {
            codigo:number,
            id:number,
            limit:number,
            descricao:string,
            parcelas:number,
            ativo:string,
}