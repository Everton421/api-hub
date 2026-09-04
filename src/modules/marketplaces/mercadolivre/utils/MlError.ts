type MlCause = {
    message?: string;
    code?: string | number;
};

/**
 * Extrai a mensagem de erro amigável retornada pela API do Mercado Livre.
 * A API ML responde com `error.response.data.cause[]` em caso de recusa.
 * @param error erro original (axios error)
 * @param fallback mensagem padrão quando não há resposta estruturada do ML
 * @returns mensagem amigável de erro
 */
export function parseMlErrorMessage(error: unknown, fallback: string): string {
    const response = (error as any)?.response?.data;

    if (response?.cause && Array.isArray(response.cause) && response.cause.length > 0) {
        const mlError: MlCause = response.cause[0];
        const code = mlError?.code !== undefined ? mlError.code : mlError;
        const message = mlError?.message || mlError;
        return `ML Recusou: ${message} (Código: ${code})`;
    }

    return fallback;
}
