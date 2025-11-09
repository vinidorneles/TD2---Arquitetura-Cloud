# Clean Architecture - Users Microservice

## Visão Geral

Este microserviço foi refatorado para seguir os princípios da **Clean Architecture** (Arquitetura Limpa) proposta por Robert C. Martin (Uncle Bob).

## Princípios da Clean Architecture

1. **Independência de Frameworks**: A lógica de negócio não depende de bibliotecas externas
2. **Testabilidade**: As regras de negócio podem ser testadas sem UI, banco de dados ou serviços externos
3. **Independência de UI**: A UI pode mudar sem alterar o resto do sistema
4. **Independência de Banco de Dados**: Pode-se trocar MongoDB por outro banco sem afetar as regras de negócio
5. **Independência de Agentes Externos**: As regras de negócio não sabem nada sobre o mundo externo

## Estrutura de Camadas

```
src/
├── domain/                    # CAMADA DE DOMÍNIO (núcleo)
│   ├── entities/              # Entidades de negócio (User)
│   ├── value-objects/         # Objetos de valor (Email, Password)
│   └── repositories/          # Interfaces (Ports)
│
├── application/               # CAMADA DE APLICAÇÃO (casos de uso)
│   ├── use-cases/             # Casos de uso (RegisterUser, LoginUser)
│   └── services/              # Interfaces de serviços
│
├── infrastructure/            # CAMADA DE INFRAESTRUTURA (detalhes)
│   ├── database/
│   │   └── mongodb/
│   │       ├── models/        # Mongoose schemas
│   │       └── repositories/  # Implementações concretas (Adapters)
│   ├── services/              # Implementações concretas (JWT, Bcrypt)
│   └── di/                    # Dependency Injection Container
│
└── presentation/              # CAMADA DE APRESENTAÇÃO (API)
    ├── controllers/           # Controllers HTTP
    └── routes/                # Rotas Express
```

## Fluxo de Dependências

```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓            ↑           ↑
Controllers → Use Cases → Entities    Adapters
                ↓            ↑           ↑
           Interfaces ←──────┘           │
                (Ports)                  │
                  ↑────────────────────┘
                    (Implementações)
```

**Regra de Dependência**: As dependências sempre apontam para dentro (das camadas externas para as internas)

## Camadas Detalhadas

### 1. Domain Layer (Núcleo)

**Entidades** (`domain/entities/`):
- `User.js` - Entidade de usuário com regras de negócio puras
- Não depende de nenhuma biblioteca externa
- Contém apenas lógica de negócio

**Value Objects** (`domain/value-objects/`):
- `Email.js` - Validação de email
- `Password.js` - Validação de senha
- Imutáveis e auto-validáveis

**Repository Interfaces** (`domain/repositories/`):
- `IUserRepository.js` - Contrato para persistência
- Define o que precisa ser feito, não como

### 2. Application Layer (Casos de Uso)

**Use Cases** (`application/use-cases/`):
- `auth/RegisterUserUseCase.js` - Lógica de registro
- `auth/LoginUserUseCase.js` - Lógica de autenticação
- `user/GetUserByIdUseCase.js` - Buscar usuário
- `user/GetUsersUseCase.js` - Listar usuários
- `user/UpdateUserUseCase.js` - Atualizar usuário

**Service Interfaces** (`application/services/`):
- `IPasswordHashService.js` - Contrato para hash de senha
- `ITokenService.js` - Contrato para geração de tokens

Cada use case:
- Orquestra uma operação de negócio
- Recebe dependências via injeção
- É independente de framework
- É facilmente testável

### 3. Infrastructure Layer (Detalhes)

**Repositories** (`infrastructure/database/mongodb/repositories/`):
- `MongoUserRepository.js` - Implementação concreta usando MongoDB
- Adapta Mongoose para a interface do domínio
- Converte entre documentos MongoDB e entidades de domínio

**Models** (`infrastructure/database/mongodb/models/`):
- `UserModel.js` - Schema Mongoose (estrutura de dados)
- Separado da entidade de domínio

**Services** (`infrastructure/services/`):
- `BcryptPasswordService.js` - Implementação com bcrypt
- `JwtTokenService.js` - Implementação com jsonwebtoken

**Dependency Injection** (`infrastructure/di/`):
- `container.js` - Compõe todas as dependências
- Cria e injeta implementações concretas nos use cases

### 4. Presentation Layer (API)

**Controllers** (`presentation/controllers/`):
- `authController-clean.js` - Manipula requisições HTTP
- `userController-clean.js` - Converte req/res para chamadas de use case
- Sem lógica de negócio

**Routes** (`presentation/routes/`):
- `authRoutes-clean.js` - Define endpoints de autenticação
- `userRoutes-clean.js` - Define endpoints de usuários
- Validação de entrada com express-validator

## Inversão de Dependência (DI)

O padrão de Inversão de Dependência é implementado através do **DI Container**:

```javascript
// Use case não conhece a implementação concreta
const useCase = container.createRegisterUserUseCase();

// O container injeta as dependências
return new RegisterUserUseCase(
  this.userRepository,      // MongoUserRepository
  this.passwordHashService, // BcryptPasswordService
  this.tokenService         // JwtTokenService
);
```

### Benefícios:
- Use cases não dependem de tecnologias específicas
- Fácil troca de implementações (ex: trocar bcrypt por argon2)
- Facilita testes (pode-se usar mocks)

## Como Usar

### Modo Clean Architecture (Recomendado)

```javascript
// Em app.js ou routes/index.js
const authRoutes = require('./presentation/routes/authRoutes-clean');
const userRoutes = require('./presentation/routes/userRoutes-clean');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
```

### Modo Legado (Original)

```javascript
// Ainda funciona para backward compatibility
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
```

## Testabilidade

### Exemplo de Teste de Use Case:

```javascript
const RegisterUserUseCase = require('./application/use-cases/auth/RegisterUserUseCase');

describe('RegisterUserUseCase', () => {
  it('should register a new user', async () => {
    // Arrange - Mock das dependências
    const mockRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: '123', name: 'Test' })
    };
    const mockPasswordService = {
      hash: jest.fn().mockResolvedValue('hashed')
    };
    const mockTokenService = {
      generate: jest.fn().mockReturnValue('token123')
    };

    const useCase = new RegisterUserUseCase(
      mockRepo,
      mockPasswordService,
      mockTokenService
    );

    // Act
    const result = await useCase.execute({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Assert
    expect(result.user.name).toBe('Test User');
    expect(result.token).toBe('token123');
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
```

### Vantagens para Testes:
- Não precisa de banco de dados real
- Não precisa de servidor HTTP
- Testes rápidos e isolados
- Fácil de mockar dependências

## Comparação: Antes vs Depois

### Antes (Arquitetura Tradicional)

```javascript
// Controller tinha TODA a lógica
exports.register = async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email }); // Acoplado ao Mongoose
  const hashedPassword = await bcrypt.hash(password); // Acoplado ao bcrypt
  const token = jwt.sign({ userId }); // Acoplado ao JWT
  // ... mais lógica misturada
};
```

**Problemas**:
- Controller acoplado ao Mongoose, bcrypt, JWT
- Difícil de testar
- Difícil de trocar tecnologias
- Lógica de negócio espalhada

### Depois (Clean Architecture)

```javascript
// Controller apenas coordena
async register(req, res) {
  const useCase = container.createRegisterUserUseCase();
  const result = await useCase.execute(req.body);
  res.json(result);
}

// Use Case tem a lógica, mas não conhece detalhes
class RegisterUserUseCase {
  constructor(userRepo, passwordService, tokenService) {
    // Recebe interfaces, não implementações concretas
  }

  async execute({ name, email, password }) {
    // Lógica pura de negócio
  }
}
```

**Benefícios**:
- Separação clara de responsabilidades
- Fácil de testar
- Fácil de trocar tecnologias
- Lógica de negócio centralizada

## Benefícios da Clean Architecture Neste Projeto

1. **Manutenibilidade**: Mudanças em uma camada não afetam outras
2. **Testabilidade**: 100% de cobertura possível sem banco de dados
3. **Flexibilidade**: Trocar MongoDB por PostgreSQL? Só trocar o adapter!
4. **Escalabilidade**: Novas features são use cases isolados
5. **Qualidade**: Código organizado e previsível
6. **Onboarding**: Novos devs entendem a estrutura rapidamente

## Próximos Passos

1. Implementar testes unitários para use cases
2. Implementar testes de arquitetura com ArchUnit
3. Criar use cases para Friendship e Timeline
4. Adicionar eventos de domínio para Event-Driven Architecture
5. Implementar CQRS separando reads e writes

## Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [The Clean Architecture Book](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Hexagonal Architecture (Ports & Adapters)](https://alistair.cockburn.us/hexagonal-architecture/)

---

**Implementado por**: [ADICIONAR NOMES DOS ALUNOS]
**Data**: Janeiro 2025
**Disciplina**: Arquitetura Cloud
