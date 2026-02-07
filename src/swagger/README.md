# 📚 Documentação Swagger Modular

Esta estrutura permite organizar a documentação Swagger em arquivos menores e mais gerenciáveis, facilitando a manutenção e colaboração em equipe.

## 📁 Estrutura de Diretórios

```
src/swagger/
├── base.json                    # Configurações base do Swagger
├── build-swagger.ts             # Script de compilação
├── components/                  # Componentes reutilizáveis
│   ├── security.json           # Configurações de segurança (JWT, etc)
│   ├── schemas.json            # Schemas e respostas comuns
│   └── schemas/                # Schemas por domínio
│       ├── produto.json
│       ├── cliente.json
│       └── ...
└── paths/                       # Documentação de endpoints por domínio
    ├── produtos.json
    ├── clientes.json
    ├── autenticacao.json
    └── ...
```

## 🚀 Como Usar

### Compilar Documentação

Para gerar o arquivo `swagger.json` final:

```bash
npm run build:swagger
```

Ou diretamente:

```bash
tsx src/swagger/build-swagger.ts
```

### Modo Watch (Desenvolvimento)

Para recompilar automaticamente quando houver mudanças:

```bash
npm run swagger:watch
```

## 📝 Como Adicionar Nova Documentação

### 1. Adicionar um Novo Endpoint

Crie ou edite o arquivo correspondente em `paths/`. Por exemplo, para adicionar endpoints de clientes:

**`src/swagger/paths/clientes.json`:**

```json
{
  "/clientes": {
    "get": {
      "summary": "Listar clientes",
      "description": "Retorna lista de clientes com filtros opcionais",
      "tags": ["clientes"],
      "security": [{"bearerAuth": []}],
      "parameters": [
        {
          "$ref": "#/components/parameters/LimitParam"
        }
      ],
      "responses": {
        "200": {
          "description": "Lista de clientes",
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Cliente"
                }
              }
            }
          }
        },
        "401": {
          "$ref": "#/components/responses/Unauthorized"
        }
      }
    }
  }
}
```

### 2. Adicionar um Novo Schema

Crie um arquivo em `components/schemas/` ou adicione ao arquivo existente:

**`src/swagger/components/schemas/cliente.json`:**

```json
{
  "Cliente": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "format": "int32"
      },
      "nome": {
        "type": "string"
      },
      "email": {
        "type": "string",
        "format": "email"
      }
    },
    "required": ["nome", "email"]
  },
  "ClienteInput": {
    "type": "object",
    "properties": {
      "nome": {
        "type": "string"
      },
      "email": {
        "type": "string",
        "format": "email"
      }
    },
    "required": ["nome", "email"]
  }
}
```

### 3. Adicionar Nova Tag

Edite `base.json` e adicione na seção `tags`:

```json
{
  "name": "clientes",
  "description": "Operações relacionadas a clientes"
}
```

## ✅ Boas Práticas

### 1. **Reutilize Componentes**

Sempre que possível, use referências (`$ref`) para componentes comuns:

```json
{
  "401": {
    "$ref": "#/components/responses/Unauthorized"
  }
}
```

### 2. **Organize por Domínio**

Mantenha endpoints relacionados no mesmo arquivo:
- `produtos.json` - todos os endpoints de produtos
- `clientes.json` - todos os endpoints de clientes
- etc.

### 3. **Use Schemas Consistentes**

Defina schemas para entidades principais e reutilize:
- `Produto` - para respostas
- `ProdutoInput` - para requisições
- `ProdutoUpdate` - para atualizações (se necessário)

### 4. **Documente Parâmetros**

Sempre documente:
- Query parameters
- Path parameters
- Request body
- Response schemas

### 5. **Mantenha Exemplos**

Inclua exemplos práticos nas respostas para facilitar o entendimento:

```json
{
  "examples": {
    "produto": {
      "value": {
        "codigo": 123,
        "descricao": "Produto exemplo",
        "preco": 99.90
      }
    }
  }
}
```

### 6. **Versionamento**

Mantenha compatibilidade ao adicionar novos campos. Use `required` apenas para campos obrigatórios.

## 🔄 Migração do Arquivo Antigo

Para migrar endpoints do `swagger.json` antigo:

1. **Identifique o domínio** do endpoint
2. **Extraia o path** e mova para o arquivo correspondente em `paths/`
3. **Identifique schemas repetidos** e mova para `components/schemas/`
4. **Substitua exemplos inline** por referências a schemas
5. **Compile** e teste: `npm run build:swagger`

### Exemplo de Migração

**Antes (swagger.json monolítico):**
```json
{
  "paths": {
    "/produtos": {
      "get": {
        "summary": "busca produtos",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "examples": {
                  "produto": {
                    "value": {
                      "codigo": 2,
                      "descricao": "Produto exemplo"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Depois (estrutura modular):**

**`paths/produtos.json`:**
```json
{
  "/produtos": {
    "get": {
      "summary": "Buscar produtos",
      "responses": {
        "200": {
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Produto"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**`components/schemas/produto.json`:**
```json
{
  "Produto": {
    "type": "object",
    "properties": {
      "codigo": {"type": "integer"},
      "descricao": {"type": "string"}
    }
  }
}
```

## 🛠️ Troubleshooting

### Erro: "Cannot find module"

Certifique-se de que o TypeScript está configurado corretamente. O script usa `tsx` para executar TypeScript diretamente.

### Arquivo não aparece no swagger.json final

1. Verifique se o arquivo tem extensão `.json`
2. Verifique se o JSON é válido (use um validador JSON)
3. Execute `npm run build:swagger` novamente

### Referências não funcionam

Certifique-se de que:
- Os schemas estão em `components/schemas/`
- As referências usam o formato correto: `"$ref": "#/components/schemas/NomeSchema"`
- O schema foi definido antes de ser referenciado

## 📚 Recursos Adicionais

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/) - Para validar e visualizar
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interface de visualização

## 🎯 Próximos Passos

1. Migrar endpoints restantes do `swagger.json` antigo
2. Adicionar mais schemas reutilizáveis
3. Implementar validação automática no CI/CD
4. Adicionar exemplos mais detalhados
5. Configurar geração automática de clientes a partir do Swagger

