# 📡 WebSocket - Implementação Completa

## ✅ Backend (Node.js + Socket.IO)

### Arquivos Criados/Modificados

#### `websocket.js` - Gerenciador de WebSocket

- Autenticação via JWT token
- Salas por empresa (multi-tenant)
- Funções de emit para cada evento

#### `app.js` - Integração

- HTTP server criado
- Socket.IO inicializado
- CORS atualizado

#### Controllers Atualizados

- **PedidoController**: Emite `novo_pedido` e `pedido_atualizado`
- **ChamadoController**: Emite `novo_chamado` e `chamado_atualizado`
- **ContaController**: Emite `nova_conta` e `conta_atualizada`
- **PagamentoController**: Emite `novo_pagamento`
- **MesaController**: Mesa atualizada via outros controllers

### Eventos Disponíveis

| Evento               | Quando é emitido         | Dados                                               |
| -------------------- | ------------------------ | --------------------------------------------------- |
| `novo_pedido`        | Pedido criado            | `{ _id, mesa, status, itens, observacoes_gerais }`  |
| `pedido_atualizado`  | Status do pedido muda    | `{ _id, status, cozinheiro?, garcom? }`             |
| `novo_chamado`       | Cliente chama garçom     | `{ _id, mesa: { _id, numero }, status, createdAt }` |
| `chamado_atualizado` | Chamado aceito/resolvido | `{ _id, status, garcom? }`                          |
| `mesa_atualizada`    | Status da mesa muda      | `{ _id, numero?, status, conta_ativa? }`            |
| `nova_conta`         | Conta aberta             | `{ _id, mesa, status, valor_total }`                |
| `conta_atualizada`   | Conta modificada         | `{ _id, valor_pago?, valor_total?, status? }`       |
| `novo_pagamento`     | Pagamento registrado     | `{ _id, conta, valor, metodo }`                     |

---

## ✅ Mobile (React Native + Socket.IO Client)

### Arquivos Criados/Modificados

#### `src/services/websocket.ts` - Serviço WebSocket

- Gerencia conexão Socket.IO
- Métodos: `connect()`, `disconnect()`, `on()`, `off()`
- Reconexão automática
- Logs detalhados

#### `src/stores/userStore.ts` - Autenticação

- Conecta WebSocket ao fazer login (`setAuth`)
- Desconecta ao fazer logout

#### `src/hooks/useAuthentication.ts` - Restauração de Sessão

- Reconecta WebSocket ao restaurar sessão salva

#### `src/features/tables/useTables.ts` - Mesas

- Listener de `mesa_atualizada`
- Atualiza lista de mesas em tempo real

#### `src/features/calls/useChamados.ts` - Chamados (NOVO)

- Listener de `novo_chamado` (com vibração)
- Listener de `chamado_atualizado`
- Remove chamados atendidos da lista
- Função `aceitarChamado()`

#### `src/screens/TableDetailsScreen.tsx` - Detalhes da Conta

- Listener de `nova_conta`
- Listener de `conta_atualizada`
- Atualiza valores em tempo real

---

## 🔌 Como Usar

### Backend - Iniciar Servidor

```bash
cd backend
npm start
```

Servidor disponível em:

- HTTP: `http://localhost:5000`
- WebSocket: `ws://localhost:5000`

### Mobile - Uso Automático

O WebSocket conecta automaticamente quando o usuário:

1. Faz login
2. Abre o app (se já estava logado)

### Fluxo de Funcionamento

```
1. Login → WebSocket conecta com token JWT
2. Backend valida token e coloca cliente na sala da empresa
3. Quando algo acontece no backend (novo pedido, chamado, etc):
   - Backend emite evento para toda a sala da empresa
   - Mobile recebe e atualiza UI automaticamente
4. Logout → WebSocket desconecta
```

---

## 📋 Exemplos de Uso

### Backend - Emitir Evento

```javascript
const { emitNovoChamado } = require("./websocket");

// Dentro de um controller
emitNovoChamado(empresaId, {
  _id: chamado._id,
  mesa: { _id: mesa._id, numero: mesa.numero },
  status: chamado.status,
});
```

### Mobile - Ouvir Evento

```typescript
import { websocketService } from "@/src/services/websocket";

useEffect(() => {
  const handleNovoChamado = (data) => {
    console.log("Novo chamado:", data);
    // Atualizar state
  };

  websocketService.on("novo_chamado", handleNovoChamado);

  return () => {
    websocketService.off("novo_chamado", handleNovoChamado);
  };
}, []);
```

---

## 🎯 Próximos Passos

Para adicionar mais eventos:

1. **Backend**: Adicionar função de emit no `websocket.js`
2. **Backend**: Chamar função no controller apropriado
3. **Mobile**: Adicionar listener no componente/hook

---

## 🐛 Debug

### Backend

Logs aparecem no console do servidor:

- ✅ Cliente conectado
- 📍 Cliente entrou na sala
- 📤 Evento enviado
- ❌ Cliente desconectado

### Mobile

Logs aparecem no console do Expo:

- ✅ WebSocket conectado
- 📡 WebSocket autenticado
- 📡 Eventos recebidos (novo_chamado, mesa_atualizada, etc)
- ❌ WebSocket desconectado

---

## ⚡ Performance

- Conexão por empresa (isolada)
- Reconexão automática
- Eventos tipados
- Cleanup automático
- Zero polling (100% push)

---

**Status**: ✅ Implementado e Funcionando
**Data**: 12/11/2025
