# 📚 Sistema de Gerenciamento de Coleções

Sistema completo para gerenciamento de coleções pessoais (livros, discos, bebidas e jogos de tabuleiro) com autenticação, controle de acesso baseado em papéis e painel administrativo.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Gerenciamento de Estado**: TanStack React Query
- **Roteamento**: React Router DOM v6
- **Gráficos**: Recharts
- **Exportação**: jsPDF + jspdf-autotable + xlsx

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── admin/           # Componentes do painel administrativo
│   ├── auth/            # Componentes de autenticação
│   ├── books/           # Formulários e listagens de livros
│   ├── dashboard/       # Dashboard e estatísticas
│   ├── drinks/          # Formulários e listagens de bebidas
│   ├── games/           # Formulários e listagens de jogos
│   ├── icons/           # Ícones coloridos customizados
│   ├── layout/          # Layout, header e sidebar
│   ├── records/         # Formulários e listagens de discos
│   ├── reports/         # Página de relatórios
│   ├── shared/          # Componentes reutilizáveis
│   └── ui/              # Componentes shadcn/ui
├── contexts/
│   └── AuthContext.tsx  # Contexto de autenticação
├── hooks/
│   ├── usePermissions.ts   # Hook de permissões
│   ├── useUserRole.ts      # Hook para obter papel do usuário
│   └── use-mobile.tsx      # Hook para detecção mobile
├── integrations/
│   └── supabase/        # Cliente e tipos do Supabase
├── pages/
│   ├── admin/           # Páginas administrativas
│   ├── Auth.tsx         # Página de login/recuperação
│   ├── Bebidas.tsx      # Gestão de bebidas
│   ├── Discos.tsx       # Gestão de discos
│   ├── Exportacao.tsx   # Exportação de dados
│   ├── Index.tsx        # Dashboard principal
│   ├── Jogos.tsx        # Gestão de jogos
│   ├── Livros.tsx       # Gestão de livros
│   ├── Profile.tsx      # Perfil do usuário
│   └── Relatorios.tsx   # Relatórios e análises
├── types/
│   └── auth.ts          # Tipos de autenticação e papéis
└── lib/
    └── utils.ts         # Utilitários gerais
```

## 🔐 Sistema de Autenticação

### Funcionalidades
- Login com email/senha
- Cadastro de novos usuários
- Recuperação de senha via email
- Sessão persistente com refresh automático de tokens

### Fluxo de Autenticação
1. Usuário acessa `/auth`
2. Realiza login ou cadastro
3. Sistema cria perfil automaticamente via trigger
4. Redirecionamento para dashboard

## 👥 Controle de Acesso (RBAC)

### Papéis Disponíveis

| Papel | Descrição |
|-------|-----------|
| `admin` | Acesso total ao sistema |
| `user` | Pode criar, editar e excluir itens |
| `read_only` | Apenas visualização |

### Permissões por Papel

| Permissão | Admin | User | Read Only |
|-----------|-------|------|-----------|
| Visualizar coleções | ✅ | ✅ | ✅ |
| Adicionar itens | ✅ | ✅ | ❌ |
| Editar itens | ✅ | ✅ | ❌ |
| Excluir itens | ✅ | ✅ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |
| Painel administrativo | ✅ | ❌ | ❌ |

## 📦 Módulos do Sistema

### 📚 Livros
- Cadastro com título, autor, categoria, editora
- Upload de imagem de capa
- Filtros por categoria e status de leitura
- Visualização em grid ou lista

### 💿 Discos
- Cadastro com título, artista, ano, gênero
- Upload de imagem de capa
- Filtros por gênero e década

### 🍷 Bebidas
- Cadastro com nome, tipo, safra, país, região
- Controle de estoque com histórico
- Tipos de uva associados
- Filtros por tipo, país e disponibilidade

### 🎲 Jogos de Tabuleiro
- Cadastro com nome, número de jogadores, duração
- Categoria e complexidade
- Upload de imagem

## 🛠️ Painel Administrativo

### Funcionalidades
- **Usuários**: Gerenciamento completo (criar, editar, excluir, alterar papéis)
- **Categorias de Livros**: CRUD de categorias
- **Tipos de Bebidas**: CRUD de tipos (vinho, cerveja, etc.)
- **Tipos de Uva**: CRUD de variedades de uva
- **Logs de Atividade**: Visualização de ações dos usuários
- **Grupos de Permissão**: Documentação dos papéis

### Acesso
Apenas usuários com papel `admin` podem acessar `/admin`

## 📊 Dashboard e Relatórios

### Dashboard (`/`)
- Estatísticas gerais de cada coleção
- Gráfico de evolução temporal
- Itens adicionados recentemente
- Botão de adição rápida

### Relatórios (`/relatorios`)
- Análises detalhadas por categoria
- Gráficos comparativos
- Filtros por período

## 📤 Exportação de Dados

### Formatos Suportados
- **Excel (.xlsx)**: Planilha com todos os dados
- **PDF**: Documento formatado com imagens

### Acesso
Disponível em `/exportacao`

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários |
| `user_roles` | Papéis dos usuários |
| `books` | Coleção de livros |
| `records` | Coleção de discos |
| `drinks` | Coleção de bebidas |
| `board_games` | Coleção de jogos |
| `activity_logs` | Logs de atividades |

### Buckets de Storage

| Bucket | Descrição |
|--------|-----------|
| `book-images` | Capas de livros |
| `record-images` | Capas de discos |
| `drink-images` | Imagens de bebidas |
| `game-images` | Imagens de jogos |

### Segurança (RLS)
- Todas as tabelas possuem Row Level Security habilitado
- Políticas baseadas em autenticação
- Funções de verificação de papel: `get_user_role()`, `has_role()`

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- npm ou bun

### Instalação

```bash
# Clonar o repositório
git clone <URL_DO_REPOSITORIO>

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

O projeto utiliza as seguintes variáveis (gerenciadas pelo Lovable):

- `SUPABASE_URL` - URL do projeto Supabase
- `SUPABASE_PUBLISHABLE_KEY` - Chave pública do Supabase

## 🌐 Deploy

### Via Lovable
1. Acesse o projeto em [Lovable](https://lovable.dev)
2. Clique em **Share → Publish**

### Configuração do Supabase (Importante!)

Para que o reset de senha funcione corretamente:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Authentication → URL Configuration**
3. Configure:
   - **Site URL**: URL da sua aplicação (ex: `https://seu-app.lovableproject.com`)
   - **Redirect URLs**: Adicione `https://seu-app.lovableproject.com/**`

## 📱 Design Responsivo

O sistema é totalmente responsivo:
- **Desktop**: Sidebar fixa, grid de 4 colunas
- **Tablet**: Sidebar recolhível, grid de 2-3 colunas
- **Mobile**: Navegação por menu hambúrguer, grid de 1 coluna

## 🎨 Sistema de Design

### Cores Principais
- **Primary**: Verde (#22c55e) - Ações principais
- **Secondary**: Roxo - Elementos secundários
- **Accent**: Rosa - Destaques

### Temas
- Suporte a tema claro e escuro
- Cores adaptadas automaticamente via CSS variables

## 📄 Licença

Este projeto foi desenvolvido usando [Lovable](https://lovable.dev).

---

**URL do Projeto**: https://lovable.dev/projects/6d76e91b-408a-4e03-a0c2-15b939ab40b0
