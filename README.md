# 🍦 Ice Point Sorveteria - Frontend & Portal Admin

<div align="center">

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-DB%20&%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-FFDE61?style=for-the-badge&logo=vue.js)](https://pinia.vuejs.org/)
[![Tailwind CSS / Estilização Customizada](https://img.shields.io/badge/Estilização-Vanilla%20%2B%20Vite-38B2AC?style=for-the-badge&logo=css3)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![Cypress E2E](https://img.shields.io/badge/Cypress-14.5-17202C?style=for-the-badge&logo=cypress)](https://www.cypress.io/)
[![Vercel Analytics & Deploy](https://img.shields.io/badge/Vercel-DeployCI%2FCD-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

**Uma aplicação web de ponta a ponta focada em performance, usabilidade extrema e gerenciamento de negócios para a Ice Point Sorveteria (Uberaba - MG).**

</div>

---

## 📑 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades e Módulos Principais](#-funcionalidades-e-módulos-principais)
  - [Área do Cliente (E-Commerce B2C)](#%EF%B8%8F-área-do-cliente-e-commerce-b2c)
  - [Portal Administrativo (Backoffice B2B)](#-portal-administrativo-backoffice-b2b)
- [Arquitetura e Stack Tecnológica](#%EF%B8%8F-arquitetura-e-stack-tecnológica)
- [Estrutura Completa de Diretórios](#-estrutura-completa-de-diretórios)
- [Guia de Instalação e Desenvolvimento Local](#-guia-de-instalação-e-desenvolvimento-local)
  - [Pré-requisitos e Ambientação](#pré-requisitos-e-ambientação)
  - [Download e Instalação](#download-e-instalação)
  - [Configuração do `.env`](#configuração-do-env)
- [Painel de Scripts NPM](#-painel-de-scripts-npm)
- [Fluxo de Autenticação e Estados (Pinia)](#-fluxo-de-autenticação-e-estados-pinia)
- [Estratégia de Testes (QA)](#-estratégia-de-testes-qa)
- [Deploy, CI/CD e Vercel](#-deploy-cicd-e-vercel)
- [Contribuição e Boas Práticas](#-contribuição-e-boas-práticas)


---

## 📖 Sobre o Projeto

Este repositório abriga o código-fonte integral (cliente e retaguarda web) da **Ice Point Sorveteria**. O objetivo da arquitetura foi unificar duas plataformas essenciais:
1. **Uma vitrine de vendas** elegante, performática e gamificada para o consumidor final fazer pedidos de delivery.
2. **Um ERP super leve (Dashboard)** para controle logístico, gestão financeira de vendas, de clientes, produtos e faturamento.

O projeto abandona as amarras do paradigma tradicional usando uma _Single Page Application_ conectada diretamente a um "Backend as a Service" moderno (**Supabase**). O resultado é uma latência quase nula para o usuário e extrema facilidade na manutenção para os desenvolvedores.

---

## 🚀 Funcionalidades e Módulos Principais

### 🛍️ Área do Cliente (E-Commerce B2C)
- **Catálogo Dinâmico e Reativo:** Vitrines com separação automática em categorias de produtos (Picolés, Açaí, Sorvetes de Massa). Busca imediata na interface, carregamento responsivo de thumbnails.
- **Carrinho "Inteligente" persistido:** Baseado no _Pinia_, o carrinho avalia em tempo real as regras da loja física — como mínimo para atacado para produtos específicos e limites máximos. Ele persiste até um _Refresh_ duro do cliente.
- **Checkout, Entrega e Mapas:** Cálculo interativo com `Leaflet` (mapas de código aberto) caso possua zonas geográficas ou para localização do cliente. Fim do fluxo coroado com micro-interações como _Confetti Explosions 🎉_ para fixar positividade na compra.
- **Área Restrita (Conta do Cliente):** Visualização completa do próprio histórico com status ("Aguardando preparo", "Saiu para entrega"). Suporte de Auth completo incluindo e-mails transacionais (Recuperação).
- **Adequação LGPD:** Páginas nativas englobando exclusão total de dados sob livre demanda do cliente final, termos de serviços e políticas.

### 🛡️ Portal Administrativo (Backoffice B2B)
- **Role-Based Access Control (RBAC):** Proteção rígida via `vue-router`. Mapeamento de _claims_:
  - `Admin`: Permissão para criar contas de funcionários, ditar acessos globais, ver lucros líquidos e métricas financeiras sensíveis.
  - `Funcionário`: Limitado a gerenciamento do balcão de pedidos e estoque de insumos rotineiros.
- **Dashboard e KPIs em Tempo Real:** Conexão nativa com `Chart.js` trazendo gráficos de "Produtos mais Vendidos na Semana" e "Receita vs Despesa do Mês".
- **Visualização de Calendário e Agendamentos:** Criação nativa de eventos e entregas usando uma agenda inteligente importada do `@vuepic/vue-datepicker`. A loja pode reservar caminhões frigoríficos ou _motoboys_ em horários de pico.
- **Controle de Produtos (Estoque / CRUD / Files):** Além de editar preço/qtd. o painel vincula e envia as imagens vetoriais/jpg diretamente ao "Supabase Storage bucket", amarrando a CDN sem esforço na visualização.
- **Exportação (PDF Automático):** Com um simples botão o sistema mapeia a rota ou a nota fiscal de balcão e converte o HTML para formato de impressão (`html2pdf.js`).

---

## ⚙️ Arquitetura e Stack Tecnológica

O padrão empregado é altamente modular e baseado no ecossistema moderno da Web.

**Frontend / Core:**
- 🟢 **[Vue 3 (Composition API)](https://vuejs.org/)** — Ferramenta motriz com componentização modular intensa e reatividade fina baseada em `ref` e `computed`.
- ⚡ **[Vite](https://vitejs.dev/)** — Dev server sob Esbuild, HMR instantâneo para aumento extremo do _Developer Experience (DX)_.
- 📘 **[TypeScript](https://www.typescriptlang.org/)** — Garantia completa de tipagens de Props de componentes globais a _fetch responses_ de APIs externas.

**Estilização, UX e UI Components:**
- 🎨 **Styles System** — CSS moderno/Modular com utilitários. Integridade nas padronizações de cores e UX da sorveteria.
- ✨ **[Lucide Icons](https://lucide.dev/) + [FontAwesome 6](https://fontawesome.com/)** — Consumo otimizado na árvore (Tree-shaking em SGVs de iconografia limpa).
- 🔄 **[Swiper](https://swiperjs.com/)** — Touch-slider para componentes de banners mobile fluidos sem jitter nativo.
- ✅ **[Vee-Validate + Yup](https://vee-validate.logaretm.com/)** — _Schema validation_ pesado para cada formulário, inibindo envios de payloads falhos à API e gerindo erros na inferência HTML.
- 📆 **vue-datepicker / vue-imask** — Máscaras avançadas de Input e Seleção temporal sem causar fricção no Mobile.

**Backend, Banco de Dados & Infraestrutura:**
- 🐘 **[Supabase](https://supabase.com/)** — Um ecossistema Open-Source do Firebase amparado em Postgres. Trata-se desde Autorização de Contas e Políticas de Linha (RLS) até banco de dados real-time e buckets Storage para os sorvetes.
- 🧠 **[Pinia](https://pinia.vuejs.org/)** — Central de Estado do Vue. Utilizado ativamente em Stores globais (`authStore`, `cartStore`).

---

## 📂 Estrutura Completa de Diretórios

O framework subjacente prevê flexibilidade entre Cliente x Admin mantendo tudo sobre as regras restritas da `/src`.

```bash
📦 Ice-point-FrontEnd
├── 📂 cypress/                  # Scripts e Testes E2E via Cypress
├── 📂 public/                   # Recursos fixos de alta base (manifest, favicon, robots.txt)
├── 📂 src/                      # Source Code (Coração do Projeto)
│   ├── 📂 assets/               # Vetores globais estáticos, Base CSS Global (Reset, Variaveis.css)
│   ├── 📂 components/           # (Shared) Componentes genéricos (Botões, Inputs, Cards de Produto, Modais)
│   ├── 📂 router/               # Lógica do Vue Router, com proteção (Admin Guard, Auth Guard)
│   ├── 📂 service/              # Camada de comunicação/Client supabaseConfig.ts, Repositórios
│   ├── 📂 stores/               # Pinia Stores -> Divisões lógicas de estado global da aplicação
│   ├── 📂 types/                # Interfaces .ts que simulam DB schemas localmente (Ex: TProduct, TUser)
│   ├── 📂 views/                # Telas completas que agrupam blocos de 'components'
│   │   ├── 📂 Admin/            # Pages do Dashboard (Dashboard, ProductForm, ManageUsers)
│   │   ├── 📂 Auth/             # Login, Register, Recovery de senhas
│   │   └── 📂 Client/           # Home Catalog, Checkout, Produto singular (Detalhes)
│   ├── 📄 App.vue               # O Wrapper base dos componentes
│   ├── 📄 main.ts               # Hook point absoluto que monta a instância `createApp` e plugins
│   └── 📄 style.css             # Arquivo global e classes base raiz
├── 📄 .env.development          # Arquivo base de referência para conexão com API local
├── 📄 eslint.config.ts          # Regras severas de bloqueio de code-smells
├── 📄 vite.config.ts            # O core bundle (Alias `@`, configurações de proxy, plugins .vue)
├── 📄 vitest.config.ts          # Setup para os testes de unidade
└── 📄 package.json              # Mapeamento do ciclo de vida das dependências
```

---

## 🛠 Guia de Instalação e Desenvolvimento Local

### Pré-requisitos e Ambientação
Antes de tentar construir o projeto, assegure de que sua máquina atende aos requisitos abaixo:
- Motor V8 e gerenciador: **[Node.js](https://nodejs.org/en/)** (V20 LTS ou superior) + **NPM**.
- IDE Recomendada: **VSCode** (com extensões ativas: `Vue - Official`, `Prettier - Code formatter`, `ESLint`).

### Download e Instalação

1. Obtenha do Git localmente na sua _Workspace_:
   ```bash
   git clone <Sua-URL-do-Git>
   cd Ice-Point---FrontEnd
   ```
2. Realize o down-cache de pacotes:
   ```bash
   npm install
   ```

### Configuração do `.env`

Na raiz (onde reside os arquivos `vite.config`), crie cópia exata do `.env.development` com o nome final `.env`. É imprecindível possuir o seu próprio cluster gerado no dashboard do [Supabase](https://app.supabase.com).

```env
# 🛡️ CHAVES DE ACESSO AO BANCO DE DADOS PRINCIPAL (SUPABASE)
VITE_SUPABASE_URL=https://XXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkX....
VITE_API_URL=http://localhost:3000
```

> **Aviso de Segurança**: As chaves prefixadas com `VITE_` são expostas ao servidor cliente no empacotamento, por tanto a chave de `SERVICE_ROLE` Master do Supabase **JAMAIS** deve ser colocada aqui, use exclusivamente o `ANON_KEY` restrito pelas diretrizes de Policies no PostgreSQL do Supabase.

---

## 💻 Painel de Scripts NPM

A automação de lifecycle e análises estão disponíveis pelos scripts configurados no projeto localmente:

| Execução NPM | Ação Resumida | Descritivo Detalhado |
| :--- | :--- | :--- |
| `npm run dev` | Inicia o HMR Server Vite | Roda na porta `:5173`. Modificações afetam o browser na mesma cadência (.vue em ~30ms). |
| `npm run build` | Compila arquivos para Prd | Dispara antes o verficador typescript e encerra com HTML puro, CSS Minificado e JS no dtiértorio `/dist`. |
| `npm run preview` | Simula Deploy Final | Liga um servidor ultra enxuto local servindo puramente a pasta `/dist` sem auxílio do devserver. |
| `npm run type-check` | Validação de Código TS | Identifica tipagens soltas ou conflitantes de forma autônoma aos estilos (`vue-tsc`). |
| `npm run lint` | Limpeza de Código e Erros | Ativa `eslint` juntamente de `oxlint` para analisar padrões, variaveis nulas, e dependências perdidas. |
| `npm run format` | Esmaga padrões de código | Auto-Formata os espaçamentos, aspas e alinhamentos seguindo apenas os gostos do `Prettier`. |
| `npm run test:e2e:dev` | Bateria E2E Cypress | Inicia a aplicação web e carrega a tela tátil da Cypress para emular e testar clicks visíveis dos usuários. |

---

## 🔐 Fluxo de Autenticação e Estados (Pinia)

A loja possui transições de autenticação de página únicas sem falhas devido a combinação **Supabase Auth Listener + Vue Router Meta Guards**.

1. Quando a aplicação é montada no browser, verifica-se sessão ativa no _LocalStorage_. 
2. Se persistida, armazena no `AuthStore (Pinia)` os dados do profile amarrados no banco _UserProfiles_ do back-end.
3. Se existir a `meta: { requiresAuth: true }` ou `meta: { requiresAdmin: true }` nas rotas do painel superior, bloqueia tentativas e invoca o Vue Router mandando o intruso direto para a página `/login`.

Essa técnica cega ataques e protege a área interna da empresa. O _CartStore_ possui método de Sync, limpando-se do pínia a cada log off e gerando novo _Guest Cart_.

---

## 🧪 Estratégia de Testes (QA)

Um projeto comercial sem quebras é essencial. Estávamos com 3 escopos de QA inclusos.

1. **Validação de Sintaxe (ESLint + OxLint):** Garante a sanidade gramatical via pipelines automatizadas no `package.json`.
2. **Vitest Engine (Testes Unitários de Regra):** Validam individualmente pequenos algoritmos da `/utils` (Como calculadoras de frete cartões etc). 
3. **Cypress E2E Engine:** A simulação dos testadores ocorre sob a `npm run test:e2e:dev`. A janela robótica irá visitar a web local, montar uma lista falsa de sorvetes, checar se a quantidade funciona e se o painel finaliza vendas.

---

## 🌐 Deploy, CI/CD e Vercel

Construído via automação profunda conectada com a **Vercel** (`@vercel/analytics` + `@vercel/speed-insights`). O deploy contínuo em _Production_ segue a pipeline:

- Qual quer merge na _Main Branch_ ou fluxo Git ativa a Vercel CI.
- A Vercel roda `npm run install`.
- O servidor cloud efetua o `npm run lint`. Se for aceito...
- Ele constrói a aplicação pelo `npm run build`.
- Envia os recursos HTML / JS criados em frações para a rede Global Nodes (CDNEDGE cache latency).

O projeto então ativa _Speed Insights Websocket_ enviando ao dashboard o impacto de renderização TBT e LCP na ponta do device das pessoas espalhadas pelas regiões.

---

## 🤝 Contribuição e Boas Práticas

No momento da escalabilidade da aplicação por terceiros, por favor manter em atenção:
- Criar a feature nova base na branch `develop`. `git checkout -b feature/novo-checkout`.
- Componentes unícos de página podem ir dentro de Views.
- Componentes usados entre 2 ou mais views precisam estar OBRIGATÓRIAMENTE na pasta global `/components`.
- Faça pequenos _Commits_ descritivos no padrão Convencional. (`feat: Adicionado PIX nos pagamentos`, `fix: Arrumado carrinho duplicado em refresh`).

<br/>

<div align="center">
  <p>Construído com extrema dedicação à engenharia web e muita vontade de proporcionar sobremesas perfeitas — <b>Equipe Ice Point Sorveteria 🩵🍦</b>.</p>
</div>
