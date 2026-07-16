export type WebhookType = {
    codigo: number;
    cnpj: string;
    url: string;
    eventos: string;
    secret: string;
    ativo: string;
    ultimo_status: number | null;
    ultimo_erro: string | null;
    data_cadastro: string;
    data_recadastro: string;
};
