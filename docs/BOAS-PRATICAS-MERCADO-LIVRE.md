# ✅ Melhorias referentes às Boas Práticas da Plataforma Mercado Livre

**Fonte:** [Boas práticas para usar a plataforma — Mercado Livre Developers](https://developers.mercadolivre.com.br/pt_br/boas-praticas-para-usar-a-plataforma)

**Objetivo:** aplicar no projeto `hub-api` as recomendações oficiais do Mercado Livre para evitar **penalizações/sanções** nas contas de vendedores e garantir uso saudável da API.

> Documento de aplicação manual (fins de aprendizado). Foque nas melhorias mais relevantes ao contexto do projeto (integração de anúncios/items).

---

## 📌 Resumo das boas práticas oficiais e onde se aplicam

| Boa prática oficial | Relevância no projeto | Status atual |
|---|---|---|
| Rate limit / erro 429 | **Alta** — updates em loop podem gerar rajadas | ❌ Não tratado |
| Evitar ações massivas nas contas | **Alta** — `syncProductByCode` itera todos os anúncios | ❌ Sem throttle |
| Não fazer web crawling | Baixa | ✅ Via API |
| Limitar IPs do ambiente | Média (deploy/config) | ⚠️ Depende do ambiente |
| Enviar só campos alterados | **Alta** — payload parcial | ✅ Já decidido |
| Enviar campos válidos / respeitar validações | Média | ⚠️ Parcial |

---

## ⚙️ MELHORIA 1 — Tratamento de rate limit (erro 429) com retry/backoff

**Boas práticas oficial citada:**
> "Considere que existem limites de requisições em alguns endpoints, ou seja, deverá identificar o erro **429** recebido em sua integração e **diminuir e/ou melhorar a distribuição** de requisições realizadas ao longo do tempo."

**Onde:** `src/services/lib/api-client.ts`

Este é o adaptador HTTP usado por **todo** o módulo ML (create, update, orders). Centralizar aqui garante que todos os fluxos respeitem os limites.

**O que fazer:**

1. Aceitar opções de retry no construtor (com padrões):
   - `maxRetries` (padrão `3`)
   - `baseDelayMs` (padrão `500`)

2. Criar helper privado que:
   - Detecta `429` (e também `503` / timeout / `ECONNRESET` como retryáveis).
   - Se existir, respeita o header `Retry-After` da resposta do ML.
   - Caso contrário, aplica **backoff exponencial com jitter** (evita "efeito thundering herd").
   - Tenta até `maxRetries` e então propaga o erro.

```ts
private async requestWithRetry<T>(config: AxiosRequestConfig, retries: number = this.maxRetries): Promise<AxiosResponse<T>> {
    try {
        return await this.client.request<T>(config);
    } catch (error: any) {
        const status = error?.response?.status;
        const isRetryable = status === 429 || status === 503 || error?.code === 'ECONNABORTED';
        if (!isRetryable || retries <= 0) throw error;

        const retryAfter = Number(error?.response?.headers?.['retry-after']);
        const delayMs = retryAfter
            ? retryAfter * 1000
            : this.baseDelayMs * Math.pow(2, this.maxRetries - retries) + Math.random() * 100;

        await new Promise(res => setTimeout(res, delayMs));
        return this.requestWithRetry(config, retries - 1);
    }
}
```

3. Fazer `get`/`post`/`put`/`patch` usarem o `requestWithRetry`.

> ⚠️ **Nota:** o `api-client.ts` já tem um erro de tipo pré-existente com os types do axios (`AxiosInstance`/`AxiosRequestConfig`/`AxiosResponse` não resolvem). Ajuste o import se necessário (ex.: `import axios from "axios"` e `axios.AxiosInstance`).

---

## ⚙️ MELHORIA 2 — Limitar taxa entre requisições massivas (throttle)

**Boas práticas oficial (contexto geral):**
> As ações têm um impacto grande quando se executam **ações massivas** nas contas dos vendedores; o mau uso pode gerar sanções.

**Onde:** `src/modules/marketplaces/mercadolivre/announcement/update-announcement/sync-ml-announcement-service.ts` — método `syncProductByCode`.

Como ele atualiza **todos os anúncios** de um produto em um loop, insira um pequeno `delay` **entre** iterações para distribuir as requisições ao longo do tempo:

```ts
for (let i = 0; i < dataAnnouncementToUpdate.length; i++) {
    if (i > 0) await delay(150); // 150ms entre anúncios
    try {
        await this.updateSingleAnnouncement(cnpj, dbName, dataAnnouncementToUpdate[i]);
        result.atualizados++;
    } catch (e) {
        result.falhas++;
        result.msgs.push(e instanceof Error ? e.message : String(e));
    }
}
```

> ⚠️ **Atenção ao `delay` existente** (`src/services/delay-service/delay.ts`): ele **divide por 1000** (espera `ms/1000` segundos e loga "Aguardando X segundos") — bug latente. Recomendado corrigir ou criar um `sleep(ms)`:
> ```ts
> export function sleep(ms: number) {
>     return new Promise((resolve) => setTimeout(resolve, ms));
> }
> ```

> O fluxo de atualizar **um único anúncio** (por `id_plataforma`) não precisa de throttle (é 1 requisição), mas herda a resiliência a 429 da MELHORIA 1.

---

## ⚙️ MELHORIA 3 — Enviar apenas os campos que foram alterados (payload parcial)

**Boas práticas (contexto):**
> Evitar chamadas desnecessárias e modificar apenas o necessário, minimizando impacto na conta do vendedor.

**Onde:** rota nova de update único + consumo no `updateItem`.

- O front envia **só os campos editados** no body (cada campo opcional).
- O `UpdateMlAnnouncement.updateItem` já filtra campos e envia à API apenas os definidos (`buildMlPayload`).
- **Benefício:** evita `PUT` completo desnecessário e reduz chance de erro de validação direcionada a campos não alterados.

**Exemplo do que NÃO fazer:** enviar sempre todos os campos, mesmo os que não mudaram. **Faça:** enviar somente o que foi editado.

---

## ⚙️ MELHORIA 4 — Tratar e expor os erros de validação do ML

**Boas práticas (contexto):** a plataforma devolve erros com estrutura `cause[]` (código + mensagem) ao rejeitar uma atualização (ex.: categoria exige atributos). Esse retorno deve alimentar o usuário com mensagem clara.

**Onde:** já coberto por `src/modules/marketplaces/mercadolivre/utils/MlError.ts` (`parseMlErrorMessage`) usado no `update-ml-announcement.ts` e no `create-ml-announcement-service.ts`.

**Boa prática adicional — caso de uso concreto:**
- Ao receber `validation_error`, indicar ao vendedor que é preciso revisar atributos obrigatórios, medidas (moda), compatibilidades (autopeças), etc.
- Não "engolir" o erro; propagar com a mensagem amigável para o front exibir.

---

## ⚙️ MELHORIA 5 — Itens de catálogo / regras por tipo de produto

**Boas práticas oficiais:**
> - Itens elegíveis para **catálogo** devem ser publicados em catálogo (ou opt-in).
> - Itens de **autopeças** sempre devem ter **compatibilidades** associadas.
> - Itens de **moda** devem usar **tabela de medidas**.

**Onde:** relevante para o fluxo de **criação** de anúncio (`create-ml-announcement-service.ts`), mais do que para edição.

**Ação recomendada (criação):**
- Antes de publicar, consultar se o item deve ir para catálogo e, se sim, usar o fluxo certo (ou avisar o vendedor).
- Garantir que o payload de criação inclua `attributes` obrigatórios conforme a categoria e, quando aplicável, compatibilidades (autopeças) e tabela de medidas (moda).

> *Fora do escopo imediato do update, mas importante para não gerar sanções na criação.*

---

## ⚙️ MELHORIA 6 — Limitar IPs do ambiente (deploy/config)

**Boas práticas oficiais:**
> É recomendável **limitar os IPs** de seu ambiente para utilizar o access token de sua aplicação.

**Onde:** `docker/` e configuração de rede/deploy (PM2, Docker, firewall/security group).

**O que fazer:**
- Configurar allowlist de IPs de produção no Mercado Livre (painel da aplicação).
- Restringir o acesso ao `BROKER_URL`/DB para IPs confiáveis.
- Usar HTTPS (o projeto já suporta via `PATH_CERT_KEY`/`PATH_CERT_CERT`).

---

## ⚙️ MELHORIA 7 — Não usar web crawling

**Boas práticas oficiais:**
> Não fazer web crawling, e sim sempre trabalhar com a API de MeLi.

**Onde:** regra de engenharia. **Status atual:** ✅ o projeto já usa apenas a API (`ApiClient` / `ML_API_URL`). Manter assim.

---

## ✅ Checklist de verificação

- [ ] `ApiClient` trata `429`/`503` com retry e backoff (+ `Retry-After`).
- [ ] `syncProductByCode` aplica throttle (`delay`) entre anúncios.
- [ ] Update de anúncio envia apenas campos alterados (payload parcial).
- [ ] Erros `validation_error` do ML resultam em mensagem clara ao usuário.
- [ ] (Criação) catálogo / compatibilidades / medidas considerados.
- [ ] IPs do ambiente restringidos em produção.
- [ ] Nenhum web crawling; só API oficial.

---

## ⚠️ Referências oficiais relacionadas

- [Boas práticas para usar a plataforma](https://developers.mercadolivre.com.br/pt_br/boas-praticas-para-usar-a-plataforma)
- [Erro 403](https://developers.mercadolivre.com.br/pt_br/erro-403)
- [Mocks para mensagens por vendas de itens Full](https://developers.mercadolivre.com.br/pt_br/mocks-para-mensagens-por-vendas-de-itens-full)
- [Compatibilidades autopeças](https://developers.mercadolivre.com.br/pt_br/compatibilidades-entre-itens-e-produtos-de-autopecas)
- [Tabelas de medidas (moda)](https://developers.mercadolivre.com.br/pt_br/tabelas-de-medidas)
- [O catálogo chegou — como adaptar sua integração](https://developers.mercadolivre.com.br/pt_br/o-catalogo-chegou-saiba-como-adaptar-sua-integracao)
