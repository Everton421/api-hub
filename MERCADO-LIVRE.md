# Mercado Livre — Mapa de Configurações e Fluxos

> Documento de referência ("mapa") de toda a integração com o Mercado Livre existente neste projeto.
> Serve para ter uma visão geral do que já foi implementado. Para notas históricas da implementação inicial do webhook de pedidos, ver `CHANGELOG-ML-ORDERS.md` (desatualizado — este documento é a referência atual).

## Índice
1. [Visão geral e arquitetura](#1-visão-geral-e-arquitetura)
2. [OAuth2 / Autenticação](#2-oauth2--autenticação)
3. [Pedidos](#3-pedidos)
4. [Anúncios / Itens](#4-anúncios--itens)
5. [NF-e / Invoice](#5-nf-e--invoice)
6. [Tools](#6-tools)
7. [Camada de dados — Models](#7-camada-de-dados--models)
8. [Tabelas do banco](#8-tabelas-do-banco)
9. [Constantes centralizadas](#9-constantes-centralizadas)
10. [Broker / Mensageria](#10-broker--mensageria)
11. [Variáveis de ambiente](#11-variáveis-de-ambiente)
12. [Registro de rotas](#12-registro-de-rotas)
13. [Observações / pontos de atenção](#13-observações--pontos-de-atenção)

---

## 1. Visão geral e arquitetura

O módulo ML fica em `src/modules/marketplaces/mercadolivre/` e se organiza em subpastas por domínio:

```
src/modules/marketplaces/mercadolivre/
├── __test__/                     # testes (update-ml-announcement, get-ml-order-request, announcement-mapping)
├── announcement/                 # anúncios/itens
│   ├── create-announcement/
│   ├── update-announcement/
│   ├── mapping/
│   ├── routes/                   # ml-anuncios, ml-app-anuncios, ml-item-update
│   └── types/
├── invoice/                      # faturamento NF-e
│   ├── mapping/
│   ├── request/
│   ├── routes/                   # ml-invoice-webhook, ml-invoice-reprocess
│   ├── services/
│   └── types/
├── orders/                       # pedidos
│   ├── types/
│   ├── ml-orders-service.ts
│   ├── ml-orders-request.ts
│   ├── ml-orders-mapper.ts
│   ├── ml-buyer-service.ts
│   └── ml-status-service.ts
├── routes/                       # rotas ML toplevel
│   ├── ml-integration.ts
│   ├── ml-accounts.ts
│   ├── ml-get-user-test.ts
│   ├── ml-notifications.ts
│   ├── ml-orders-sync.ts
│   └── ml-tools.ts
├── services/
│   ├── auth/                     # ml-auth-services, get-ml-user-code, exchange-code-for-ml-token, decoded-ml-state-token
│   ├── ml-tools-service.ts
│   ├── get-test-user.ts
│   └── get-itens-ml-service.ts
└── utils/
    └── generate-code.ts          # PKCE
```

Há ainda um subsistema **compartilhado** entre marketplaces em `src/modules/marketplaces/shared/invoice/` (NF-e), consumido pelo ML e estendível a outros marketplaces.

**Orquestração geral**: as **rotas Fastify** (`FastifyPluginAsyncZod`) recebem a requisição e delegam aos **services** de cada domínio; os services fazem chamadas HTTP ao ML via `axios` (garantindo o token via `MlAuthServices`) e persistem os dados através dos **models**.

---

## 2. OAuth2 / Autenticação

Fluxo de **OAuth2 com PKCE (S256)** para autorizar uma conta ML de um vendedor. O `state` é um JWT assinado com `SECRET_ML_ENCODE_STATE` que carrega `{ cnpj, codigo, code_verifier }`.

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/modules/marketplaces/mercadolivre/utils/generate-code.ts` | Gera `code_verifier` (32 bytes base64url) e `code_challenge` (SHA-256 base64url). Classe `GenerateMlCode`. |
| `.../services/auth/get-ml-user-code.ts` | Monta a URL de autorização `https://auth.mercadolivre.com.br/authorization?...` com `response_type=code`, `client_id`, `redirect_uri`, `state`, `code_challenge`, `code_challenge_method=S256`. Classe `GetMlUserCode`. |
| `.../services/auth/decoded-ml-state-token.ts` | Verifica/decodifica o JWT do `state` com `SECRET_ML_ENCODE_STATE`, retornando `{ success, payload: { cnpj, codigo, code_verifier } }`. Classe `DecodedMlStateToken`. |
| `.../services/auth/exchange-code-for-ml-token.ts` | Troca o `code` por token via `POST {ML_API_URL}/oauth/token` (com `code_verifier`), calcula expiração com dayjs e persiste em `ml_accounts` (insert ou update). Classe `ExchangeCodeForMlToken`. |
| `.../services/auth/ml-auth-services.ts` | **Núcleo do token/refresh**: `getValidMlAccessToken(cnpj, systemUserCode, mlUserId)` consulta `ml_accounts`; se a expiração está a **≤ 10 min**, renova via `grant_type=refresh_token` e grava de volta. Classe `MlAuthServices`. |

### Fluxo de autorização

```
1. App chama  GET /ml/integration/getCode
   -> gera code_verifier/code_challenge (GenerateMlCode)
   -> cria state JWT { cnpj, codigo: vendedor, code_verifier }
   -> monta URL de autorizacao (GetMlUserCode) -> retorna { uri }

2. Usuario autentica no ML e o ML redireciona para:
   GET /ml/integration/callback?code=...&state=...

3. Callback:
   -> ExchangeCodeForMlToken.exchangeCodeForMlToken(code, state)
      1. decodifica state -> cnpj, codigo, code_verifier
      2. POST /oauth/token com grant_type=authorization_code
      3. salva access_token/refresh_token/expira em ml_accounts
   -> gera tempToken (JWT 10min, SECRET_ML_ENCODE_STATE) com { ml_user_id, system_user_code, cnpj }
   -> redireciona para ${FRONT_END_URL}/marketplaces/integracoes?data={tempToken}

4. Front envia  POST /ml/integration/finalizeIntegration { integrationName, tempToken }
   -> verifica tempToken -> extrai ml_user_id, system_user_code, cnpj
   -> upsert em users_ml_integrations (banco compartilhado DB_API)

5. A partir daqui, MlAuthServices.getValidMlAccessToken reutiliza/renova o token salvo em ml_accounts
```

### Rotas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/ml/integration/callback` | GET | Callback OAuth; troca code por token, redireciona ao front com tempToken. Query: `code`, `state`. |
| `/ml/integration/getCode` | GET | Gera URL de autorização. Headers: `token`. Query: `vendedor` (número). |
| `/ml/integration/finalizeIntegration` | POST | Grava a integração em `users_ml_integrations`. Headers: `token`. Body: `integrationName`, `tempToken`. |
| `/ml/accounts/:codigo` | GET | Lista contas ML do vendedor (JOIN `ml_accounts` + `users_ml_integrations`). Headers: `token`. |
| `/ml/user_test` | GET | Obtém/cria usuário de teste ML. Headers: `token`, `ml_user_id`. |

### Onde o token é armazenado

- Tabela `{cnpj}.ml_accounts` nos campos `access_token`, `refresh_token`, `token_expires_in`.
- **Refresh automático** acontece dentro de `MlAuthServices.getValidMlAccessToken` quando faltam **≤ 10 minutos** para expirar (usa `dayjs().add(expires_in, 'seconds')`).

---

## 3. Pedidos

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/modules/marketplaces/mercadolivre/orders/types/ml-order-types.ts` | Tipos puros do payload ML: `MlNotification`, `MlBuyer`, `MlUser`, `MlOrderItem`, `MlPayment`, `MlShipping`, `MlOrder`. |
| `.../orders/ml-orders-request.ts` | Classe `MlOrdersRequest` — chamadas HTTP autenticadas (Bearer): `getOrderById` (`GET /orders/{id}`), `getUserById` (`GET /users/{id}`), `fetchOrderIds` (`GET /orders/search` com filtros e paginação). |
| `.../orders/ml-orders-mapper.ts` | Classe `MlOrdersMapper.mapToLocalOrder(database, mlOrder, buyerCode, systemUserCode)` — converte pedido ML para `OrderReceivedType` (busca `codigo_produto` em `anuncios` por `id_plataforma`, monta parcelas de `payments`, define `situacao` via `derivarSituacao('ML', status)`, `id_externo = String(mlOrder.id)`, `operacao='V'`, `marketplace='ML'`). |
| `.../orders/ml-buyer-service.ts` | Classe `MlBuyerService.findOrCreateBuyer(database, buyer, sellerCode)` — garante o cliente local (normaliza CNPJ/CPF, telefone, estado, endereço via `utils/normalize.ts`; busca por CNPJ, insere/atualiza). Retorna o `codigo` do cliente. |
| `.../orders/ml-status-service.ts` | Classe `MlStatusService.registrarStatus(database, codigoPedido, mlOrder)` — garante a tabela e faz **upsert** de `pedido_status` (categorias `pedido`, `pagamento`, `frete`). |
| `.../orders/ml-orders-service.ts` | Classe `MlOrdersService` — **core de processamento** de pedido. Métodos: `fetchOrderIds`, `processOrder`. |

### Fluxo de processamento (`processOrder`)

```
Chegada: webhook orders_v2 OU sync manual
  |
  v
MlOrdersService.processOrder(cnpj, systemUserCode, mlUserId, mlOrderId)
  1. getValidMlAccessToken
  2. getOrderById + getUserById (comprador)                     [ml-orders-request]
  3. findOrCreateBuyer -> codigo do cliente                     [ml-buyer-service]
  4. mapToLocalOrder -> localOrder (id_externo = mlOrder.id)    [ml-orders-mapper]
  5. Dedup por id_externo (operacao 'V'):
     select.existsByExternalIdRef / findexistsByExternalId
       |
       +-- Existe? -- sim --> compara last_updated; se mais novo ->
       |        UpdateOrder.updateByExternalIdRef
       |        publish 'pedido.atualizado'
       |
       +-- Nao existe? --> InsertOrder.create -> codigoPedido = insertId
               publish 'pedido.inserido' com { ...localOrder, internalCodigo: insertId }
  6. registrarStatus(database, codigoPedido, mlOrder)           [ml-status-service]
```

### Rotas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/ml/notifications` | POST | Webhook `orders_v2` do ML. Body: `_id?, topic, resource, user_id, application_id?, attempts?, sent?, received?`. Se `topic !== 'orders_v2'` ignora; extrai `mlOrderId` de `resource`; busca integrações por `ml_user_id` e chama `processOrder` para cada uma. |
| `/ml/orders/sync` | GET | Sincronização manual. Headers: `token`, `ml_user_id`. Query: `dateCreatedFrom/To`, `dateUpdatedFrom/To`, `offset`, `limit`. Busca ids via `fetchOrderIds` e processa cada um; retorna `{ totalEncontrados, processados, erros[] }`. |

### Tabelas usadas
`{cnpj}.pedidos`, `{cnpj}.clientes`, `{cnpj}.anuncios`, `{cnpj}.pedido_status` (+ tabelas filhas: `produtos_pedido`, `servicos_pedido`, `parcelas`).

---

## 4. Anúncios / Itens

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/modules/marketplaces/mercadolivre/announcement/types/payload-create-announcement.ts` | Interface `IPayloadCreateAnnouncement` (title, price, quantity, sku?, category_id, listing_type_id, condition, description?, pictures, brand?, model?, ean?, attributes, thumbnail?). |
| `.../announcement/types/update-announcement.ts` | `IPayloadUpdateAnnouncement`, `MlUpdateAttribute`, `MlUpdatePayload`. |
| `.../announcement/mapping/ml-announcement-mapping.ts` | Classe `MlAnnouncementMapping` — `mapToCreateAnnouncement(data)` (atributos dinâmicos, fallback BRAND/MODEL/GTIN, adiciona `SELLER_SKU` se `sku`, `shipping` modo `me2`) e `mapToUpdateAnnouncement(data)` (apenas campos presentes). |
| `.../announcement/create-announcement/create-ml-announcement-service.ts` | Classe `CreateMlAnnouncementService.publishItem` — token válido, `POST /items`, grava em `anuncios` + `atributos_anuncios`, `PUT /items/{id}/description` se houver, trata erro do ML com mensagem amigável. |
| `.../announcement/update-announcement/update-ml-announcement-request.ts` | `UpdateMlAnnouncementRequest.update(...)` → `PUT /items/{mlItemId}`. |
| `.../announcement/update-announcement/update-description-ml-announcement-request.ts` | `UpdateDescriptionMlAnnouncementRequest.update(...)` → `PUT /items/{mlItemId}/description`. |
| `.../announcement/update-announcement/update-ml-announcement.ts` | Classe `UpdateMlAnnouncement.updateItem` — token, mapeia, chama update no ML (e description), atualiza anúncio local e atributos. |
| `.../announcement/update-announcement/update-ml-announcement-service.ts` | Classe `UpdateMlAnnouncementService.syncProductByCode(cnpj, codigoProduto)` — **sync produto → todos os anúncios ML ativos** (preço, estoque, título, fotos, descrição, atributos). Retorna `SyncProductResult { updated, failed, details }`. |
| `src/modules/marketplaces/mercadolivre/services/get-itens-ml-service.ts` | Classe `GetMlItemsService` — `getItemsFromSeller` (`GET /users/{id}/items/search?status=active` + multiget `GET /items?ids=...`) e `getStatusSeller`. |

### Rotas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/ml/anuncios/create` | POST | **Publica no ML** (não registra no banco). Headers: `token`. Body: `title, sku, price, category_id, available_quantity, ml_user_id, codigo_produto, listing_type_id?, condition?, description?, pictures?, brand?, model?, ean?, attributes?, thumbnail?`. Retorna 201. |
| `/ml/get/anuncios` | GET | Lista itens do vendedor no ML. Headers: `token`, `ml_user_id`. |
| `/ml/app/anuncios/register` | POST | **Registra no banco + publica no ML** (body inclui `id` do item ML). |
| `/ml/app/anuncios` | GET | Consulta local por filtros (ativo, descricao, titulo, limit, data_recadastro, plataforma, id_externo, sku_externo, id_plataforma); inclui atributos. |
| `/ml/app/anuncios/:id` | GET | Consulta por id + atributos. |
| `/ml/app/anuncios/update/:id` | PUT | Atualiza anúncio no banco. |
| `/ml/app/anuncios/delete/:id` | DELETE | Deleta anúncio + atributos. |
| `/ml/anuncios/update/price-stock` | PUT | Sync preço/estoque de todos os anúncios ML do produto. Body: `codigo_produto`. Retorna `{ success, data: SyncProductResult }`. |

> **Atenção**: há **duas rotas de criação** — `POST /ml/anuncios/create` (só publica no ML) e `POST /ml/app/anuncios/register` (registra no banco **e** publica).

### Tabelas usadas
`{cnpj}.anuncios`, `{cnpj}.atributos_anuncios`.

---

## 5. NF-e / Invoice

Subsistema **compartilhado** entre marketplaces em `src/modules/marketplaces/shared/invoice/`.

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/modules/marketplaces/shared/invoice/invoice-publisher.ts` | Interface `MarketplaceInvoicePublisher { sendInvoice(input): Promise<InvoiceSendResult> }`. |
| `.../shared/invoice/invoice-types.ts` | `InvoicePayload`, `InvoiceSendInput`, `InvoiceSendResult`. |
| `.../shared/invoice/invoice-factory.ts` | `buildInvoiceService()` — registra o publisher `ML → MlInvoiceService` e retorna `InvoiceService`. |
| `.../shared/invoice/invoice.service.ts` | `InvoiceService` — `registerAndSend`, `reprocessByCodigo`, `listByErro`, `resolveMlUserId`. Insere na tabela `nf` (status PENDENTE), envia via publisher e atualiza para ENVIADO/ERRO. |
| `.../shared/invoice/models/` | `InsertNf`, `SelectNf`, `UpdateNf`, `types.ts` (`NfType`, `NewNf`, `UpdateNfData`, `NfStatusEnvio`). |
| `src/modules/marketplaces/mercadolivre/invoice/types/ml-invoice-payload.ts` | `MlInvoiceRequestBody { access_key, invoice_xml }`. |
| `.../invoice/mapping/ml-invoice-mapping.ts` | `MlInvoiceMapping.mapToMlBody(payload)` → `{ access_key, invoice_xml }`. |
| `.../invoice/request/ml-invoice-request.ts` | `MlInvoiceRequest.sendInvoiceData(baseUrl, shipmentId, body, accessToken)` → `POST /shipments/{shipmentId}/invoice_data`. |
| `.../invoice/services/ml-invoice-service.ts` | `MlInvoiceService implements MarketplaceInvoicePublisher` — obtém token, mapeia, envia ao ML. |

### Rotas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/ml/invoice/webhook` | POST | Headers: `token`. Body: `pedido_id_externo, shipment_id, chave_acesso (44), xml_base64, marketplace (default ML)`. Chama `buildInvoiceService().registerAndSend`. |
| `/ml/invoice/reprocess` | POST | Headers: `token`. Body: `codigo`. Chama `reprocessByCodigo` (reenvia NF com status ERRO). |

### Tabelas usadas
`{cnpj}.nf`.

---

## 6. Tools

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/modules/marketplaces/mercadolivre/services/ml-tools-service.ts` | Classe `MlToolsService.predictCategory(title)` — `GET /sites/MLB/domain_discovery/search?q=<title>&limit=1` → melhor categoria; `GET /categories/{categoryId}/attributes`; filtra atributos **obrigatórios** (ignora BRAND e MODEL). Retorna `{ found, category_id, category_name, required_attributes[] }`. |
| `src/modules/marketplaces/mercadolivre/services/get-itens-ml-service.ts` | `getStatusSeller` (usada pela rota de status do vendedor). |

### Rotas

| Rota | Método | Descrição |
|------|--------|-----------|
| `/ml/tools/predict-category` | POST | Headers: `token`. Body: `title` (≥ 3 chars). Prevê categoria e atributos obrigatórios. |
| `/ml/tools/status_vendedor` | GET | Headers: `token`, `ml_user_id`. Status do vendedor via `GetMlItemsService.getStatusSeller`. |

---

## 7. Camada de dados — Models

### `src/models/ml-accounts/`
- `select-ml-accounts.ts` — `SelectMLAccountClient`: `fincByIdMLandCodeSystem(empresa, user_id, ml_user_id)` (busca em `ml_accounts`), `findByUserIdAndIntegration(empresa, user_id)` (JOIN `ml_accounts` + `users_ml_integrations`).
- `insert-ml-accounts.ts` — `InsertaMLAccountClient.cadastrar(empresa, user)`.
- `update-ml-accounts.ts` — `UpdateMLAccountClient.update(empresa, user)` (access/refresh/expiração por `user_id` + `ml_user_id`).

### `src/models/users-ml-integration/` (tabela **compartilhada** `users_ml_integrations`)
- `select-users-ml-integration.ts` — `SelectUsersMlIntegrations`: `findByCodigo`, `findByIntegrationInternalId`, `findByIdMLandCodeSystem`, `findByMlUserId`, `findBySystemUserCodeAndCnpj`, `findBySystemUserCodeAndCnpjList`.
- `insert-users-ml-integration.ts` — `InsertUsersMlintegration.cadastrar(user)`.
- `update-users-ml-integration.ts` — `UpdateUsersMLIntegrations.update(user)`.

### `src/models/anuncios/`
- `select.ts` `SelectAnuncios`: `findAll`, `findById`, `findByParams` (id, codigo_produto, plataforma, ativo, id_externo, descricao, titulo, sku_externo, num_fabricante, id_plataforma; limit default 20).
- `insert.ts` `InsertAnuncios.insert`; `update.ts` `UpdateAnuncios.update` (campos dinâmicos); `delete.ts` `DeleteAnuncios.delete`.

### `src/models/atributos-anuncios/`
- `insert.ts`, `select.ts` (`findByAnuncioId`), `delete.ts`.

### `src/models/pedido-status/` (tabela `pedido_status`)
- `types.ts`: `PedidoStatusType`, `CategoriaStatus`.
- `insert.ts`: `InsertPedidoStatus.upsert` (INSERT ... ON DUPLICATE KEY UPDATE).
- `select.ts`: `SelectPedidoStatus.findByPedido`, `findDistinctStatus`.

### `src/models/order/`
- `select.ts` `SelectOrder`: inclui `findByExternalIdRef`, `existsByExternalIdRef` (**dedup ML por `id_externo`**).
- `insert.ts` `InsertOrder.create` (pedido + itens/serviços/parcelas).
- `update.ts` `UpdateOrder.updateByExternalIdRef` (usado no fluxo ML).

### `src/models/client/`
- `select.ts` (`findByCnpjNormalized`), `insert.ts` (`InsertClient.insert`), `update.ts`, `types/client-type.ts` — usados por `MlBuyerService`.

### `src/models/marketplace/`
- `select.ts` `SelectMarketplaces.findByParams` — tabela **compartilhada** `marketplaces`.

### `src/models/webhook/`
- `select.ts` `SelectWebhook`: `findByCnpj`, `findByCodigo`, `findActiveByEvent` (`FIND_IN_SET`).
- `types/webhook-type.ts`: `WebhookType`.

---

## 8. Tabelas do banco

### Tabelas do tenant (CNPJ)

Criadas em `src/database/tables-structures/create-table-ml-accounts.ts` (`CreateTableMLAccounts.createTableMlAcounts`):

- **`ml_accounts`** — id, user_id, ml_user_id, access_token (text), refresh_token (text), token_expires_in (varchar). PK id, KEY (user_id, ml_user_id). **Local de armazenamento do token ML.**
- **`anuncios`** — id, codigo_produto, integration_id, plataforma, estoque, preco, unidade_medida, thumbnail, descricao, titulo, num_fabricante (ean/gtin), ativo, sku_externo, id_externo, link, id_plataforma, data_cadastro, data_recadastro.
- **`atributos_anuncios`** — id, id_anuncio, id_atributo, nome_atributo, valor_atributo, id_valor_atributo, data_cadastro, data_recadastro.

Em `src/database/tables-structures/create-table-pedido-status.ts` (`CreateTablePedidoStatus.createTablePedidoStatus`):

- **`pedido_status`** — id, pedido, marketplace, categoria (`pedido`|`pagamento`|`frete`), status_origem, status_detail, tags (JSON), situacao (EA/AI/FI/FP/RE/BM), data_evento, payload_raw (json), data_cadastro, data_recadastro. UNIQUE `uk_pedido_marketplace_categoria(pedido, marketplace, categoria)`, KEY marketplace.

Em `src/database/tables-structures/company-structure.ts` (`CompanyStructure.createStructure(database_name)`), que cria todo o banco do tenant — inclui `pedidos` (com coluna **`marketplace`** varchar(10) DEFAULT ''), `pedido_status`, `clientes`, `anuncios`, `atributos_anuncios`, `ml_accounts`, `nf`, `produtos`, `produto_setor`, `permissoes`, `perfis`, `perfil_permissoes`, etc. Também faz seed de perfis/permissoes (`seedDefaultData`, incluindo `pedidos.ver_todos` etc.).

> **Nota**: a coluna `marketplace` no `pedidos` e a tabela `pedido_status` são criadas **apenas em empresas novas**. Para empresas existentes é preciso aplicar os comandos SQL manuais (ver seção de observações e `AGENTS.md`).

### Tabelas do banco compartilhado (`DB_API` — `src/database/database-api.ts`, `CreateTablesApi.createtables`)

- **`empresas`**
- **`usuarios`**
- **`users_ml_integrations`** — codigo, ml_user_id, system_user_code, cnpj, integration_name, created_at.
- **`marketplaces`** — id, sigla, plataforma, url_logo.
- **`webhooks`** — codigo, cnpj, url, eventos (separados por vírgula), secret, ativo, ultimo_status, ultimo_erro, datas.

---

## 9. Constantes centralizadas

### `src/services/StatusMarketplace.ts`
- `CategoriaStatus = 'pedido' | 'pagamento' | 'frete'`.
- `MarketplaceStatusMap { sigla, nome, mapeamento, fallback }`.
- `MAPS_MARKETPLACE.ML` — mapeia **status ML → situacao local** (para pedidos):

| ML Status | situacao | Significado |
|-----------|----------|-------------|
| paid | AI | Aprovado |
| confirmed | AI | Aprovado |
| closed | AI | Fechado |
| pending | EA | Em aberto |
| under_review | EA | Em aberto |
| partially_refunded | EA | Reembolso parcial |
| in_mediation | EA | Em mediação |
| partially_paid | FP | Faturado parcialmente |
| cancelled | RE | Cancelado |
| nulled | RE | Anulado |

Fallback: `EA`.
- Funções: `getMarketplaceMap(marketplace)`, `derivarSituacao(marketplace, status): Situacao`, `listarCategoriasStatus()`.

### `src/services/SituacaoPermissao.ts`
- `Situacao = 'EA'|'AI'|'FI'|'FP'|'RE'|'BM'`.
- `VER_TODOS_PERMISSAO = 'pedidos.ver_todos'`.
- `PERMISSAO_SITUACAO`: mapeia permissões (`pedidos.ver_em_aberto`→EA, `ver_aprovados`→AI, etc.).
- `SITUACAO_DESCRICAO`: rótulos humanos.
- Funções: `temPermissaoVerTodos(permissaoIds)`, `derivarSituacoes(permissaoIds)`.
- **Não é enforcement server-side**; usado no `GET /permissoes/usuario` (`src/routes/perfil/perfil.ts`) para o mobile montar o filtro de situações.

---

## 10. Broker / Mensageria

### `src/services/broker/publish-message.ts`
- `publishMessage(cnpj, evento, data, source?)`:
  - Conecta ao RabbitMQ, monta **routing key** `tenant.{CNPJ}.{evento}`.
  - Payload: `{ metadata: { tenant_id, event, timestamp, origin }, data }`.
  - Publica no exchange `EXCHANGE_NAME` (topic).
  - Também dispara `sendWebhooks(cnpjCliente, evento, data, source)` (fire-and-forget).

### Routing keys publicadas pelo fluxo ML
- `tenant.{CNPJ}.pedido.inserido` — novo pedido integrado (source `ml_integration`).
- `tenant.{CNPJ}.pedido.atualizado` — pedido atualizado (source `ml_integration`).

### `src/broker-connection/broker.ts`
- `connectRabbitMQ()`, `getChannel()`, `getConnection()`, `publishExchangeMessage(routingKey, data)`.
- Exchange **topic**, durable; reconnect automático a cada 5s. Variáveis: `EXCHANGE_NAME`, `BROKER_URL`.

### Webhooks
- `src/services/webhook/webhook-dispatcher.ts` `sendWebhooks` — busca webhooks ativos por evento (`SelectWebhook.findActiveByEvent`), envia POST com assinatura `X-Webhook-Signature` (HMAC-SHA256 do payload com o secret do webhook) e atualiza status.

---

## 11. Variáveis de ambiente

Variáveis usadas pelo módulo ML (do `.env`/`.env.example`):

| Variável | Uso no ML |
|----------|-----------|
| `APP_ID_ML` | Client ID do app ML (OAuth: getCode, exchange, refresh). |
| `SECRET_ML` | Client secret do app ML (exchange, refresh). |
| `ML_API_URL` | Base URL da API ML (default `https://api.mercadolibre.com`). |
| `REDIRECT_URI_ML` | URL de callback registrada no ML (`.../ml/integration/callback`). |
| `SECRET_ML_ENCODE_STATE` | Assinatura do JWT do `state` OAuth e do `tempToken` de finalização. |
| `PROJECT_URL` | URL pública do projeto (uso do item de teste). |
| `FRONT_END_URL` | URL do frontend para redirecionamento pós-callback (default `http://localhost:8000`). |
| `EXCHANGE_NAME` | Exchange do RabbitMQ (topic) para publish. |
| `BROKER_URL` | URL de conexão RabbitMQ. |
| `DB_API` | Banco compartilhado da API (`users_ml_integrations`, `marketplaces`, `webhooks`). |
| `SECRET` | JWT do app (DecodedToken). |

**Onde o token ML fica**: tabela `{cnpj}.ml_accounts`. **Refresh automático**: `MlAuthServices.getValidMlAccessToken` renova quando faltam ≤ 10 min.

---

## 12. Registro de rotas

Rotas ML registradas em `src/app-routes.ts`:

- `mlIntegrationRoute`
- `mlAnunciosRoute`
- `mlAppAnunciosRoute`
- `mlToolsRoute`
- `mlAccountsRoute`
- `mlItemUpdateRoute`
- `marketplacesRoute`
- `GetMlUserTestRoute` (rota `ml-get-user-test`)
- `mlNotificationsRoute`
- `mlOrdersSyncRoute`
- `mlInvoiceWebhookRoute`
- `mlInvoiceReprocessRoute`

---

## 13. Observações / pontos de atenção

- **Auth do app**: via header `token` (JWT `{ cnpj, email, codigo }`), decodificado por `DecodedToken` (`src/services/decoded-token/decodedToken.ts`) em cada handler — **não há middleware/auth guard**.
- **Dedup de pedidos**: usa o campo `id_externo` (não o `id`) na operação `'V'` via métodos `Ref` (`existsByExternalIdRef`/`findByExternalIdRef`). O `id` local do pedido fica `'0'`/despreenchido (outra ferramenta o preenche); `id_interno` = `String(mlOrder.id)`.
- **Duas rotas de criação de anúncio**: `POST /ml/anuncios/create` (só publica no ML) vs `POST /ml/app/anuncios/register` (registra no banco + publica).
- O `source` usado nos publishes ML é `'ml_integration'`; default geral é `'api_internal'`.
- **`StatusMarketplace.ts`** e **`SituacaoPermissao.ts`** são as constantes centrais de mapeamento status/situação.
- **NF-e** foi abstraído em `shared/invoice/` para suportar múltiplos marketplaces via `MarketplaceInvoicePublisher` registrados no `buildInvoiceService()`.
- **Empresas existentes**: a coluna `marketplace` no `pedidos` e a tabela `pedido_status` precisam ser adicionadas manualmente (ver `AGENTS.md` para os comandos SQL de migração idempotentes).
- O `CHANGELOG-ML-ORDERS.md` documenta a implementação inicial do webhook de pedidos (18/06/2026) e está **desatualizado** — este documento é a referência atual.
