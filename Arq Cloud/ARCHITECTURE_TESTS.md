# Testes de Arquitetura (Architecture Tests)

## Visão Geral

Testes de arquitetura validam que o código segue as regras arquiteturais definidas. São como "linters para arquitetura" - garantem que os desenvolvedores não quebrem os princípios arquiteturais acidentalmente.

## Por que Testes de Arquitetura?

### Problemas que Resolvem:
- ❌ Developer adiciona lógica de negócio no controller
- ❌ Use case instancia repository diretamente (quebra DI)
- ❌ Entidade de domínio importa Mongoose
- ❌ Feature A importa código da Feature B (quebra independência)
- ❌ Apresentação acessa banco de dados diretamente

### Solução:
✅ Testes automatizados que **falham** quando regras são quebradas!

## Conceito

Similar ao **ArchUnit** (Java), mas para Node.js:

```javascript
describe('Clean Architecture Rules', () => {
  it('Domain layer should not depend on any other layer', () => {
    const domainFiles = getFilesInDirectory('src/domain');

    domainFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');

      // Domain should not import from infrastructure
      expect(content).not.toMatch(/require\(['"].*\/infrastructure\//);
    });
  });
});
```

Se um dev escrever:
```javascript
// src/domain/entities/User.js
const mongoose = require('mongoose'); // ❌ ERRO!
```

O teste **FALHA** com:
```
Domain layer should not depend on any other layer
Expected mongoose import NOT to be found in domain layer
```

## Estrutura

### Users Microservice (Clean Architecture)
```
tests/
└── architecture/
    └── CleanArchitecture.test.js
```

### Events Microservice (Vertical Slice)
```
tests/
└── architecture/
    └── VerticalSlice.test.js
```

## Regras Testadas

### 1. Clean Architecture (Users)

#### Regra de Dependência (Dependency Rule)
```javascript
it('Domain layer should not depend on any other layer', () => {
  // Domain não pode importar de:
  // - Application
  // - Infrastructure
  // - Presentation
  // - Frameworks externos (Mongoose, Express, etc)
});

it('Application layer should only depend on Domain layer', () => {
  // Application pode importar Domain
  // Application NÃO pode importar Infrastructure ou Presentation
});
```

#### Princípio da Inversão de Dependência
```javascript
it('Use cases should receive dependencies via constructor (DI)', () => {
  // Use cases devem ter constructor com parâmetros
  // Use cases NÃO devem instanciar dependências diretamente
  expect(content).toMatch(/constructor\s*\([^)]+\)/);
  expect(content).not.toMatch(/new\s+MongoUserRepository/);
});

it('Repositories should implement interfaces', () => {
  // Repositórios concretos devem estender interfaces
  expect(content).toMatch(/extends\s+I\w+Repository/);
});
```

#### Convenções de Nomenclatura
```javascript
it('Repository interfaces should start with I', () => {
  // IUserRepository.js ✅
  // UserRepository.js ❌
  expect(file).toMatch(/^I[A-Z]/);
});

it('Use cases should end with UseCase', () => {
  // RegisterUserUseCase.js ✅
  // RegisterUser.js ❌
  expect(file).toMatch(/UseCase\.js$/);
});
```

#### Pureza de Entidades
```javascript
it('Entities should not have framework dependencies', () => {
  // Entidades devem ser classes puras
  expect(content).not.toMatch(/require\(['"]mongoose['"]\)/);
  expect(content).not.toMatch(/mongoose\.Schema/);
});
```

### 2. Vertical Slice (Events)

#### Organização por Features
```javascript
it('Each feature should be in its own directory', () => {
  // features/events/CreateEvent/ ✅
  // features/events/GetEvents/ ✅
});

it('Each slice should have handler, endpoint, and index files', () => {
  // CreateEvent.handler.js ✅
  // CreateEvent.endpoint.js ✅
  // index.js ✅
});
```

#### Independência de Features
```javascript
it('Features should not import from other features', () => {
  // CreateEvent não pode importar de GetEvents
  // Cada feature é auto-contida
  slices.forEach(otherSlice => {
    if (slice !== otherSlice) {
      expect(content).not.toMatch(/require.*\/${otherSlice}\//);
    }
  });
});
```

#### Regras de Handler
```javascript
it('Handlers should be classes with handle method', () => {
  expect(content).toMatch(/class\s+\w+Handler/);
  expect(content).toMatch(/async\s+handle\s*\(/);
});

it('Handlers should contain business logic and data access', () => {
  // Handler deve ter acesso ao banco
  const hasDataAccess =
    content.includes('getPool') ||
    content.includes('query');
  expect(hasDataAccess).toBe(true);
});
```

#### Regras de Endpoint
```javascript
it('Endpoints should be thin adapters', () => {
  // Endpoint deve chamar handler
  expect(content).toMatch(/handler\.handle/);

  // Endpoint NÃO deve ter SQL (isso fica no handler)
  expect(content).not.toMatch(/SELECT|INSERT|UPDATE|DELETE/);
});
```

## Como Executar

### Executar todos os testes de arquitetura

```bash
# Users Microservice (Clean Architecture)
cd "Arq Cloud/projeto-microservico-users"
npm test tests/architecture

# Events Microservice (Vertical Slice)
cd "Arq Cloud/projeto-microservico-products"
npm test tests/architecture
```

### Executar teste específico

```bash
npm test tests/architecture/CleanArchitecture.test.js
npm test tests/architecture/VerticalSlice.test.js
```

### Executar em modo watch

```bash
npm test -- --watch tests/architecture
```

### Ver cobertura

```bash
npm test -- --coverage tests/architecture
```

## Exemplo de Saída

### ✅ Todos os testes passando:

```
PASS tests/architecture/CleanArchitecture.test.js
  Clean Architecture Rules - Users Microservice
    Layer Dependency Rules
      ✓ Domain layer should not depend on any other layer (45ms)
      ✓ Application layer should only depend on Domain layer (32ms)
      ✓ Infrastructure layer should depend on Domain and Application (21ms)
      ✓ Presentation layer can depend on Application and Infrastructure (18ms)
    Naming Conventions
      ✓ Repository interfaces should start with I (12ms)
      ✓ Use cases should end with UseCase (15ms)
    Dependency Inversion Principle
      ✓ Use cases should receive dependencies via constructor (DI) (28ms)
      ✓ Repositories should implement interfaces (19ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### ❌ Teste falhando (violação detectada):

```
FAIL tests/architecture/CleanArchitecture.test.js
  Clean Architecture Rules - Users Microservice
    Layer Dependency Rules
      ✕ Domain layer should not depend on any other layer (52ms)

  ● Domain layer should not depend on any other layer

    expect(received).not.toMatch(expected)

    Expected pattern: not /require\(['"]mongoose['"]\)/
    Received string: "const mongoose = require('mongoose');"

    File: src/domain/entities/User.js

      15 | domainFiles.forEach(file => {
      16 |   const content = fs.readFileSync(file, 'utf-8');
    > 17 |   expect(content).not.toMatch(/require\(['"]mongoose['"]\)/);
         |                       ^
      18 | });
```

**Isso é ÓTIMO!** O teste detectou a violação **automaticamente**!

## Integração com CI/CD

### GitHub Actions

```yaml
name: Architecture Tests

on: [push, pull_request]

jobs:
  architecture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test tests/architecture
```

Agora, se alguém criar um Pull Request que quebra a arquitetura, o CI/CD **bloqueia o merge**!

## Benefícios

### 1. Documentação Executável
As regras arquiteturais estão **codificadas** nos testes, não apenas em docs que ninguém lê.

### 2. Feedback Rápido
Dev descobre violação em **segundos**, não semanas depois em code review.

### 3. Proteção Contra Regressão
Arquitetura não degrada com o tempo porque testes garantem conformidade.

### 4. Onboarding
Novos devs aprendem as regras lendo os testes.

### 5. Refatoração Segura
Pode refatorar com confiança - se quebrar a arquitetura, os testes falham.

## Quando Executar

- ✅ **Localmente**: Antes de commit (pre-commit hook)
- ✅ **CI/CD**: Em toda PR
- ✅ **Pre-merge**: Antes de aceitar PR
- ✅ **Nightly**: Build noturno para garantir consistência

## Limitações

### O que esses testes NÃO garantem:
- ❌ Lógica de negócio correta (use testes unitários)
- ❌ Integração entre componentes (use testes de integração)
- ❌ Performance (use testes de carga)
- ❌ Funcionalidade end-to-end (use E2E tests)

### O que eles GARANTEM:
- ✅ Estrutura arquitetural consistente
- ✅ Dependências fluindo na direção correta
- ✅ Camadas/features isoladas corretamente
- ✅ Convenções de nomenclatura seguidas

## Expandindo os Testes

### Adicionar nova regra:

```javascript
it('Controllers should not contain business logic', () => {
  const controllers = getFilesInDirectory('src/presentation/controllers');

  controllers.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    // Controllers com mais de 50 linhas provavelmente têm lógica demais
    expect(lines.length).toBeLessThan(50);
  });
});
```

### Testar complexidade ciclomática:

```javascript
const complexity = require('complexity-report');

it('Handlers should have low cyclomatic complexity', () => {
  const handlers = getAllFiles('src/features/**/*.handler.js');

  handlers.forEach(file => {
    const report = complexity.run(fs.readFileSync(file, 'utf-8'));
    expect(report.aggregate.cyclomatic).toBeLessThan(10);
  });
});
```

## Referências

- [ArchUnit (Java)](https://www.archunit.org/)
- [Architecture Tests - Martin Fowler](https://martinfowler.com/articles/domain-oriented-observability.html)
- [Fitness Functions](https://www.thoughtworks.com/insights/articles/fitness-function-driven-development)

---

**Implementado por**: [ADICIONAR NOMES DOS ALUNOS]
**Data**: Janeiro 2025
**Disciplina**: Arquitetura Cloud
