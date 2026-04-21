# API Mobile - Documentação para Frontend

## Visão Geral

API REST para sistema de gestão mobile com integração Mercado Livre.

- **Base URL**: `http://localhost:3000` (ou URL de produção)
- **Autenticação**: JWT Token no header `token`
- **Content-Type**: `application/json`

---

## Autenticação

### Login

```
POST /login
Body: { "email": string, "senha": string }
```

**Resposta sucesso:**
```json
{ "token": "eyJhbGciOiJIUzI1..." }
```

**Resposta erro:**
```json
{ "success": false, "message": "Credenciais invalidas." }
```

### Uso do Token

Todas as requisições (exceto `/login` e `/health`) devem incluir o token no header:

```typescript
fetch('/api/produtos/search', {
  headers: {
    'token': 'seu_token_jwt_aqui',
    'Content-Type': 'application/json'
  }
})
```

### Payload do Token

O token JWT contém:
- `cnpj`: CNPJ da empresa (formato: XX.XXX.XXX/XXXX-XX)
- `email`: Email do usuário
- `codigo`: Código do usuário no banco
- `senha`: Senha (não recomendado usar)

---

## Padrão de Endpoints

### Busca Geral (Bulk)

```
GET /bulk/{recurso}
Headers: token (obrigatório)
Query params:
  - data_recadastro?: string (YYYY-MM-DD HH:MM:SS)
  - limit?: number
```

Retorna array com todos os registros.

### Busca por Filtros

```
GET /{recurso}/search
Headers: token (obrigatório)
Query params: filtros específicos do recurso
```

### Busca por Código

```
GET /{recurso}/:codigo
Headers: token (obrigatório)
```

### Criar Recurso

```
POST /{recurso}
Headers:
  - token (obrigatório)
  - source?: string (opcional, padrão: 'api_internal')
Body: dados do recurso
```

### Atualizar Recurso

```
PUT /{recurso}
Headers:
  - token (obrigatório)
  - source?: string (opcional)
Body: dados do recurso (inclui codigo)
```

---

## Formato de Respostas

### Sucesso (200)

```json
// Array
[{ "codigo": 1, "nome": "..." }, { "codigo": 2, "nome": "..." }]

// Objeto único
{ "codigo": 1, "nome": "..." }
```

### Sucesso Criação (201)

```json
{ "codigo": 123, "id": "ABC123", ... }
```

### Erro (400/500)

```json
{ "success": false, "message": "Descrição do erro" }
```

---

## Endpoints por Recurso

### Marcas

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/marcas` | Todas as marcas |
| GET | `/marcas/search` | Buscar por filtros |
| POST | `/marcas` | Criar marca |
| PUT | `/marcas` | Atualizar marca |

### Clientes

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/clientes` | Todos os clientes |
| GET | `/clientes/search` | Buscar por filtros |
| GET | `/clientes/:codigo` | Cliente por código |
| POST | `/clientes` | Criar cliente |
| PUT | `/clientes` | Atualizar cliente |

**Filtros search**: `codigo`, `nome`, `cnpj`, `ativo`, `id`

### Produtos

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/produtos` | Todos os produtos |
| GET | `/produtos/search` | Buscar por filtros |
| GET | `/produtos/:codigo` | Produto por código |
| POST | `/produtos` | Criar produto |
| PUT | `/produtos` | Atualizar produto |

**Filtros search**: `codigo`, `descricao`, `marca`, `grupo`, `ativo`, `id`

**Body POST produto**:
```json
{
  "id": "string",
  "estoque": 0,
  "preco": 0,
  "unidade_medida": "und",
  "grupo": 0,
  "origem": "0",
  "descricao": "string",
  "num_fabricante": "",
  "num_original": "",
  "sku": "",
  "marca": 0,
  "ativo": "S",
  "class_fiscal": "",
  "cst": "",
  "caracteristica": 0,
  "observacoes1": "",
  "observacoes2": "",
  "observacoes3": "",
  "tipo": 0
}
```

**Response produto**:
```json
{
  "codigo": 0,
  "id": "string",
  "estoque": 0,
  "preco": "0",
  "unidade_medida": "und",
  "grupo": 0,
  "origem": "0",
  "descricao": "string",
  "num_fabricante": "",
  "num_original": "",
  "sku": "",
  "marca": 0,
  "ativo": "S",
  "class_fiscal": "",
  "cst": "",
  "caracteristica": 0,
  "data_cadastro": "YYYY-MM-DD HH:MM:SS",
  "data_recadastro": "YYYY-MM-DD HH:MM:SS",
  "observacoes1": "",
  "observacoes2": "",
  "observacoes3": "",
  "tipo": 0,
  "fotos": [
    {
      "codigo": 0,
      "produto": 0,
      "sequencia": 0,
      "descricao": "",
      "link": "",
      "foto": "",
      "data_cadastro": "YYYY-MM-DD HH:MM:SS",
      "data_recadastro": "YYYY-MM-DD HH:MM:SS"
    }
  ]
}
```

### Locais

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/locais` | Todos os locais |
| GET | `/locais/search` | Buscar por filtros |
| POST | `/locais` | Criar local |
| PUT | `/locais` | Atualizar local |

### Formas de Pagamento

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/formas_pagamento` | Todas as formas |
| GET | `/formas_pagamento/search` | Buscar por filtros |
| POST | `/formas_pagamento` | Criar forma |
| PUT | `/formas_pagamento` | Atualizar forma |

### Movimentos de Produto

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/movimentos_produtos` | Todos os movimentos |
| GET | `/movimentos_produtos/search` | Buscar por filtros |
| POST | `/movimentos_produtos` | Criar movimento |
| POST | `/bulk/movimentos_produtos` | Criar bulk |

### Setores

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/setores` | Todos os setores |
| GET | `/setores/search` | Buscar por filtros |
| POST | `/setores` | Criar setor |
| PUT | `/setores` | Atualizar setor |

### Setor de Produto (Estoque)

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/produtos-setor` | Todas relações |
| GET | `/produtos-setor/search` | Buscar por filtros |
| PUT | `/produtos-setor` | Atualizar estoque |
| PUT | `/bulk/produtos-setor` | Bulk atualizar |

### Serviços

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/servicos` | Todos os serviços |
| GET | `/servicos/search` | Buscar por filtros |
| POST | `/servicos` | Criar serviço |
| PUT | `/servicos` | Atualizar serviço |

### Tipos de OS

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/tipo_os` | Todos os tipos |
| GET | `/tipo_os/search` | Buscar por filtros |
| POST | `/tipo_os` | Criar tipo |
| PUT | `/tipo_os` | Atualizar tipo |

### Veículos

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/veiculos` | Todos os veículos |
| GET | `/veiculos/search` | Buscar por filtros |
| POST | `/veiculos` | Criar veículo |
| PUT | `/veiculos` | Atualizar veículo |

### Usuários

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/usuarios` | Todos os usuários |
| GET | `/usuarios` | Usuário atual |
| GET | `/usuarios/search` | Buscar por filtros |
| POST | `/usuarios` | Criar usuário |

### Categorias

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/categorias` | Todas as categorias |
| GET | `/categorias/search` | Buscar por filtros |
| POST | `/categorias` | Criar categoria |
| PUT | `/categorias` | Atualizar categoria |

### Fotos

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/fotos` | Todas as fotos |
| GET | `/fotos/produto` | Fotos por produto |
| POST | `/fotos/produto` | Criar/atualizar foto |

### Pedidos

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/pedidos` | Criar/atualizar pedidos (batch) |
| GET | `/pedidos` | Buscar por data/vendedor |
| GET | `/pedidos/totais` | Totais por vendedor |
| GET | `/pedidos/ultimos` |Últimos pedidos |
| GET | `/pedidos/totais-por-data` | Totais por data |

### Perfis e Permissões

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/bulk/perfis` | Todos os perfis |
| GET | `/perfis/search` | Buscar perfis |
| POST | `/perfis` | Criar perfil |
| PUT | `/perfis` | Atualizar perfil |
| DELETE | `/perfis` | Deletar perfil |
| GET | `/permissoes` | Todas permissões |
| GET | `/perfis/:codigo/permissoes` | Permissões perfil |
| POST | `/perfis/:codigo/permissoes` | Atualizar permissões |

### Empresa

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/empresa` | Dados da empresa |
| PUT | `/empresa` | Atualizar branding |
| POST | `/criar-empresa` | Criar empresa+usuário |

---

## Campos Enum de Referência

### Ativo
- `S` = Sim/Ativo
- `N` = Não/Inativo

### Situação Separação (Pedidos)
- `N` = Não separado
- `P` = Parcialmente separado
- `I` = Integralmente separado

### Enviado (Pedidos)
- `S` = Enviado
- `N` = Não enviado

---

## Exemplos de Requisições

### Login

```typescript
const login = async (email: string, senha: string) => {
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};
```

### Buscar Produtos

```typescript
const getProducts = async (token: string, filters?: object) => {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`/produtos/search?${params}`, {
    headers: { 'token': token }
  });
  return response.json();
};
```

### Criar Produto

```typescript
const createProduct = async (token: string, product: object) => {
  const response = await fetch('/produtos', {
    method: 'POST',
    headers: {
      'token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  });
  return response.json();
};
```

### Atualizar Produto

```typescript
const updateProduct = async (token: string, product: object) => {
  const response = await fetch('/produtos', {
    method: 'PUT',
    headers: {
      'token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(product)
  });
  return response.json();
};
```

---

## Tratamento de Erros

```typescript
const handleRequest = async (token: string, url: string, options?: object) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'token': token,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Erro na requisição');
  }

  return data;
};
```

---

## Integração Mercado Livre

### Autorização

```
GET /ml/integration/getCode -> URL de autorização
GET /ml/integration/callback -> OAuth callback
POST /ml/integration/finalizeIntegration -> Finalizar integración
```

### Anúncios

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/ml/anuncios/create` | Criar no ML |
| POST | `/ml/anuncios/register` | Registrar no banco |
| GET | `/ml/get/anuncios` | Anúncios do vendedor |
| GET | `/ml/anuncios` | Anúncios registrados |
| GET | `/ml/anuncios/:id` | Por ID |
| PUT | `/ml/anuncios/update/:id` | Atualizar |
| DELETE | `/ml/anuncios/delete/:id` | Deletar |

### Ferramentas

```
POST /ml/tools/predict-category -> Prever categoria por título
GET /ml/accounts/:codigo -> Contas ML do usuário
GET /ml/user_test -> Testar integração
```