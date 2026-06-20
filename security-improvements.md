# Melhorias de Segurança - JWT + Application Token

## Objetivo

Implementar uma camada dupla de autenticação/autorização:
- **JWT** (header `Authorization: Bearer`) — autentica o **usuário** (quem fez a requisição)
- **application_token** (header `x-application-token`) — autoriza a **aplicação** (de onde veio a requisição)

Ambos serão obrigatórios para a maioria das rotas, exceto algumas específicas (health, login, criar-empresa, webhooks).

---

## Fase 1 — Correções no JWT Atual

### 1.1 Corrigir `DecodedToken` (callback assíncrono)

**Arquivo:** `src/services/decoded-token/decodedToken.ts`

**Problema:** O callback de `jwt.verify()` é assíncrono, mas os `return` dentro dele só saem do callback, não da função externa. A função sempre retorna `{ success: true, payload: decoded }` independente do token ser inválido/expirado.

**Solução:** Migrar para a chamada síncrona de `jwt.verify()` que retorna o payload ou lança exceção.

```typescript
// Exemplo da correção
import jwt from "jsonwebtoken";

type Decoded = {
    cnpj: string;
    email: string;
    codigo: number;
    iat: number;
    exp: number;
};

interface ResponseDecodedToken {
    success: boolean;
    message?: string;
    payload?: Decoded;
}

export function DecodedToken(token: string): ResponseDecodedToken {
    const secret = process.env.SECRET;
    if (!secret) {
        return { success: false, message: "SECRET não informado" };
    }

    try {
        const decoded = jwt.verify(token, secret) as Decoded;
        if (!decoded.cnpj) {
            return { success: false, message: "Payload do JWT inválido: CNPJ ausente" };
        }
        return { success: true, payload: decoded };
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            return { success: false, message: "Token expirado" };
        }
        return { success: false, message: `Erro na verificação do JWT: ${err.message}` };
    }
}
```

### 1.2 Adicionar expiração ao JWT

**Arquivo:** `src/routes/login/login.ts`

**Problema:** `jwt.sign()` é chamado sem `expiresIn` — tokens nunca expiram.

**Solução:** Adicionar `expiresIn: "24h"` no `jwt.sign()`.

```typescript
const token = jwt.sign(payload, secret, { expiresIn: "24h" });
```

### 1.3 Remover senha do payload do JWT

**Arquivo:** `src/routes/login/login.ts`

**Problema:** O campo `senha` (password) está incluído no payload do JWT.

**Solução:** Remover `senha` do objeto `payload` passado para `jwt.sign()`.

```typescript
const payload = {
    cnpj: cnpj,
    email: email,
    codigo: codigoUsuario
    // senha removido
};
```

---

## Fase 2 — Tabela `api_clients`

### 2.1 Criar tabela no banco `DB_API`

```sql
CREATE TABLE api_clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    application_token VARCHAR(255) NOT NULL UNIQUE,
    active TINYINT(1) DEFAULT 1,
    last_used_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

O `application_token` bruto é exibido **uma única vez** na criação. No banco armazenamos apenas o hash (bcrypt).

Adicionar a criação desta tabela em `src/database/tables-structures/database-api.ts`.

### 2.2 Models

Criar diretório `src/models/api-client/` com:

**`types.ts`**
```typescript
export interface ApiClient {
    id: number;
    name: string;
    description: string | null;
    application_token: string;
    active: number;
    last_used_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateApiClientInput {
    name: string;
    description?: string;
}
```

**`insert.ts`**
```typescript
import { conn } from "../../database/databaseConfig.ts";

export class InsertApiClient {
    async create(name: string, description: string | null, hashedToken: string): Promise<number> {
        const sql = `INSERT INTO \`${process.env.DB_API}\`.api_clients (name, description, application_token) VALUES (?, ?, ?)`;
        const [result] = await conn.query(sql, [name, description, hashedToken]);
        return (result as any).insertId;
    }
}
```

**`select.ts`**
```typescript
import { conn } from "../../database/databaseConfig.ts";
import { type ApiClient } from "./types.ts";

export class SelectApiClient {
    async findByToken(tokenHash: string): Promise<ApiClient | null> {
        const sql = `SELECT * FROM \`${process.env.DB_API}\`.api_clients WHERE application_token = ? AND active = 1`;
        const [rows] = await conn.query(sql, [tokenHash]);
        const result = rows as ApiClient[];
        return result.length > 0 ? result[0] : null;
    }

    async findById(id: number): Promise<ApiClient | null> {
        const sql = `SELECT id, name, description, active, last_used_at, created_at, updated_at FROM \`${process.env.DB_API}\`.api_clients WHERE id = ?`;
        const [rows] = await conn.query(sql, [id]);
        const result = rows as ApiClient[];
        return result.length > 0 ? result[0] : null;
    }

    async list(): Promise<ApiClient[]> {
        const sql = `SELECT id, name, description, active, last_used_at, created_at, updated_at FROM \`${process.env.DB_API}\`.api_clients ORDER BY created_at DESC`;
        const [rows] = await conn.query(sql);
        return rows as ApiClient[];
    }
}
```

**`update.ts`**
```typescript
import { conn } from "../../database/databaseConfig.ts";

export class UpdateApiClient {
    async updateStatus(id: number, active: boolean): Promise<void> {
        const sql = `UPDATE \`${process.env.DB_API}\`.api_clients SET active = ? WHERE id = ?`;
        await conn.query(sql, [active ? 1 : 0, id]);
    }

    async updateLastUsed(id: number): Promise<void> {
        const sql = `UPDATE \`${process.env.DB_API}\`.api_clients SET last_used_at = NOW() WHERE id = ?`;
        await conn.query(sql, [id]);
    }
}
```

---

## Fase 3 — Endpoints Admin (gerenciamento de tokens)

Criar `src/routes/admin/api-clients.ts`:

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/admin/api-clients` | Cria novo `application_token` |
| `GET` | `/admin/api-clients` | Lista todos os clients (sem o token) |
| `PATCH` | `/admin/api-clients/:id/status` | Ativa/desativa um client |
| `DELETE` | `/admin/api-clients/:id` | Remove um client |

### Regras:
- Todos os endpoints admin exigem **JWT de usuário** com permissão admin
- `POST /admin/api-clients` recebe `{ name, description? }`, gera um token com prefixo `tk_` + 32 bytes hex (`tk_a1b2c3d4...`), armazena o hash (bcrypt) e retorna o token bruto **uma única vez**
- `GET /admin/api-clients` retorna a lista sem o campo `application_token`
- O token gerado deve ter no mínimo 64 caracteres

---

## Fase 4 — Hook de Autenticação Dupla

Criar `src/middleware/authHook.ts`:

### Funcionamento

1. Extrai JWT do header `Authorization: Bearer <token>`
2. Extrai `application_token` do header `x-application-token`
3. Valida o JWT (função `DecodedToken` corrigida) → `request.user`
4. Gera hash bcrypt do `application_token` recebido
5. Busca na tabela `api_clients` pelo hash
6. Verifica se o client está ativo (`active = 1`)
7. Atualiza `last_used_at` do client
8. Se ambos válidos → `next()`
9. Se falhar → retorna 401/403

### Exceções (rotas sem autenticação dupla)

Usar `config.auth` no schema da rota:

```typescript
// Rota pública — sem auth
server.get('/health', {
    config: { auth: false }
}, handler);

// Rota que aceita apenas application_token (ex: criar-empresa)
server.post('/criar-empresa', {
    config: { auth: { applicationOnly: true } }
}, handler);
```

**Rotas com exceção:**
| Rota | Regra |
|------|-------|
| `GET /health` | Sem auth |
| `POST /login` | Apenas JWT (gera o JWT) |
| `POST /criar-empresa` | Apenas application_token |
| `POST /ml/notifications` | Sem auth (webhook Mercado Livre) |
| `GET /ml/integration/callback` | Sem auth (OAuth callback ML) |

### Registro do hook

Em `src/app-routes.ts`, registrar como `preHandler` global **antes** de todas as rotas:

```typescript
import { authHook } from "./middleware/authHook.ts";

server.addHook('preHandler', authHook);
```

### Tipos estendidos no Fastify

Criar `src/types/fastify.d.ts`:

```typescript
import "fastify";

declare module "fastify" {
    interface FastifyRequest {
        user?: {
            cnpj: string;
            email: string;
            codigo: number;
        };
        application?: {
            id: number;
            name: string;
        };
    }
}
```

---

## Fase 5 — CORS

**Arquivo:** `src/app-routes.ts`

**Alteração:** Restringir origens permitidas e adicionar `x-application-token` nos headers permitidos.

```typescript
const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
    : ["https://seudominio.com.br"];

server.register(cors, {
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "token", "x-application-token"],
    credentials: true,
});
```

Adicionar `CORS_ORIGINS` no arquivo `.env.example`.

---

## Fase 6 — Resumo de Arquivos Alterados/Criados

### Criados

| Arquivo | Descrição |
|---------|-----------|
| `src/models/api-client/types.ts` | Interfaces do model |
| `src/models/api-client/insert.ts` | Insert de application_tokens |
| `src/models/api-client/select.ts` | Select de application_tokens |
| `src/models/api-client/update.ts` | Update de application_tokens |
| `src/middleware/authHook.ts` | Hook de autenticação dupla |
| `src/routes/admin/api-clients.ts` | Endpoints admin CRUD |
| `src/types/fastify.d.ts` | Extensão de tipos do Fastify |

### Alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/services/decoded-token/decodedToken.ts` | Corrigir callback síncrono |
| `src/routes/login/login.ts` | Adicionar `expiresIn`, remover `senha` |
| `src/database/tables-structures/database-api.ts` | Add `api_clients` table creation |
| `src/app-routes.ts` | Add hook global, CORS, rotas admin |
| `.env.example` | Add `CORS_ORIGINS` |

---

## Observações

- **Mobile apps não sofrem restrições de CORS** — a configuração de CORS afeta apenas o frontend web
- O `application_token` deve ser armazenado de forma segura no parceiro (ERP, sistema externo)
- O hash bcrypt do token garante que mesmo com acesso ao banco, o token original não pode ser recuperado
- O campo `last_used_at` permite auditoria de quais aplicações estão ativas
