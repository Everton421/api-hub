export type InvoicePayload = {
    chaveAcesso: string;
    xmlBase64: string;
    pedidoIdExterno: string;
    shipmentId: string;
};

export type InvoiceSendInput = {
    cnpj: string;
    systemUserCode: number;
    mlUserId: number;
    payload: InvoicePayload;
};

export type InvoiceSendResult = {
    success: boolean;
    shipmentId: string;
    msg: string;
};
