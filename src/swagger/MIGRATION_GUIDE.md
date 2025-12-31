# 🔄 Guia de Migração - Swagger Modular

Este guia ajudará você a migrar gradualmente do arquivo `swagger.json` monolítico para a estrutura modular.

## 📋 Checklist de Migração

### Fase 1: Preparação ✅
- [x] Estrutura de diretórios criada
- [x] Script de compilação configurado
- [x] Componentes base criados

### Fase 2: Migração por Domínio

Para cada domínio (produtos, clientes, categorias, etc.):

- [ ] Extrair paths do domínio para `paths/{dominio}.json`
- [ ] Extrair schemas para `components/schemas/{dominio}.json`
- [ ] Substituir exemplos inline por referências a schemas
- [ ] Testar compilação: `npm run build:swagger`
- [ ] Validar no Swagger UI
- [ ] Remover do `swagger.json` antigo

## 🎯 Estratégia de Migração

### Opção 1: Migração Gradual (Recomendado)

1. **Mantenha o arquivo antigo funcionando**
2. **Migre um domínio por vez**
3. **Teste cada migração**
4. **Remova do arquivo antigo após validação**

### Opção 2: Migração Completa

1. **Migre todos os domínios de uma vez**
2. **Teste tudo**
3. **Substitua o arquivo antigo**

## 📝 Passo a Passo Detalhado

### Passo 1: Identificar Domínios

Analise seu `swagger.json` atual e liste os domínios:

```bash
# Exemplo de como identificar tags únicas
grep -o '"tags":\["[^"]*"\]' src/swagger.json | sort | uniq
```

Domínios identificados no seu projeto:
- produtos
- clientes
- categorias
- marcas
- servicos
- veiculos
- formas de pagamento
- tipos de os
- pedidos
- empresa
- autenticacao
- usuarios

### Passo 2: Extrair um Domínio

Vamos usar **produtos** como exemplo:

#### 2.1. Identificar todos os paths relacionados

No `swagger.json` antigo, encontre todos os paths que começam com `/produto` ou têm tag `"produtos"`.

#### 2.2. Criar arquivo de paths

Crie `src/swagger/paths/produtos.json` e copie os paths encontrados.

#### 2.3. Identificar schemas repetidos

Procure por objetos JSON repetidos nos exemplos. Estes devem virar schemas.

#### 2.4. Criar schemas

Crie `src/swagger/components/schemas/produto.json` com os schemas identificados.

#### 2.5. Substituir exemplos por referências

Substitua exemplos inline por referências:

**Antes:**
```json
{
  "examples": {
    "produto": {
      "value": {
        "codigo": 123,
        "descricao": "Produto"
      }
    }
  }
}
```

**Depois:**
```json
{
  "schema": {
    "$ref": "#/components/schemas/Produto"
  }
}
```

### Passo 3: Compilar e Testar

```bash
npm run build:swagger
```

Verifique se:
- O arquivo `swagger.json` foi gerado
- Não há erros de JSON
- Os paths aparecem corretamente

### Passo 4: Validar no Swagger UI

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/v1/api-docs`
3. Verifique se os endpoints aparecem
4. Teste os endpoints documentados

### Passo 5: Remover do Arquivo Antigo

Após validar, remova os paths migrados do `swagger.json` antigo.

## 🔍 Ferramentas Úteis

### Validador JSON Online
- https://jsonlint.com/
- https://jsonformatter.org/

### Validador Swagger
- https://editor.swagger.io/
- Cole o conteúdo do `swagger.json` gerado

### Extensões VS Code
- **Swagger Viewer** - Visualizar Swagger no VS Code
- **JSON Tools** - Formatar e validar JSON

## ⚠️ Problemas Comuns

### 1. Referências não funcionam

**Problema:** `$ref` não resolve corretamente

**Solução:**
- Verifique se o schema existe em `components/schemas/`
- Use o caminho correto: `#/components/schemas/NomeSchema`
- Certifique-se de que o schema foi compilado corretamente

### 2. JSON inválido

**Problema:** Erro ao compilar

**Solução:**
- Use um validador JSON
- Verifique vírgulas e chaves
- Certifique-se de que strings estão entre aspas duplas

### 3. Paths duplicados

**Problema:** Mesmo path em múltiplos arquivos

**Solução:**
- Cada path deve estar em apenas um arquivo
- Organize por domínio lógico
- O script de compilação mescla os arquivos, então duplicatas causarão sobrescrita

### 4. Schemas não aparecem

**Problema:** Schemas definidos mas não referenciados

**Solução:**
- Verifique se o arquivo está em `components/schemas/`
- Certifique-se de que o JSON é válido
- Execute `npm run build:swagger` novamente

## 📊 Progresso Sugerido

Migre na seguinte ordem (do mais simples ao mais complexo):

1. ✅ **Autenticação** - Poucos endpoints, bem definidos
2. ⏳ **Produtos** - Já iniciado como exemplo
3. ⏳ **Clientes** - Similar a produtos
4. ⏳ **Categorias** - Simples
5. ⏳ **Marcas** - Simples
6. ⏳ **Serviços** - Similar a produtos
7. ⏳ **Veículos** - Similar a produtos
8. ⏳ **Formas de Pagamento** - Simples
9. ⏳ **Tipos de OS** - Simples
10. ⏳ **Pedidos** - Mais complexo, relaciona vários domínios
11. ⏳ **Empresa** - Simples
12. ⏳ **Usuários** - Simples

## ✅ Checklist Final

Após migrar todos os domínios:

- [ ] Todos os paths foram migrados
- [ ] Todos os schemas foram extraídos
- [ ] Compilação funciona sem erros
- [ ] Swagger UI mostra todos os endpoints
- [ ] Exemplos funcionam corretamente
- [ ] Documentação está atualizada
- [ ] Arquivo `swagger.json` antigo pode ser removido (ou mantido como backup)

## 🎉 Benefícios Após Migração

1. **Manutenibilidade:** Arquivos menores e mais fáceis de navegar
2. **Colaboração:** Múltiplos desenvolvedores podem trabalhar simultaneamente
3. **Reutilização:** Schemas compartilhados reduzem duplicação
4. **Organização:** Estrutura clara por domínio
5. **Versionamento:** Mudanças isoladas por domínio
6. **Performance:** Compilação mais rápida

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs do script de compilação
2. Valide o JSON em cada arquivo
3. Consulte o README.md principal
4. Teste com um domínio simples primeiro

