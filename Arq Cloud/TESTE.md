# 🧪 Guia de Testes - VIBRA Platform

Este documento explica como executar todos os testes do projeto VIBRA, incluindo os **testes de arquitetura** que validam Clean Architecture e Vertical Slice.

---

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Testes de Arquitetura](#testes-de-arquitetura)
- [Testes Unitários](#testes-unitários)
- [Testes de Integração](#testes-de-integração)
- [Troubleshooting](#troubleshooting)

---

## ✅ Pré-requisitos

Antes de executar os testes, certifique-se de ter:

- **Node.js 18+** instalado
- **npm** ou **yarn**
- **Docker** (para testes de integração)
- Dependências instaladas em cada serviço

```bash
# Instalar dependências em todos os serviços
cd "Arq Cloud"

# Users Service
cd projeto-microservico-users && npm install

# Events Service
cd ../projeto-microservico-products && npm install

# BFF Gateway
cd ../projeto-bff-gateway && npm install

# Functions Service
cd ../projeto-functions-events && npm install

# Frontend
cd ../projeto-microfrontend && npm install
```

---

## 🏗️ Testes de Arquitetura

Os testes de arquitetura validam que o código segue os padrões arquiteturais definidos. São executados com **Jest**.

### 1. Clean Architecture Tests (Users Service)

**O que testa:**
- ✅ Domain layer não depende de outras camadas
- ✅ Application layer só depende do Domain
- ✅ Infrastructure não depende de Presentation
- ✅ Controllers não acessam banco de dados diretamente
- ✅ Uso de Dependency Inversion Principle
- ✅ Entidades são puras (sem dependências de frameworks)
- ✅ Convenções de nomenclatura (IRepository, UseCase, etc)

**Como executar:**

```bash
cd projeto-microservico-users

# Executar APENAS testes de arquitetura
npm test -- tests/architecture/CleanArchitecture.test.js

# Com saída detalhada
npm test -- tests/architecture/CleanArchitecture.test.js --verbose

# Com coverage
npm test -- tests/architecture/CleanArchitecture.test.js --coverage
```

**Resultado esperado:**
```
PASS tests/architecture/CleanArchitecture.test.js
  Clean Architecture Rules - Users Microservice
    Layer Dependency Rules
      ✓ Domain layer should not depend on any other layer
      ✓ Application layer should only depend on Domain layer
      ✓ Infrastructure layer should depend on Domain and Application
      ✓ Presentation layer can depend on Application and Infrastructure
    Naming Conventions
      ✓ Repository interfaces should start with I
      ✓ Use cases should end with UseCase
      ✓ Service interfaces should start with I and end with Service
    Dependency Inversion Principle
      ✓ Use cases should receive dependencies via constructor
      ✓ Repositories should implement interfaces
    Entity Purity
      ✓ Entities should not have framework dependencies

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

---

### 2. Vertical Slice Tests (Events Service)

**O que testa:**
- ✅ Features organizadas em diretórios próprios
- ✅ Features são independentes (não importam umas das outras)
- ✅ Cada slice tem handler, endpoint e index
- ✅ Handlers contêm business logic e data access
- ✅ Endpoints são thin adapters
- ✅ Convenções de nomenclatura (PascalCase, .handler.js)
- ✅ Minimal coupling entre features

**Como executar:**

```bash
cd projeto-microservico-products

# Executar APENAS testes de arquitetura
npm test -- tests/architecture/VerticalSlice.test.js

# Com saída detalhada
npm test -- tests/architecture/VerticalSlice.test.js --verbose

# Com coverage
npm test -- tests/architecture/VerticalSlice.test.js --coverage
```

**Resultado esperado:**
```
PASS tests/architecture/VerticalSlice.test.js
  Vertical Slice Architecture Rules - Events Microservice
    Feature Organization
      ✓ Each feature should be in its own directory
      ✓ Each slice should have handler, endpoint, and index files
    Feature Independence
      ✓ Features should not import from other features
    Handler Rules
      ✓ Handlers should be classes with handle method
      ✓ Handlers should contain business logic and data access
    Endpoint Rules
      ✓ Endpoints should be thin adapters
    Naming Conventions
      ✓ Feature directories should use PascalCase
      ✓ Handler files should match pattern FeatureName.handler.js
    Minimal Coupling
      ✓ Each feature should be independently testable

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

---

### 3. Executar TODOS os Testes de Arquitetura

```bash
# Users Service - Clean Architecture
cd projeto-microservico-users
npm test -- tests/architecture/

# Events Service - Vertical Slice
cd ../projeto-microservico-products
npm test -- tests/architecture/
```

**Ou usando um script:**

```bash
#!/bin/bash
# run-architecture-tests.sh

echo "🧪 Running Architecture Tests..."
echo ""

echo "📁 Users Service - Clean Architecture"
cd projeto-microservico-users
npm test -- tests/architecture/CleanArchitecture.test.js
echo ""

echo "📁 Events Service - Vertical Slice"
cd ../projeto-microservico-products
npm test -- tests/architecture/VerticalSlice.test.js
echo ""

echo "✅ Architecture Tests Complete!"
```

Tornar executável:
```bash
chmod +x run-architecture-tests.sh
./run-architecture-tests.sh
```

---

## 🔬 Testes Unitários

Testes unitários para lógica de negócio individual.

### Users Service

```bash
cd projeto-microservico-users

# Todos os testes unitários
npm test -- tests/unit/

# Teste específico (exemplo)
npm test -- tests/unit/domain/entities/User.test.js

# Com coverage
npm test -- --coverage
```

### Events Service

```bash
cd projeto-microservico-products

# Todos os testes unitários
npm test -- tests/unit/

# Com coverage
npm test -- --coverage
```

### BFF Gateway

```bash
cd projeto-bff-gateway

# Todos os testes
npm test

# Com coverage
npm test -- --coverage
```

---

## 🔗 Testes de Integração

Testes que verificam a integração entre componentes, incluindo banco de dados e APIs.

### Pré-requisitos

Os bancos de dados precisam estar rodando:

```bash
# Iniciar bancos de dados via Docker
docker compose up -d mongodb sqlserver rabbitmq

# OU usar docker-compose.test.yml
docker compose -f docker-compose.test.yml up -d
```

### Users Service - Integration Tests

```bash
cd projeto-microservico-users

# Testes de integração
npm test -- tests/integration/

# Teste específico (exemplo)
npm test -- tests/integration/repositories/MongoUserRepository.test.js
```

### Events Service - Integration Tests

```bash
cd projeto-microservico-products

# Testes de integração
npm test -- tests/integration/

# Teste de API
npm test -- tests/integration/api/events.test.js
```

---

## 🌐 Testes End-to-End (E2E)

Testes que simulam o fluxo completo do usuário.

**IMPORTANTE**: Todos os serviços devem estar rodando!

```bash
# 1. Iniciar todos os serviços
docker compose up -d

# 2. Aguardar serviços ficarem saudáveis
docker compose ps

# 3. Executar testes E2E (quando implementados)
cd projeto-microfrontend
npm run test:e2e
```

---

## 📊 Coverage Report

Gerar relatório de cobertura de testes:

### Users Service

```bash
cd projeto-microservico-users
npm test -- --coverage --coverageDirectory=coverage

# Abrir relatório HTML
xdg-open coverage/lcov-report/index.html  # Linux
open coverage/lcov-report/index.html      # Mac
start coverage/lcov-report/index.html     # Windows
```

### Events Service

```bash
cd projeto-microservico-products
npm test -- --coverage --coverageDirectory=coverage

# Abrir relatório HTML
xdg-open coverage/lcov-report/index.html
```

---

## 🐛 Troubleshooting

### Erro: "jest: not found"

**Solução**: Instalar Jest como dependência

```bash
npm install --save-dev jest
```

### Erro: "Cannot find module ..."

**Solução**: Instalar todas as dependências

```bash
npm install
```

### Testes falhando - Clean Architecture

Se os testes de Clean Architecture falharem, verifique:

1. **Domain** não deve importar de:
   - `application/`
   - `infrastructure/`
   - `presentation/`
   - `mongoose`, `express`, `bcryptjs`

2. **Application** não deve importar de:
   - `infrastructure/`
   - `presentation/`

3. **Repository interfaces** devem começar com `I` (ex: `IUserRepository.js`)

4. **Use cases** devem terminar com `UseCase` (ex: `RegisterUserUseCase.js`)

### Testes falhando - Vertical Slice

Se os testes de Vertical Slice falharem, verifique:

1. **Features** devem estar em `src/features/`

2. Cada feature deve ter:
   - `FeatureName.handler.js`
   - `FeatureName.endpoint.js`
   - `index.js`

3. **Features NÃO devem importar** de outras features:
   ```javascript
   // ❌ ERRADO
   const { OtherFeature } = require('../other-feature/OtherFeature.handler');

   // ✅ CORRETO - usar shared
   const { DatabaseService } = require('../../shared/database');
   ```

4. **Diretórios de features** devem usar PascalCase:
   - `CreateEvent/` ✅
   - `create-event/` ❌

### Testes de Integração Falhando

Se os testes de integração falharem:

1. **Verificar se bancos estão rodando**:
```bash
docker compose ps mongodb sqlserver rabbitmq
```

2. **Verificar connection strings**:
```bash
# Verificar .env
cat projeto-microservico-users/.env | grep MONGODB_URI
cat projeto-microservico-products/.env | grep DB_
```

3. **Limpar bancos de teste**:
```bash
# Parar e remover volumes
docker compose down -v
docker compose up -d
```

---

## 📝 Melhores Práticas

### 1. Executar testes antes de commit

```bash
# Hook pre-commit (opcional)
npm test
```

### 2. Executar testes de arquitetura regularmente

Recomenda-se executar **após cada mudança estrutural**:
- Criar nova camada
- Adicionar nova feature
- Refatorar código

### 3. Manter coverage alto

**Meta**: > 80% de cobertura

```bash
# Verificar coverage atual
npm test -- --coverage
```

### 4. CI/CD Pipeline

Em produção, os testes devem rodar automaticamente:

```yaml
# .github/workflows/test.yml (exemplo)
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test -- --coverage
```

---

## 📚 Documentação Adicional

- [Clean Architecture - Users Service](projeto-microservico-users/CLEAN_ARCHITECTURE.md)
- [Vertical Slice - Events Service](projeto-microservico-products/VERTICAL_SLICE.md)
- [Architecture Tests Explained](ARCHITECTURE_TESTS.md)

---

## 🎯 Checklist de Testes

Antes de fazer deploy ou entregar o projeto:

- [ ] ✅ Testes de arquitetura passando (Clean + Vertical Slice)
- [ ] ✅ Testes unitários com > 80% coverage
- [ ] ✅ Testes de integração passando
- [ ] ✅ Testes E2E passando (se implementados)
- [ ] ✅ Sem warnings no console
- [ ] ✅ Linter passando (ESLint)
- [ ] ✅ Build sem erros

---

**Desenvolvido pela equipe VIBRA - PUCPR 2025** 🚀
