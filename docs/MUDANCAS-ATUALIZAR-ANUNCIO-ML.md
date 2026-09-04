# 📄 Mudanças — Rota de Atualização de Anúncio no Mercado Livre

**Objetivo:** implementar a atualização de **um anúncio específico** no Mercado Livre, por `id_plataforma`, recebendo no **body os mesmos campos da rota de atualização do banco** (`PUT /ml/app/anuncios/update/:id`), com **payload parcial** (só os campos enviados são atualizados), persistindo no banco **e** enviando ao ML — incorporando as **boas práticas da plataforma ML** (tratamento de 429/rate-limit).

> Documento para aplicação **manual** (com fins de aprendizado). Siga as mudanças na ordem apresentada.

---

## 📁 Arquivos envolvidos

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `src/services/lib/api-client.ts` | **Editar** — tratamento de 429 (rate limit) com retry/backoff |
| 2 | `src/modules/marketplaces/mercadolivre/announcement/update-announcement/sync-ml-announcement-service.ts` | **Editar** — novo método `updateByIdPlataforma` + throttle no `syncProductByCode` + novas deps |
| 3 | `src/modules/marketplaces/mercadolivre/announcement/update-announcement/announcement-composer.ts` | **Editar** — passar novas dependências ao serviço |
| 4 | `src/modules/marketplaces/mercadolivre/announcement/routes/ml-announcement-update.ts` | **Criar** — nova rota |
| 5 | `src/app-routes.ts` | **Editar** — registrar a rota |

---

## ⚙️ MUDANÇA 1 — `src/services/lib/api-client.ts`: tratar 429 (rate limit) com retry

**Motivo (boa prática ML):** a plataforma recomenda identificar o erro **429** e "diminuir e/ou melhorar a distribuição de requisições ao longo do tempo". O `ApiClient` é o adaptador HTTP usado por **todo** o módulo ML; centralizar aqui beneficia create, update e orders.

**O que fazer:**

1. No construtor, aceitar opções de retry (com padrões):
   - `maxRetries` (padrão `3`)
   - `baseDelayMs` (padrão `500`)

2. Criar um helper privado `requestWithRetry(url, method, config, data)` que:
   - Executa a chamada via `client[method](...)`.
   - No `catch`, se `error.response.status === 429` (ou `503`, ou timeout), lê o header `Retry-After` se existir; senão usa **backoff exponencial com jitter**.
   - Tenta até `maxRetries`; depois propaga o erro original.
   - Reaplica o header `Authorization` a cada tentativa (o axios `client` já o mantém).

3. Envolver `get`, `post`, `put`, `patch` no `requestWithRetry`.

**Exemplo (pseudo-código):**
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

> Atualize `get`/`post`/`put`/`patch` para usar `this.requestWithRetry({ url, method, data, ...config })`.

---

## ⚙️ MUDANÇA 2 — `sync-ml-announcement-service.ts`

### 2.1 Novo construtor (injeção de dependências)

Adicionar `SelectUsersMlIntegrations` e `UpdateAnuncios` ao construtor:

```ts
private readonly selectUsersMl: SelectUsersMlIntegrations;
private readonly updateAnuncios: UpdateAnuncios;

constructor(
    apiClientFactory: ApiClientFactory,
    mappingAnnouncementByProduct: MappingAnnouncementByProduct,
    updateLocalMlAnnouncement: UpdateLocalMlAnnouncement,
    selectAnuncios: SelectAnuncios,
    selectUsersMl: SelectUsersMlIntegrations,   // NOVO
    updateAnuncios: UpdateAnuncios              // NOVO
) {
    ...
}
```

> Imports necessários no topo do arquivo:
> ```ts
> import { SelectUsersMlIntegrations } from "../../../../../models/users-ml-integration/select-users-ml-integration.ts";
> import { UpdateAnuncios } from "../../../../../models/anuncios/update.ts";
> ```

### 2.2 Throttle no `syncProductByCode` (boa prática: evitar rajadas massivas)

No loop `for (const announcement of dataAnnouncementToUpdate)` — **se houver mais de 1 anúncio**, aguardar um `delay` pequeno **entre** iterações:

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

> ⚠️ **Atenção ao `delay`:** o utilitário `src/services/delay-service/delay.ts` **divide por 1000** (espera `ms/1000` segundos e loga "Aguardando X segundos"). É um **bug latente**. Recomendo corrigir o `delay` para usar a unidade certa ou criar um `sleep(ms)` simples:
> ```ts
> // src/services/delay-service/delay.ts (corrigido)
> export function delay(ms: number) {
>     return new Promise((resolve) => setTimeout(resolve, ms));
> }
> ```

### 2.3 Novo método `updateByIdPlataforma` (dirigido pelo body do front end)

Este fluxo é **dirigido pelo body recebido** (não reidrata do banco). Persiste o body local completo e envia **só** os campos ML-editáveis.

```ts
type UpdateAnuncioLocalBody = {
    integration_id?: number;
    plataforma?: string;
    estoque?: number;
    preco?: number;
    unidade_medida?: string;
    descricao?: string;
    titulo?: string;
    num_fabricante?: string;
    ativo?: 'S' | 'N';
    sku_externo?: string;
    id_externo?: string;
    link?: string;
    thumbnail?: string;
};

async updateByIdPlataforma(
    cnpj: string,
    idPlataforma: string,
    body: UpdateAnuncioLocalBody
): Promise<SyncResult> {
    const dbName = `\`${cnpj}\``;
    const result: SyncResult = { totalAnuncios: 0, atualizados: 0, falhas: 0, msgs: [] };

    const anuncios = await this.selectAnuncios.findByParams(dbName, { id_plataforma: idPlataforma, plataforma: 'ML' });
    result.totalAnuncios = anuncios.length;
    if (anuncios.length === 0) return result;

    const anuncio = anuncios[0];
    try {
        // 1. Resolver integração (token por anúncio)
        const integracoes = await this.selectUsersMl.findByIntegrationInternalId(Number(anuncio.integration_id));
        if (integracoes.length === 0) throw new Error(`Integração ML não encontrada para o anúncio ${anuncio.id}.`);
        const { system_user_code, ml_user_id } = integracoes[0];

        // 2. Cliente autenticado (já resiliente a 429 pelo ApiClient)
        const apiClient = await this.apiClientFactory(cnpj, Number(system_user_code), Number(ml_user_id));
        const updateMlAnnouncement = new UpdateMlAnnouncement(apiClient);

        // 3. Enviar SÓ os campos ML-editáveis (payload parcial)
        const mlPayload: Partial<IPayloadToUpdateMLAnnouncement> = {};
        if (body.titulo !== undefined) mlPayload.title = body.titulo;
        if (body.preco !== undefined) mlPayload.price = body.preco;
        if (body.estoque !== undefined) mlPayload.available_quantity = body.estoque;
        if (body.descricao !== undefined) mlPayload.description = body.descricao;

        await updateMlAnnouncement.updateItem(idPlataforma, mlPayload);

        // 4. Persistir o body local completo (mesmo comportamento da rota do banco)
        await this.updateAnuncios.update(dbName, body, anuncio.id);

        result.atualizados++;
    } catch (e) {
        result.falhas++;
        result.msgs.push(e instanceof Error ? e.message : String(e));
    }

    return result;
}
```

> **Por que persiste com `UpdateAnuncios.update` e não `updateLocalAnuncio`?**
> Porque o body vem em **nomes locais** (`titulo`, `preco`, `estoque`...) e `updateLocalAnuncio` espera nomes ML (`title`, `price`...), além de só persistir 5 campos. Aqui persiste **todos** os campos locais.

> **Campos locais que NÃO vão ao ML:** `unidade_medida`, `num_fabricante`, `ativo`, `sku_externo`, `id_externo`, `link`, `integration_id`, `plataforma` — persistidos no banco apenas. Os únicos campos ML-editáveis via `PUT /items/:id` são título, preço, estoque e descrição.

---

## ⚙️ MUDANÇA 3 — `announcement-composer.ts`: passar novas dependências

No `buildSyncMlAnnouncementService()`, o construtor do `SyncMlAnnouncementService` deve receber também `SelectUsersMlIntegrations` e `UpdateAnuncios`:

```ts
return new SyncMlAnnouncementService(
    apiClientFactory,
    mappingAnnouncementByProduct,
    updateLocalMlAnnouncement,
    new SelectAnuncios(),
    new SelectUsersMlIntegrations(),   // NOVO (pode reutilizar a instância do mapping)
    new UpdateAnuncios()               // NOVO (pode reutilizar a instância do UpdateLocalMlAnnouncement)
);
```

> Dica: no `buildSyncMlAnnouncementService` já existem variáveis com `SelectUsersMlIntegrations` (usado no `MappingAnnouncementByProduct`) e `UpdateAnuncios` (usado no `UpdateLocalMlAnnouncement`). **Reutilize essas mesmas instâncias** em vez de criar novas.

---

## ⚙️ MUDANÇA 4 — Criar `routes/ml-announcement-update.ts`

Criar o arquivo `src/modules/marketplaces/mercadolivre/announcement/routes/ml-announcement-update.ts`:

```ts
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { DecodedToken } from "../../../../../services/decoded-token/decodedToken.ts";
import { buildSyncMlAnnouncementService } from "../update-announcement/announcement-composer.ts";

export const mlAnnouncementUpdateRoute: FastifyPluginAsyncZod = async (server) => {
    server.put('/ml/anuncios/update/:id_plataforma', {
        schema: {
            tags: ['ml'],
            description: "Atualiza um anúncio no Mercado Livre e persiste no banco local (payload parcial).",
            headers: z.object({ token: z.string() }),
            params: z.object({ id_plataforma: z.string() }),
            body: z.object({
                integration_id: z.coerce.number().optional(),
                plataforma: z.string().optional(),
                estoque: z.coerce.number().optional(),
                preco: z.coerce.number().optional(),
                unidade_medida: z.string().optional(),
                descricao: z.string().optional(),
                titulo: z.string().optional(),
                num_fabricante: z.string().optional(),
                ativo: z.enum(['S', 'N']).optional(),
                sku_externo: z.string().optional(),
                id_externo: z.string().optional(),
                link: z.string().optional(),
                thumbnail: z.string().optional()
            }),
            response: {
                200: z.object({ success: z.boolean(), data: z.any() }),
                400: z.object({ success: z.boolean(), message: z.string() }),
                401: z.object({ success: z.boolean(), message: z.string() }),
                500: z.object({ success: z.boolean(), message: z.string() })
            }
        }
    }, async (request, reply) => {
        const decoded = DecodedToken(String(request.headers.token));
        if (!decoded.success || !decoded.payload?.cnpj) {
            return reply.status(401).send({ success: false, message: "Token inválido" });
        }
        const empresa = decoded.payload.cnpj.replace(/\D/g, '');
        const { id_plataforma } = request.params;

        try {
            const service = buildSyncMlAnnouncementService();
            const result = await service.updateByIdPlataforma(empresa, id_plataforma, request.body);

            if (result.totalAnuncios === 0) {
                return reply.status(400).send({ success: false, message: `Anúncio ${id_plataforma} não encontrado.` });
            }
            return reply.status(200).send({ success: result.falhas === 0, data: result });
        } catch (e: any) {
            console.error("Erro ao atualizar anúncio no ML:", e);
            return reply.status(500).send({ success: false, message: `${e instanceof Error ? e.message : e}` });
        }
    });
};
```

---

## ⚙️ MUDANÇA 5 — `app-routes.ts`: registrar rota

1. **Importar** (junto aos imports de rotas ML, por volta da linha 40):
```ts
import { mlAnnouncementUpdateRoute } from "./modules/marketplaces/mercadolivre/announcement/routes/ml-announcement-update.ts";
```

2. **Registrar** (junto a `mlItemUpdatePriceStockRoute`, por volta da linha 142):
```ts
server.register(mlAnnouncementUpdateRoute);
```

---

## ✅ Verificação final

```bash
node .\node_modules\typescript\bin\tsc --noEmit
```

- Confirmar **0 erros novos** em `src/modules/marketplaces/mercadolivre` e `app-routes.ts`.
- Erros pré-existentes de outros arquivos (`make-order.ts`, `order.ts`, `api-client.ts` axios, `dadosTeste.ts`, `webhook.ts`) **não** são causados por essas mudanças.

---

## ⚠️ Pontos de atenção

1. **`delay(ms)` bugado** (`src/services/delay-service/delay.ts`): divide por 1000 e loga "Aguardando X segundos". Ao usar, atente-se à unidade. Recomendo criar um `sleep(ms)` simples ou corrigir o `delay`.

2. **`api-client.ts` erro de tipo pré-existente**: os types `AxiosInstance`/`AxiosRequestConfig`/`AxiosResponse` não resolvem no `tsc`. Ao mexer no `ApiClient`, talvez precise ajustar o import (ex.: `import axios from "axios"` e usar `axios.AxiosInstance`, ou ajustar a versão/tipos do axios). Não foi causado por essas mudanças, mas convém limpar enquanto mexe no arquivo.

3. **`attributes`/`pictures[]`**: ficaram **fora** do body (alinhado à rota do banco, que não os envia). O update no ML envia só título/preço/estoque/descrição. Se o front precisar editar atributos/fotos, estender depois.
