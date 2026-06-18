# Implementacao: Recebimento de Pedidos do Mercado Livre

Data: 18/06/2026

## Resumo

Implementacao do webhook para receber notificacoes de pedidos do Mercado Livre
via `POST /ml/notifications`, processar o pedido e salvar no banco local.

## Arquivos Criados

### `src/modules/marketplaces/mercadolivre/types/ml-order-types.ts`
Tipos TypeScript para as respostas da API do Mercado Livre:
- `MlNotification` - payload do webhook
- `MlOrder` - pedido completo
- `MlOrderItem` - item do pedido
- `MlBuyer` - comprador
- `MlPayment` - pagamento
- `MlShipping` - frete/entrega

### `src/modules/marketplaces/mercadolivre/services/ml-orders-service.ts`
Service `MlOrdersService` com os metodos:
- `processOrder(cnpj, systemUserCode, mlUserId, mlOrderId)` - fluxo principal
- `fetchOrderDetails(accessToken, orderId)` - busca pedido na API do ML
- `findOrCreateBuyer(database, mlBuyer, sellerCode)` - busca ou cria cliente
- `mapToLocalOrder(database, mlOrder, buyerCode)` - mapeia ML -> formato local

### `src/modules/marketplaces/mercadolivre/routes/ml-notifications.ts`
Rota `POST /ml/notifications` que recebe os webhooks do ML.

## Arquivos Modificados

### `src/models/order/types/order-type.ts`
Adicionado `'AI'` (Aprovado) ao enum `situacao` do `OrderType`.

### `src/models/users-ml-integration/select-users-ml-integration.ts`
Adicionado metodo `findByMlUserId(ml_user_id)` para buscar integracao
pelo ID do usuario no Mercado Livre.

### `src/app-routes.ts`
Registrada a nova rota `mlNotificationsRoute`.

## Fluxo de Processamento

```
ML -> POST /ml/notifications { topic, resource, user_id }
  |
  v
Validar topic === "orders_v2"
  |
  v
Extrair order_id de resource (ex: /orders/1234567890)
  |
  v
users_ml_integrations.findByMlUserId(user_id) -> { cnpj, system_user_code }
  |
  v
getValidMlAccessToken(cnpj, systemUserCode, mlUserId)
  |
  v
GET /orders/{orderId} (API ML) -> dados completos do pedido
  |
  v
findOrCreateBuyer() -> codigo do cliente
  |  (busca por nome, cria se nao existir)
  v
mapToLocalOrder() -> OrderReceivedType
  |  - Mapeia status ML para situacao local
  |  - Busca codigo_produto em anuncios pelo id_plataforma
  |  - Converte payments em parcelas
  v
InsertOrder.create() ou UpdateOrder.update()
  |
  v
publishMessage(cnpj, 'pedido.inserido' ou 'pedido.atualizado')
```

## Mapeamento de Status

| ML Status       | situacao | Significado      |
|-----------------|----------|------------------|
| paid            | AI       | Aprovado         |
| confirmed       | AI       | Aprovado         |
| cancelled       | RE       | Recusado         |
| pending         | EA       | Em aberto        |
| under_review    | EA       | Em aberto        |
| partially_paid  | FP       | Faturado Parc.   |

Configuravel em `ML_STATUS_MAP` no inicio do arquivo
`src/modules/marketplaces/mercadolivre/services/ml-orders-service.ts`.

## Configuracao Necessaria

1. No painel do Mercado Livre (developers.mercadolivre.com), configurar a
   URL de notificacao do aplicativo para:
   ```
   https://{SEU_DOMINIO}/ml/notifications
   ```

2. Verificar se o `user_id` do ML foi salvo corretamente na tabela
   `users_ml_integrations` durante o fluxo de integracao OAuth.

3. O webhook do ML espera resposta **200 OK** rapida. O processamento do
   pedido e feito de forma assincrona dentro do handler.

## Exemplo de Payload do Webhook

```json
{
    "_id": "notification-id",
    "topic": "orders_v2",
    "resource": "/orders/1234567890",
    "user_id": 123456789,
    "application_id": 987654321
}
```
