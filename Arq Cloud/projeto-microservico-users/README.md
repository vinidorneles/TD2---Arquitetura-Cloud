# VIBRA - Users Microservice

Microserviço de gerenciamento de usuários, autenticação e funcionalidades sociais da plataforma VIBRA.

## Tecnologias

- Node.js
- Express
- MongoDB Atlas
- JWT Authentication
- Swagger/OpenAPI

## Funcionalidades

- Cadastro e autenticação de usuários (local e social)
- Gerenciamento de perfil
- Sistema de amizades
- Timeline de atividades
- API RESTful completa

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar variáveis de ambiente no .env
# MONGODB_URI - String de conexão do MongoDB Atlas
# JWT_SECRET - Chave secreta para JWT
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## API Documentation

Acesse a documentação completa da API:
- Local: http://localhost:3001/api-docs
- Swagger YAML: [swagger.yaml](./swagger.yaml)

## Endpoints Principais

### Autenticação
- POST `/api/auth/register` - Registrar novo usuário
- POST `/api/auth/login` - Login
- POST `/api/auth/social` - Autenticação social (Google/Facebook)

### Usuários
- GET `/api/users` - Listar usuários
- GET `/api/users/:id` - Buscar usuário
- PUT `/api/users/:id` - Atualizar perfil
- DELETE `/api/users/:id` - Deletar conta

### Amizades
- GET `/api/friendships` - Listar amizades
- POST `/api/friendships` - Enviar solicitação
- PUT `/api/friendships/:id` - Aceitar/rejeitar
- DELETE `/api/friendships/:id` - Remover amizade

### Timeline
- GET `/api/timeline` - Buscar timeline
- POST `/api/timeline` - Criar post
- DELETE `/api/timeline/:id` - Deletar post

## Docker

```bash
# Build
docker build -t vibra-users-service .

# Run
docker run -p 3001:3001 --env-file .env vibra-users-service
```

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| PORT | Porta do servidor | 3001 |
| MONGODB_URI | String de conexão MongoDB | mongodb+srv://... |
| JWT_SECRET | Chave secreta JWT | your-secret-key |
| JWT_EXPIRES_IN | Tempo de expiração do token | 7d |
| CORS_ORIGIN | Origem permitida CORS | http://localhost:3000 |

## Estrutura do Projeto

```
src/
├── config/          # Configurações
├── controllers/     # Controladores
├── middleware/      # Middlewares
├── models/          # Models Mongoose
├── routes/          # Rotas
├── app.js          # Configuração Express
└── server.js       # Entry point
```

## Contribuindo

Este projeto faz parte do PJBL da plataforma VIBRA.

## Licença

MIT
