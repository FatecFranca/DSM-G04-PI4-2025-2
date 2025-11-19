# DSM-G04-PI4-2025-2

## 🍽️ Sistema de Gestão para Restaurantes

**Projeto Integrador IV - Desenvolvimento de Software Multiplataforma**  
**Fatec Franca - Grupo 04 - 2025.2**

---

### 📋 Contextualização do Projeto

Sistema completo para gestão de operações em restaurantes, permitindo que garçons, cozinha e gerentes trabalhem de forma integrada e em tempo real. O sistema oferece controle de mesas, pedidos, pagamentos, chamados e análise de desempenho.

### 🎯 Problema Identificado

Restaurantes frequentemente enfrentam desafios operacionais:
- **Comunicação ineficiente** entre garçons e cozinha
- **Perda de pedidos** ou atrasos na entrega
- **Dificuldade em acompanhar** métricas de desempenho
- **Falta de controle** sobre mesas e contas
- **Gestão manual** propensa a erros

Essa gestão inadequada resulta em:
- ❌ Insatisfação dos clientes por atrasos
- ❌ Perda de receita por falta de controle
- ❌ Sobrecarga da equipe
- ❌ Ausência de dados para otimização do negócio

### 💡 Solução Proposta

Sistema completo com **3 plataformas integradas**:

#### 🌐 Web (Gerencial)
- 👥 **Gestão de Usuários** - Controle de garçons e funcionários
- 🍽️ **Gestão de Mesas** - Configuração e monitoramento
- 📋 **Cardápio Digital** - Cadastro de produtos e preços
- 📊 **Relatórios Completos** - Análises de vendas e desempenho
- 💰 **Controle Financeiro** - Histórico de pagamentos e contas

#### 📱 Mobile (Operacional)
**Para Garçons:**
- 🔔 Notificações em tempo real de pedidos prontos e chamados
- 📝 Criação e gestão de pedidos por mesa
- 💳 Processamento de pagamentos (Dinheiro, PIX, Cartão)
- 📊 Dashboard pessoal de desempenho
- ⏱️ Acompanhamento de tempo de atendimento

**Para Cozinha:**
- 🍳 Visualização de todos os pedidos ativos
- ✅ Marcação de itens como prontos
- 🔔 Notificação automática aos garçons

#### 🔧 Backend (API)
- ⚡ API RESTful completa
- 🔐 Autenticação JWT segura
- 📡 WebSocket para atualizações em tempo real
- 💾 Banco de dados MongoDB
- 🚀 Node.js + Express

### 🏢 Público-Alvo

- **Restaurantes** de todos os portes
- **Bares** e lanchonetes
- **Cafeterias** e fast-foods
- **Food courts**
- Qualquer estabelecimento que sirva alimentos e bebidas

### 🚀 Funcionalidades Principais

#### Sistema Web:
✅ Gestão completa de usuários e permissões  
✅ Cadastro e edição de cardápio  
✅ Configuração de mesas  
✅ Relatórios de vendas e desempenho  
✅ Dashboard administrativo  
✅ Histórico de pedidos e pagamentos  

#### App Mobile:
✅ Sistema de chamados em tempo real  
✅ Notificações de pedidos prontos  
✅ Criação de pedidos com cardápio integrado  
✅ Processamento de pagamentos  
✅ Gráficos de desempenho individual  
✅ Sincronização automática via WebSocket  

#### Backend:
✅ API RESTful completa  
✅ Autenticação e autorização  
✅ WebSocket para tempo real  
✅ Sistema de relatórios  
✅ Validações e segurança  

---

### 🔧 Stack Tecnológica

#### 🌐 **Frontend Web**
- **React** `19.1.1` - Biblioteca UI
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **React Router** - Navegação
- **Axios** - Cliente HTTP
- **Context API** - Estado global

#### 📱 **Mobile**
- **React Native** `0.81.5`
- **Expo** `~54.0.20`
- **TypeScript** - Tipagem forte
- **Expo Router** - Navegação file-based
- **Zustand** - State management
- **Socket.IO Client** - WebSocket
- **React Native Chart Kit** - Gráficos

#### 🔧 **Backend**
- **Node.js** `18.x` + **Express** `4.x`
- **MongoDB** + **Mongoose** - Banco de dados
- **JWT** - Autenticação
- **Socket.IO** - WebSocket
- **Bcrypt** - Criptografia
- **Cors** - Segurança

---

### 📁 Estrutura do Repositório

```
DSM-G04-PI4-2025-2/
│
├── web/                      # Aplicação Web React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── contexts/        # Context API
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # APIs e serviços
│   │   └── utils/           # Utilitários
│   └── package.json
│
├── mobile/                   # Aplicação Mobile React Native
│   ├── app/                 # File-based routing
│   ├── src/
│   │   ├── components/      # Componentes
│   │   ├── screens/         # Telas
│   │   ├── services/        # API e WebSocket
│   │   ├── stores/          # Zustand stores
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── backend/                  # API Node.js
│   ├── controllers/         # Lógica de negócio
│   ├── models/              # Modelos MongoDB
│   ├── routes/              # Rotas da API
│   ├── helpers/             # Validações e autenticação
│   ├── db/                  # Conexão com banco
│   ├── app.js               # Configuração Express
│   └── websocket.js         # Servidor WebSocket
│
├── docs/                     # Documentação
└── README.md                # Este arquivo
```

---

### ⚡ Como Executar

#### 🔧 **Backend**

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env com suas credenciais MongoDB
# DB_CONNECTION=mongodb://...

# Executar
npm start
# Servidor rodando em http://localhost:5000
```

#### 🌐 **Web**

```bash
cd web

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
# Aplicação rodando em http://localhost:5173
```

#### 📱 **Mobile**

```bash
cd mobile

# Instalar dependências
npm install

# Configurar IP do backend em src/config/api.config.ts

# Executar
npm start
# Escanear QR Code com Expo Go
```

---

### 📊 Status do Desenvolvimento

#### ✅ **Concluído:**
- Sistema Web completo (gestão de usuários, mesas, cardápio, relatórios)
- App Mobile completo (garçom e cozinha)
- Backend com API REST e WebSocket
- Autenticação JWT
- Sistema de notificações em tempo real
- Dashboard de desempenho
- Processamento de pagamentos
- Integração completa entre plataformas

#### 🎯 **Entregues:**
- 3 plataformas funcionais e integradas
- Sistema de tempo real via WebSocket
- Documentação completa
- Interface responsiva
- Segurança e validações

---

### 👥 Equipe de Desenvolvimento

**Grupo 04 - DSM Fatec Franca 2025.2**

| Membro | Responsabilidades |
|--------|-------------------|
| **Vinícius de Araújo Silva** | Frontend Web e IoT |
| **Paulo Ricardo de Azevedo Alvino** | Backend, Banco de Dados e Estatística |
| **Thiago Cunha Archete Silva** | Mobile (React Native) |

---

### 📖 Documentação Adicional

- [📱 README Mobile - Documentação completa do app](./mobile/README.md)
- [🌐 README Web - Documentação do frontend](./web/README.md)
- [🔧 README Backend - Documentação da API](./backend/README.md)

---

### 🔒 Segurança

- ✅ Autenticação JWT com refresh tokens
- ✅ Senhas criptografadas com Bcrypt
- ✅ Validação de dados em todas as rotas
- ✅ Proteção CORS configurada
- ✅ Sanitização de inputs

### 🌟 Diferenciais

1. **Tempo Real** - WebSocket para atualizações instantâneas
2. **3 Plataformas** - Web, Mobile e Backend integrados
3. **Multiplataforma** - Web responsivo + iOS/Android
4. **Gráficos e Métricas** - Dashboard completo de desempenho
5. **Sistema de Notificações** - Chamados e pedidos prontos em tempo real
6. **Código Limpo** - Arquitetura organizada e escalável

---

### 📸 Screenshots

#### Mobile App
Veja screenshots completos do app mobile [aqui](./mobile/README.md#-screenshots)

---

### 📝 Licença

Este projeto faz parte do **Projeto Integrador 4** do curso de **Desenvolvimento de Software Multiplataforma** da **Fatec Franca**.

---

**💼 Projeto Integrador IV - Fatec Franca**  
*Sistema completo de gestão para restaurantes - Web + Mobile + Backend*

**Versão**: 1.0.0  
**Última atualização**: Novembro 2025
