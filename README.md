# Template API - Integração com Mercado Livre

API REST desenvolvida em Node.js/TypeScript para integração com a API do Mercado Livre, permitindo autenticação OAuth, publicação de anúncios, consulta de produtos e gerenciamento de integrações.

## 📋 Índice

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Integração com Mercado Livre](#integração-com-mercado-livre)
  - [Fluxo de Autenticação OAuth](#fluxo-de-autenticação-oauth)
  - [Gerenciamento de Tokens](#gerenciamento-de-tokens)
  - [Endpoints da API](#endpoints-da-api)
  - [Exemplos de Uso](#exemplos-de-uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)

## 🛠 Tecnologias

- **Node.js** 18
- **TypeScript** 5.3.3
- **Express** 4.18.2
- **Axios** 1.13.2
- **MySQL** 3.15.3
- **JWT** (jsonwebtoken) 9.0.2
- **Day.js** 1.11.19
- **Swagger UI** (Documentação)

## 📦 Pré-requisitos

- Node.js 18 ou superior
- MySQL
- Conta de desenvolvedor no Mercado Livre
- Aplicação registrada no [Mercado Livre Developers](https://developers.mercadolivre.com.br/)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd template-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (veja seção [Configuração](#configuração))

4. Compile o projeto:
```bash
npm run build
```

5. Inicie o servidor:
```bash
npm start
```

Para desenvolvimento com hot-reload:
```bash
npm run dev
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Servidor
PORT_API=3000

# Banco de Dados MySQL
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco

# Mercado Livre - Credenciais da Aplicação
APP_ID_ML=seu_app_id_mercadolivre
SECRET_ML=seu_secret_mercadolivre
REDIRECT_URI_ML=https://seu-dominio.com/v1/ml/integrations/callback

# JWT para State Token (OAuth)
SECRET_ML_ENCODE_STATE=seu_secret_jwt_para_state

# Outras configurações
NODE_ENV=development
```

### Como obter as credenciais do Mercado Livre:

1. Acesse [Mercado Livre Developers](https://developers.mercadolivre.com.br/)
2. Crie uma nova aplicação
3. Configure a URL de redirecionamento: `https://seu-dominio.com/v1/ml/integrations/callback`
4. Copie o `App ID` e `Secret Key` para o `.env`

## 🔗 Integração com Mercado Livre

### Fluxo de Autenticação OAuth

A integração utiliza OAuth 2.0 do Mercado Livre seguindo este fluxo:

#### 1. **Obter URL de Autorização**

O usuário precisa autorizar a aplicação. Chame o endpoint para obter a URL:

```http
GET /v1/ml/integrations/getCode?vendedor={codigo_vendedor}
Headers:
  token: {jwt_token_usuario}
```

**Resposta:**
```json
{
  "uri": "https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=...&redirect_uri=...&state=..."
}
```

#### 2. **Redirecionamento do Usuário**

O usuário é redirecionado para a URL retornada, faz login no Mercado Livre e autoriza a aplicação.

#### 3. **Callback OAuth**

Após autorização, o Mercado Livre redireciona para:
```
GET /v1/ml/integrations/callback?code={authorization_code}&state={state_token}
```

O sistema automaticamente:
- Troca o código de autorização por tokens (access_token e refresh_token)
- Armazena os tokens no banco de dados
- Redireciona para o frontend com um token temporário

#### 4. **Finalizar Integração**

O frontend deve chamar este endpoint para nomear a integração:

```http
POST /v1/ml/integrations/finalizeIntegration
Headers:
  token: {jwt_token_usuario}
Body:
{
  "integrationName": "Minha Loja ML",
  "tempToken": "token_temporario_do_callback"
}
```

### Gerenciamento de Tokens

O sistema gerencia automaticamente a renovação de tokens:

- **Access Token**: Expira em 6 horas
- **Refresh Token**: Expira em 6 meses
- **Renovação Automática**: O sistema verifica se o token está próximo da expiração (10 minutos de margem) e renova automaticamente quando necessário

A função `getValidAccessToken()` é chamada automaticamente antes de cada requisição à API do Mercado Livre, garantindo que sempre temos um token válido.

### Endpoints da API

#### 🔐 Integração

##### Obter URL de Autorização
```http
GET /v1/ml/integrations/getCode?vendedor={codigo}
Headers: token (JWT)
```

##### Callback OAuth (Automático)
```http
GET /v1/ml/integrations/callback?code={code}&state={state}
```

##### Finalizar Integração
```http
POST /v1/ml/integrations/finalizeIntegration
Headers: token (JWT)
Body: { integrationName, tempToken }
```

#### 📦 Anúncios

##### Criar Anúncio
```http
POST /v1/ml/anuncios/create
Headers: token (JWT)
Body:
{
  "title": "Produto Exemplo",
  "price": 99.90,
  "available_quantity": 10,
  "category_id": "MLB123456",
  "listing_type_id": "gold_special",
  "condition": "new",
  "description": "Descrição do produto",
  "pictures": ["https://url-imagem1.jpg", "https://url-imagem2.jpg"],
  "brand": "Marca",
  "model": "Modelo",
  "ean": "7891234567890",
  "attributes": [
    { "id": "BRAND", "value_name": "Marca" },
    { "id": "MODEL", "value_name": "Modelo" }
  ],
  "codigo_produto": 123,
  "ml_user_id": 456789
}
```

**Resposta:**
```json
{
  "success": true,
  "ml_id": "MLB123456789",
  "permalink": "https://produto.mercadolivre.com.br/MLB-123456789",
  "msg": "Anúncio criado com sucesso!"
}
```

##### Listar Anúncios
```http
GET /v1/ml/anuncios?ativo=S&limit=10&data_recadastro=2024-01-01
Headers: token (JWT)
```

##### Buscar Anúncio por ID
```http
GET /v1/ml/anuncios/:id
Headers: token (JWT)
```

##### Atualizar Anúncio
```http
PUT /v1/ml/anuncios/update/:id
Headers: token (JWT)
Body: { preco, estoque, titulo, descricao, ... }
```

##### Deletar Anúncio
```http
DELETE /v1/ml/anuncios/delete/:id
Headers: token (JWT)
```

#### 🛠 Ferramentas

##### Prever Categoria
```http
POST /v1/ml/tools/predict-category
Headers: token (JWT)
Body: { "title": "Notebook Dell Inspiron 15" }
```

**Resposta:**
```json
{
  "found": true,
  "category_id": "MLB1234",
  "category_name": "Notebooks",
  "required_attributes": [
    {
      "id": "BRAND",
      "name": "Marca",
      "value_type": "string",
      "hint": "Marca do notebook"
    },
    {
      "id": "MODEL",
      "name": "Modelo",
      "value_type": "string",
      "hint": "Modelo do notebook"
    }
  ]
}
```

#### 👤 Contas

##### Listar Contas do Mercado Livre
```http
GET /v1/ml/accounts/:codigo
Headers: token (JWT)
```

### Exemplos de Uso

#### Exemplo Completo: Publicar um Produto

```typescript
// 1. Obter URL de autorização (se ainda não autorizado)
const authResponse = await fetch('http://localhost:3000/v1/ml/integrations/getCode?vendedor=123', {
  headers: { 'token': 'seu_jwt_token' }
});
const { uri } = await authResponse.json();

// 2. Usuário autoriza no Mercado Livre (redirecionamento manual)

// 3. Prever categoria do produto
const categoryResponse = await fetch('http://localhost:3000/v1/ml/tools/predict-category', {
  method: 'POST',
  headers: {
    'token': 'seu_jwt_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Notebook Dell Inspiron 15 8GB RAM 256GB SSD'
  })
});
const categoryData = await categoryResponse.json();

// 4. Criar anúncio
const anuncioResponse = await fetch('http://localhost:3000/v1/ml/anuncios/create', {
  method: 'POST',
  headers: {
    'token': 'seu_jwt_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Notebook Dell Inspiron 15 8GB RAM 256GB SSD',
    price: 2499.90,
    available_quantity: 5,
    category_id: categoryData.category_id,
    listing_type_id: 'gold_special',
    condition: 'new',
    description: 'Notebook Dell Inspiron 15 com 8GB RAM e 256GB SSD',
    pictures: [
      'https://exemplo.com/imagem1.jpg',
      'https://exemplo.com/imagem2.jpg'
    ],
    brand: 'Dell',
    model: 'Inspiron 15',
    ean: '7891234567890',
    attributes: categoryData.required_attributes.map(attr => ({
      id: attr.id,
      value_name: 'valor_do_atributo'
    })),
    codigo_produto: 123,
    ml_user_id: 456789
  })
});

const resultado = await anuncioResponse.json();
console.log('Anúncio criado:', resultado);
```

## 📁 Estrutura do Projeto

```
template-api/
├── src/
│   ├── controllers/
│   │   ├── integration/
│   │   │   └── ml-controlller/        # Controllers de integração ML
│   │   └── ml/
│   │       ├── anuncios-controller.ts  # CRUD de anúncios
│   │       ├── ml-tools-controller.ts  # Ferramentas (prever categoria)
│   │       └── get-itens.ts            # Consultar itens do ML
│   ├── services/
│   │   ├── integration/
│   │   │   └── mercadolivre-integration/
│   │   │       └── ml-auth-service.ts  # Autenticação OAuth e tokens
│   │   └── ml-services/
│   │       ├── post-itens-ml.ts        # Publicar produtos
│   │       ├── get-itens-ml.ts         # Buscar produtos
│   │       └── ml-tools-service.ts     # Ferramentas auxiliares
│   ├── models/
│   │   ├── ml-accounts/                # Modelos de contas ML
│   │   ├── anuncios/                   # Modelos de anúncios
│   │   └── users-ml-integration/       # Modelos de integrações
│   ├── routes/
│   │   └── ml-routes.ts                # Rotas do Mercado Livre
│   └── server.ts                       # Configuração do servidor
├── package.json
├── tsconfig.json
└── README.md
```

### Principais Arquivos

- **`ml-auth-service.ts`**: Gerencia autenticação OAuth, troca de tokens e renovação automática
- **`post-itens-ml.ts`**: Serviço para publicar produtos no Mercado Livre
- **`get-itens-ml.ts`**: Serviço para buscar produtos do vendedor
- **`ml-tools-service.ts`**: Ferramentas como previsão de categoria e atributos obrigatórios
- **`anuncios-controller.ts`**: Controller REST para gerenciar anúncios
- **`ml-integration-controller.ts`**: Controller para fluxo de integração OAuth

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Executar versão compilada
npm start

# Executar testes
npm run teste

# Gerar documentação Swagger
npm run build:swagger

# Watch Swagger (desenvolvimento)
npm run swagger:watch
```

## 🔒 Segurança

- Todos os endpoints (exceto callbacks públicos) requerem autenticação via JWT no header `token`
- O `state` token no OAuth é assinado com JWT para prevenir CSRF
- Tokens do Mercado Livre são armazenados de forma segura no banco de dados
- Renovação automática de tokens previne expiração inesperada

## 📚 Documentação Adicional

- [Documentação Oficial do Mercado Livre](https://developers.mercadolivre.com.br/pt_br/documentacao-tecnica)
- [API de Autenticação OAuth](https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao)
- [API de Publicação de Itens](https://developers.mercadolivre.com.br/pt_br/publicacao-de-produtos)

## 🐛 Troubleshooting

### Erro: "Conta do Mercado Livre não encontrada"
- Verifique se a integração foi finalizada corretamente
- Confirme que o `ml_user_id` está correto

### Erro: "Acesso revogado. É necessário reconectar a conta."
- O refresh token expirou (6 meses)
- O usuário revogou o acesso no Mercado Livre
- Solução: Reautorizar a aplicação (chamar `/getCode` novamente)

### Erro: "ML Recusou: validation_error"
- A categoria exige atributos obrigatórios que não foram fornecidos
- Use o endpoint `/predict-category` para descobrir os atributos necessários

## 📄 Licença

MIT

## 👥 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

