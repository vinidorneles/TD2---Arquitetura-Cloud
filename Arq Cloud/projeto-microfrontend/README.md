# VIBRA - MicroFrontEnd

Interface do usuário da plataforma VIBRA para descoberta e avaliação de eventos.

## Tecnologias

- React 19
- Vite
- React Router DOM
- Axios

## Funcionalidades

- Autenticação (Login/Registro)
- Dashboard com agregação de dados
- Listagem e busca de eventos
- Detalhes de eventos
- Sistema de avaliações via eventos
- Integração completa com BFF Gateway

## Instalação

```bash
npm install
cp .env.example .env
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Build
npm run build
```

## Estrutura

```
src/
├── pages/          # Páginas (Login, Dashboard, Events, EventDetail)
├── services/       # API client
├── App.jsx         # Componente principal
└── main.jsx        # Entry point
```

## Integração

Conecta-se ao BFF Gateway em `http://localhost:3000/api`

## Licença

MIT
