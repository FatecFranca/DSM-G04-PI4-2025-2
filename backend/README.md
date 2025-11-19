# Click Serve - Backend API

## ☕ 1. Objetivo do Projeto
O Click Serve é um sistema completo para gerenciamento de estabelecimentos (restaurantes, bares), focado em otimizar o fluxo de atendimento e fornecer inteligência de negócio em tempo real. A API é construída com arquitetura de micro-serviços (Node.js/Express) e utiliza MongoDB como banco de dados NoSQL.

## 🛠 2. Stack Tecnológica
- **Linguagem:** Node.js (v20+)
- **Framework:** Express.js
- **Banco de Dados:** MongoDB (Mongoose)
- **Tempo Real:** Socket.IO (WebSockets)
- **Autenticação:** JSON Web Tokens (JWT) com Access/Refresh Token
- **Análise de Dados:** MongoDB Aggregation Pipeline & Simple Statistics (para relatórios)

## 🔒 3. Funcionalidades Chave da API
| Categoria | Endpoint Principal | Descrição |
| :--- | :--- | :--- |
| **Autenticação** | POST /users/login <br> POST /auth/refresh | Sistema de login com tokens de curta e longa duração (Access/Refresh Tokens). |
| **Tempo Real** | /websocket (ws://...) | Comunicação bidirecional. Usa **Salas (Rooms)** para isolar os eventos de cada empresa. |
| **Relatórios** | GET /relatorios/kpis | Calcula o Faturamento Total, Ticket Médio e Intervalo de Confiança estatístico. |
| **Operacional** | POST /pedidos/mesa/:mesaId | Cria pedidos e aciona o fluxo de cozinha/garçom. |
| **Gestão** | CRUD em /users, /mesas, /cardapios | Gerenciamento de funcionários e cadastro de itens/mesas. |

## 💻 4. Configuração Local (Desenvolvimento)

Siga estes passos para rodar o backend localmente:

### A. Pré-requisitos
1.  **Node.js** (v18+) e **npm** instalados.
2.  **MongoDB Community Server** rodando em `mongodb://localhost:27017`.
3.  **Arquivo `.env`** criado na raiz do diretório `backend` (não deve ser enviado ao Git!).

### B. Setup
1.  Clone o repositório: `git clone https://github.com/FatecFranca/DSM-G04-PI4-2025-2.git`
2.  Instale as dependências: `npm install`
3.  **Crie o arquivo `.env`** e insira suas variáveis (exemplo):

JWT_SECRET=sua_chave_secreta_aqui 
DATABASE_URL=mongodb://localhost:27017/clickserve_db

### C. Rodar
* Inicie o servidor em modo desenvolvimento: `npx nodemon app.js`
* **API estará disponível em:** `http://172.191.224.11:5000`
* Caso queira rodar local deverá acessar dentro da pasta web/services/api.js e alterar a variavel API_BASE_URL para `http://localhost:5000`

## 📚 5. Documentação e Testes

A documentação interativa da API está disponível no seu próprio servidor usando a especificação OpenAPI (Swagger).

* **URL da Documentação (Local):** `http://localhost:5000/api-docs`
* **Acessível na VM:** Se o servidor estiver rodando na VM, use o IP público: `http://172.191.224.11:5000/api-docs`

Use o Swagger UI para testar as rotas, autenticar (Bearer Token) e simular todo o fluxo de pedidos.

***
*Desenvolvido por Paulo Ricardo do Grupo 4.*