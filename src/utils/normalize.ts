/**
 * Remove todos os caracteres não numéricos de uma string.
 * @param value - String original (ex.: CPF/CNPJ/telefone com máscara).
 * @returns Somente os dígitos da string; string vazia se ausente.
 */
export function onlyDigits(value?: string): string {
    if (!value) return '';
    return value.replace(/\D/g, '');
}

/**
 * Normaliza um CNPJ/CPF removendo máscara, mantendo apenas os dígitos.
 * @param value - CNPJ/CPF com ou sem máscara (ex.: '12.345.678/0001-90').
 * @returns CNPJ/CPF somente com dígitos; string vazia se ausente.
 */
export function normalizeCnpj(value?: string): string {
    return onlyDigits(value);
}

/**
 * Normaliza um telefone concatenando DDD e número sem caracteres especiais.
 * @param areaCode - Código de área/DDD.
 * @param number - Número do telefone.
 * @returns Telefone concatenado somente com dígitos.
 */
export function normalizePhone(areaCode?: string, number?: string): string {
    const area = onlyDigits(areaCode);
    const num = onlyDigits(number);
    return `${area}${num}`;
}

/**
 * Normaliza um estado para o formato de 2 letras (ex.: 'BR-SP' → 'SP').
 * @param value - Estado como retornado pelo Mercado Livre (ex.: 'BR-SP').
 * @returns Sigla do estado em caixa alta (2 caracteres); string vazia se ausente.
 */
export function normalizeState(value?: string): string {
    if (!value) return '';
    const clean = value.trim().toUpperCase();
    if (clean.length <= 2) return clean;
    return clean.slice(-2);
}

/**
 * Monta um endereço a partir de partes, unindo as não vazias com vírgula.
 * @param parts - Partes do endereço (rua, linha, número, complemento).
 * @returns Endereço concatenado; string vazia se nenhuma parte presente.
 */
export function normalizeAddress(parts: Array<string | undefined>): string {
    return parts.filter(Boolean).join(', ');
}
