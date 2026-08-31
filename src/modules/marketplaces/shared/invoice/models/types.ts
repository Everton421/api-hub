export type NfStatusEnvio = 'PENDENTE' | 'ENVIADO' | 'ERRO';

export type NfType = {
    codigo: number;
    chave_acesso: string;
    xml: string;
    pedido_id_externo: string;
    shipment_id: string;
    marketplace: string;
    system_user_code: number;
    ml_user_id: number | null;
    status_envio: NfStatusEnvio;
    tentativas: number;
    erro: string | null;
    data_envio: string | null;
    data_cadastro: string;
    data_recadastro: string;
};

export type NewNf = {
    chave_acesso: string;
    xml: string;
    pedido_id_externo: string;
    shipment_id: string;
    marketplace: string;
    system_user_code: number;
    ml_user_id?: number | null;
};

export type UpdateNfData = Partial<{
    status_envio: NfStatusEnvio;
    tentativas: number;
    erro: string | null;
    data_envio: string | null;
    ml_user_id: number | null;
}>;
