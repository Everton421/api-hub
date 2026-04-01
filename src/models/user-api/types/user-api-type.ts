export type UserApi = {
    codigo: number;
    nome: string;
    email: string;
    cnpj: string;
    senha: string;
    responsavel: string;
    telefone: string;
    cod_recuperador?: number;
    data_expiracao?: string;
};

export type NewUserApi = Omit<UserApi, "codigo" | "cod_recuperador" | "data_expiracao">;

export type UserApiRecoveryCode = {
    email: string;
    recoveryCode: number;
    expirationDate: string;
};
