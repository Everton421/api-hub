export type PerfilType = {
    codigo: number;
    id: string;
    nome: string;
    data_cadastro: string;
    data_recadastro: string;
    ativo: string;
};

export type PerfilWithPermissoes = PerfilType & {
    permissoes: PermissaoType[];
};

export type PermissaoType = {
    codigo: number;
    id: string;
    descricao: string;
    data_cadastro: string;
    data_recadastro: string;
    ativo: string;
};

export type NewPerfil = {
    id: string;
    nome: string;
    data_cadastro: string;
    data_recadastro: string;
    ativo: string;
};

export type UpdatePerfil = {
    codigo: number;
    id: string;
    nome: string;
    data_cadastro: string;
    data_recadastro: string;
    ativo: string;
};
