# AGENTS.md

## Overview
This is a Node.js/TypeScript Fastify API with MySQL database, RabbitMQ message broker, and Mercado Livre integration.

## Build/Lint/Test Commands

### Development
```bash
# Run development server with hot reload
npm run dev

# Seed the database
npm run db:seed
```

### Testing
```bash
# Run all tests with coverage
npm run teste:all

# Seed test database
npm run teste:seed
```

### Single Test Execution
Tests use Node.js built-in test runner. To run a single test file:
```bash
node --env-file .env.test --experimental-strip-types --test src/__test__/your-test-file.ts
```

### TypeScript Compilation
This project uses `--experimental-strip-types` flag for running TypeScript directly without compilation. For type checking:
```bash
npx tsc --noEmit
```

---

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled** - All strict checks are on
- Target: ES2022
- Module: NodeNext (ES modules with `.ts` extensions)
- Always use explicit types for function parameters and return values

### Project Structure
```
src/
├── __test__/           # Test files
├── broker/             # RabbitMQ connections and publishers
├── config/             # Configuration (multer, etc.)
├── controllers/         # Business logic controllers
├── database/           # Database config, seeds, table structures
├── middleware/          # Express/Fastify middleware
├── models/             # Data access layer (select, insert, update, types)
├── routes/             # Fastify route definitions
├── services/           # Utility services
├── types/              # Shared TypeScript type definitions
├── utils/              # Helper utilities
├── server.ts           # Application entry point
└── app-routes.ts       # Route registration
```

### Naming Conventions

**Files:**
- Routes: `kebab-case.ts` (e.g., `product-movement.ts`)
- Models: `kebab-case.ts` with subdirectories for operations:
  - `model-name/select.ts`, `insert.ts`, `update.ts`, `types.ts`
- Services: `PascalCase.ts` (e.g., `DateService.ts`)
- Utils: `camelCase.ts` (e.g., `dateService.ts`)

**Classes:**
- PascalCase: `SelectOrder`, `InsertUserApi`, `DateService`

**Variables/Functions:**
- camelCase: `findByEmail`, `dbName`, `selectPedido`
- Constants: UPPER_SNAKE_CASE for env-related: `DB_HOST`, `SECRET`

**Database References:**
- Dynamic table/database names wrapped in backticks: `` `${dbName}.pedidos` ``
- CNPJ-based database names: `` `\`${cnpj}\`` ``

### Import Patterns

```typescript
// Standard imports
import { conn } from "../../database/databaseConfig.ts";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

// Named imports for type-only
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { type OrderType, type OrderReceivedType } from "./types/order-type.ts";

// Relative paths use `.ts` extension
import { SelectOrder } from "../../models/order/select.ts";
```

### Fastify Routes Pattern

Routes use `FastifyPluginAsyncZod` with inline Zod schemas:

```typescript
import { type FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

const routeName: FastifyPluginAsyncZod = async (server) => {
    server.METHOD('/path', {
        schema: {
            tags: ['resource'],
            headers: z.object({
                token: z.string()
            }),
            querystring: z.object({
                param: z.coerce.number().optional()
            }),
            body: z.object({
                field: z.string()
            }),
            response: {
                200: z.object({ ... }),
                400: z.object({ ... }),
                500: z.object({ ... })
            }
        }
    }, async (request, reply) => {
        // Handler logic
        return reply.status(200).send({ result });
    });
};

export { routeName };
export default routeName;
```

### Zod Validation Patterns

```typescript
// String with optional
z.string().optional()

// Number coercion from string
z.coerce.number()

// Enum values
z.enum(['S', 'N'])

// Union types
z.union([z.number(), z.string()])

// Arrays
z.array(z.object({ ... }))

// Object with optional fields
z.object({
    field: z.string(),
    optional: z.string().optional().default('default')
})
```

### Database Access Pattern

```typescript
import { conn, db_api } from "../../database/databaseConfig.ts";
import { type MyType } from "./types/my-type.ts";

export class SelectSomething {
    async findByCode(dbName: string, code: number): Promise<MyType[]> {
        const sql = `SELECT * FROM ${dbName}.table WHERE codigo = ?`;
        const [result] = await conn.query(sql, [code]);
        return result as MyType[];
    }

    async exists(dbName: string, code: number): Promise<boolean> {
        const sql = `SELECT COUNT(*) as count FROM ${dbName}.table WHERE codigo = ?`;
        const [result] = await conn.query(sql, [code]);
        return (result as any)[0].count > 0;
    }
}
```

### Error Handling Pattern

```typescript
// Route-level error handling
try {
    const result = await service.method(params);
    return reply.status(200).send(result);
} catch (e) {
    console.error('Error description:', e);
    return reply.status(500).send({ 
        erro: true, 
        msg: 'User-friendly error message' 
    });
}

// Validation errors
if (!requiredValue) {
    return reply.status(400).send({ 
        erro: true, 
        msg: 'Validation error message' 
    });
}
```

### Authentication Pattern

JWT token validation using the `DecodedToken` service:

```typescript
import { DecodedToken } from "../../services/decoded-token/decodedToken.ts";

const decodedToken = DecodedToken(String(request.headers.token));

if (!decodedToken.payload?.cnpj) {
    return reply.status(401).send({ erro: true, msg: 'Token inválido' });
}

const empresa = decodedToken.payload.cnpj.replace(/\D/g, '');
const dbName = `\`${empresa}\``;
```

### Date Handling

Use the `DateService` utility for consistent date formatting:

```typescript
import { DateService } from "../../utils/dateService.ts";

const dateService = new DateService();
const formatted = dateService.formatarData(new Date());
const now = dateService.obterDataHoraAtual();
const valid = dateService.isValidDate('2024-01-01 10:00:00');
```

### Response Format

Consistent response structure for errors:
```typescript
{ erro: true, msg: 'Error description' }
{ success: false, message: 'Error description' }
```

Success responses return the actual data directly or with status wrapper:
```typescript
{ success: true, message: 'Success', data: [...] }
{ results: [...] }
```

### Broker/Message Publishing

```typescript
import { publishMessage } from "../../services/broker/publish-message.ts";

// Routing key pattern: tenant.{CNPJ}.{resource}.{action}
await publishMessage(cnpj, 'pedido.atualizado', payload, source);
```

---

## Environment Variables

Required in `.env`:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`
- `DB_API` - Main API database name
- `SECRET` - JWT secret key
- `PORT_API` - Server port
- `BROKER_URL`, `EXCHANGE_NAME` - RabbitMQ settings

---

## Common Tasks

### Adding a New Route
1. Create file in `src/routes/{resource}/{resource}.ts`
2. Define Zod schemas for request/response
3. Use `FastifyPluginAsyncZod` pattern
4. Register route in `app-routes.ts`

### Adding a New Model
1. Create directory: `src/models/{resource}/`
2. Add `select.ts`, `insert.ts`, `update.ts` as needed
3. Add `types.ts` for TypeScript interfaces
4. Use `conn.query()` with parameterized queries

### Adding a New Service
1. Create in `src/services/{service-name}/`
2. Export as named function or class
3. Import where needed
