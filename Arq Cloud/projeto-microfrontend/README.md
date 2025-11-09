# VIBRA Frontend - React + Vite + shadcn/ui

> Frontend moderno com React 19, Vite 7, Tailwind CSS e componentes shadcn/ui

---

## 🎨 Stack Tecnológica

- **React** 19.1.1 - Biblioteca UI
- **Vite** 7.1.7 - Build tool ultra-rápido
- **React Router** 6.20.1 - Roteamento SPA
- **Tailwind CSS** 3.4.0 - Framework CSS utility-first
- **shadcn/ui** - Componentes React de alta qualidade
- **Radix UI** - Primitivas UI acessíveis
- **Lucide React** - Ícones modernos
- **Axios** 1.6.2 - Cliente HTTP

---

## 📦 Componentes shadcn/ui Implementados

### Core UI Components

Todos os componentes seguem as melhores práticas de acessibilidade (ARIA) e são totalmente customizáveis:

#### **Button** (`src/components/ui/button.jsx`)
```jsx
<Button variant="default | destructive | outline | secondary | ghost | link" size="default | sm | lg | icon">
  Clique aqui
</Button>
```

**Variantes**:
- `default` - Botão primário (roxo/purple)
- `destructive` - Ações destrutivas (vermelho)
- `outline` - Botão com borda
- `secondary` - Botão secundário
- `ghost` - Botão transparente
- `link` - Estilo de link

---

#### **Card** (`src/components/ui/card.jsx`)
```jsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
  <CardFooter>
    {/* Footer */}
  </CardFooter>
</Card>
```

Usado em: Dashboard (cards de eventos, amigos, notificações), Events (cards de eventos)

---

#### **Input** (`src/components/ui/input.jsx`)
```jsx
<Input
  type="text | email | password"
  placeholder="Digite algo..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

Features:
- Estilo consistente
- Focus ring com cor primária
- Suporte a disabled
- Integração com Label

Usado em: Login (formulários), Events (busca)

---

#### **Label** (`src/components/ui/label.jsx`)
```jsx
<Label htmlFor="input-id">
  Nome do campo
</Label>
<Input id="input-id" />
```

Features:
- Acessibilidade com `htmlFor`
- Integração com form validation

Usado em: Login (labels dos campos)

---

#### **Tabs** (`src/components/ui/tabs.jsx`)
```jsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Conteúdo Tab 1
  </TabsContent>
  <TabsContent value="tab2">
    Conteúdo Tab 2
  </TabsContent>
</Tabs>
```

Usado em: Login (tabs de Login/Cadastrar)

---

#### **Avatar** (`src/components/ui/avatar.jsx`)
```jsx
<Avatar>
  <AvatarImage src="https://..." alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

Features:
- Fallback automático (iniciais)
- Lazy loading de imagens
- Totalmente customizável

Usado em: Dashboard (lista de amigos)

---

## 🎨 Design System

### Cores (CSS Variables)

Definidas em `src/index.css`:

```css
:root {
  --primary: 262 83% 58%;        /* Roxo/Purple */
  --secondary: 210 40% 96.1%;    /* Cinza claro */
  --destructive: 0 84.2% 60.2%;  /* Vermelho */
  --muted: 210 40% 96.1%;        /* Fundo sutil */
  --accent: 210 40% 96.1%;       /* Destaque */
  --border: 214.3 31.8% 91.4%;   /* Bordas */
  --radius: 0.5rem;              /* Border radius padrão */
}
```

### Gradientes

```css
from-purple-50 via-white to-blue-50  /* Background das páginas */
from-purple-600 to-blue-600          /* Títulos e logos */
from-purple-500 to-blue-500          /* Elementos de destaque */
```

---

## 📄 Páginas Implementadas

### 1. **Login** (`src/pages/Login.jsx`)

**Features**:
- Design split-screen (branding + formulário)
- Tabs para Login/Cadastrar (shadcn/ui Tabs)
- Formulários com validação
- Estados de loading
- Mensagens de erro
- Gradientes modernos

**Componentes usados**:
- `Card`, `Tabs`, `Button`, `Input`, `Label`
- Ícones: `Calendar`, `MapPin`, `Users` (lucide-react)

---

### 2. **Dashboard** (`src/pages/Dashboard.jsx`)

**Features**:
- Grid responsivo (1/2/3 colunas)
- Cards de:
  - Próximos Eventos (com data visual)
  - Amigos (com avatares)
  - Eventos Próximos (geolocalização)
  - Notificações
- Loading states
- Empty states customizados
- Hover effects

**Componentes usados**:
- `Card`, `Avatar`, `Button`
- Ícones: `Calendar`, `MapPin`, `Users`, `Bell`, `Clock`, `TrendingUp`

---

### 3. **Events** (`src/pages/Events.jsx`)

**Features**:
- Grid responsivo (1/2/3/4 colunas)
- Busca global
- Filtros por categoria (pills)
- Cards de eventos com:
  - Imagem (ou placeholder gradiente)
  - Badge de categoria
  - Data e localização
  - Hover effects (scale, shadow, translate)
- Empty state

**Componentes usados**:
- `Card`, `Button`, `Input`
- Ícones: `Search`, `MapPin`, `Calendar`, `Filter`, `X`

---

### 4. **EventDetail** (`src/pages/EventDetail.jsx`)

Página existente (não modificada ainda) - pode ser atualizada seguindo o mesmo padrão.

---

## 🚀 Como Executar

### Instalação

```bash
cd projeto-microfrontend
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

### Build para Produção

```bash
npm run build
```

Output em: `dist/`

### Preview do Build

```bash
npm run preview
```

---

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   └── ui/                      # Componentes shadcn/ui
│       ├── button.jsx           # Botões
│       ├── card.jsx             # Cards
│       ├── input.jsx            # Inputs
│       ├── label.jsx            # Labels
│       ├── tabs.jsx             # Tabs
│       └── avatar.jsx           # Avatars
│
├── lib/
│   └── utils.js                 # Utilities (cn function)
│
├── pages/
│   ├── Login.jsx                # 🆕 Modernizado com shadcn/ui
│   ├── Dashboard.jsx            # 🆕 Modernizado com shadcn/ui
│   ├── Events.jsx               # 🆕 Modernizado com shadcn/ui
│   └── EventDetail.jsx          # Página de detalhes
│
├── services/
│   └── api.js                   # Cliente HTTP (Axios)
│
├── App.jsx                      # Roteamento principal
├── main.jsx                     # Entry point
└── index.css                    # 🆕 Tailwind + CSS Variables
```

---

## 🎨 Customização

### Adicionar Novo Componente shadcn/ui

Para adicionar um componente shadcn/ui:

```bash
# Instalar CLI (se não tiver)
npm install -D @shadcn/ui

# Adicionar componente
npx shadcn-ui@latest add [component-name]
```

Exemplos:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
```

### Modificar Cores

Edite `src/index.css` e ajuste as variáveis CSS:

```css
:root {
  --primary: 262 83% 58%;  /* Mude para sua cor primária */
}
```

### Modificar Tema

Edite `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      // Adicione suas cores personalizadas
    }
  }
}
```

---

## 🌐 Integração com Backend

### API Base URL

Configurado em `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### Variáveis de Ambiente

Crie `.env` na raiz:

```bash
VITE_API_URL=http://localhost:3000
```

### Autenticação

JWT token armazenado em `localStorage`:

```javascript
localStorage.setItem('token', token);
const token = localStorage.getItem('token');
```

---

## 📱 Responsividade

Breakpoints Tailwind:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px (container max-width)

Exemplo:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 coluna mobile, 2 tablet, 3 desktop */}
</div>
```

---

## ♿ Acessibilidade

Todos os componentes shadcn/ui são construídos sobre **Radix UI**, garantindo:

- ✅ Suporte completo a teclado
- ✅ Screen reader friendly
- ✅ ARIA attributes corretos
- ✅ Focus management
- ✅ WCAG 2.1 Level AA

---

## 🐛 Debug

### React DevTools

Instale a extensão: [React Developer Tools](https://react.dev/learn/react-developer-tools)

### Tailwind CSS IntelliSense

VSCode extension: `bradlc.vscode-tailwindcss`

### Console Logs

Habilitado por padrão em desenvolvimento. Para produção, desabilite em `vite.config.js`:

```js
build: {
  minify: true,
  sourcemap: false
}
```

---

## 🚀 Deploy

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker

```bash
docker build -t vibra-frontend .
docker run -p 5173:5173 vibra-frontend
```

---

## 📚 Recursos Adicionais

- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Router Docs](https://reactrouter.com/)

---

## 👥 Desenvolvido por

**[ADICIONAR NOMES DOS ALUNOS]**

**Disciplina**: Arquitetura Cloud
**Data**: Janeiro 2025

---

**🎉 Frontend 100% modernizado com shadcn/ui!**
