export type UserCompany = {
    codigo: number;
    nome: string;
    email: string;
    cnpj: string;
    senha: string;
    responsavel: string;
    ativo: 'S' | 'N';
    tipo_contrato?: string;
    data_contrato?: string;
    dias_contrato?: number;
};

export type NewUserCompany = Omit<UserCompany, "codigo" | "tipo_contrato" | "data_contrato" | "dias_contrato">;

export type UserCompanyQuery = {
    codigo?: number;
    limit?: number;
};
