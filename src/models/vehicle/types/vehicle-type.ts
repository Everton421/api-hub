export type VehicleType = {
    codigo: number;
    id: string;
    cliente: number;
    placa: string;
    marca: string;
    modelo: string;
    ano: string;
    cor: string;
    combustivel: string;
    data_cadastro: string;
    data_recadastro: string;
    ativo: string;
};

export type VehicleInsert = Omit<VehicleType, 'codigo'>;
