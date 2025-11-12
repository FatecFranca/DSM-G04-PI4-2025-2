# 🧪 Testando WebSocket

## Checklist para testar:

### 1. Backend rodando

```bash
cd backend
npm start
```

Deve mostrar:

```
🚀 Servidor rodando na porta 5000
📡 API REST disponível em: http://localhost:5000
⚡ WebSocket disponível em: ws://localhost:5000
```

### 2. Mobile conectado

Abra o console do Expo (terminal onde você roda `npm start` ou `npx expo start`)

**Ao fazer login**, você deve ver:

```
✅ WebSocket conectado: <socket-id>
📡 WebSocket autenticado: { message: 'Conectado ao WebSocket', empresaId: '...', cargo: '...' }
```

### 3. Teste criar um chamado

**Via Postman ou Insomnia:**

```http
POST http://localhost:5000/chamados
Content-Type: application/json

{
  "id_botao": "BTN_MESA_1"
}
```

**No console do Mobile**, você deve ver INSTANTANEAMENTE:

```
🔔 WebSocket evento recebido: "novo_chamado" [{ _id: '...', mesa: {...}, status: 'pendente', ... }]
📡 Novo chamado via WebSocket: { ... }
```

**Na lista de chamados do app**, o novo chamado deve aparecer imediatamente!

### 4. Teste aceitar um chamado

Clique no botão de aceitar chamado no app.

**No console do Mobile**:

```
🔔 WebSocket evento recebido: "chamado_atualizado" [{ _id: '...', status: 'atendido', ... }]
📡 Chamado atualizado via WebSocket: { ... }
```

O chamado deve sumir da lista de pendentes instantaneamente.

### 5. Teste atualização de mesa

**Via Postman:**

```http
PATCH http://localhost:5000/chamados/<chamadoId>/aceitar
Authorization: Bearer <seu-token>
```

**No console do Mobile**:

```
🔔 WebSocket evento recebido: "mesa_atualizada" [{ _id: '...', status: 'ocupada', ... }]
📡 Mesa atualizada via WebSocket: { ... }
```

O status da mesa deve mudar de cor instantaneamente no mapa!

---

## ❌ Se NÃO aparecer os logs:

### Problema 1: WebSocket não conecta

- Verifique se o backend está rodando
- Verifique o IP em `api.config.ts`
- Se estiver no emulador, use `10.0.2.2:5000`
- Se estiver no celular físico, use o IP da sua rede (ex: `192.168.100.8:5000`)

### Problema 2: Não recebe eventos

- Verifique se fez login (WebSocket só conecta após login)
- Verifique se está usando a mesma empresa
- Verifique os logs do backend (deve mostrar "📤 Evento enviado")

### Problema 3: Socket.IO não funciona no React Native

Esse é o erro que você teve. Solução:

```bash
cd mobile
npm uninstall socket.io-client
npm install socket.io-client@^4.5.4
```

---

## 🎯 Resultado Esperado

Quando funcionar corretamente:

1. ✅ Criar chamado via Postman → Aparece INSTANTANEAMENTE no app
2. ✅ Aceitar chamado no app → Atualiza INSTANTANEAMENTE no backend
3. ✅ Abrir conta → Mesa muda de status INSTANTANEAMENTE
4. ✅ Atualizar pedido → Notificação INSTANTÂNEA

**Zero delay, zero polling, 100% em tempo real!** ⚡
