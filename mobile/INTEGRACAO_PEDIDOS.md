# Integração de Pedidos com o Backend

## ⚠️ Situação Atual (Dados Mockados)

Atualmente, o app está usando **dados mockados** com IDs simples (números: 1, 2, 3...).

Para criar pedidos **reais** no backend, você precisa dos **IDs do MongoDB** das mesas (formato: `507f1f77bcf86cd799439011`).

## 🔄 Como Fazer Funcionar com Backend Real

### 1. **Buscar Mesas do Backend**

No arquivo `MainScreen.tsx`, substitua os dados mockados:

```typescript
import { mesaAPI } from '../services/api';

export default function MainScreen() {
  const [tables, setTables] = useState<Table[]>([]);
  
  useEffect(() => {
    async function loadMesas() {
      try {
        const mesas = await mesaAPI.listar();
        // Transformar dados do backend para o formato da UI
        const tablesFormatted = mesas.map((mesa, index) => ({
          id: mesa.numero, // Número da mesa para UI
          _id: mesa._id,   // ID do MongoDB
          number: mesa.numero.toString(),
          position: { x: 0.2 + (index * 0.3), y: 0.2 }, // Ajuste conforme layout
          status: mapStatus(mesa.status) // Converter status do backend
        }));
        setTables(tablesFormatted);
      } catch (error) {
        console.error('Erro ao carregar mesas:', error);
      }
    }
    loadMesas();
  }, []);
}
```

### 2. **Passar o `_id` no Chamado**

Quando receber um chamado, certifique-se de incluir o `table_id` (MongoDB):

```typescript
const [activeCall, setActiveCall] = useState<Call | null>({
  id: '2',
  tableId: 3,              // ID local para UI
  table_id: mesa._id,      // ✅ ID do MongoDB
  timestamp: new Date().toISOString(),
  status: 'in-progress'
});
```

### 3. **Verificar Fluxo Completo**

```
1. Backend retorna mesas com _id (MongoDB)
2. MainScreen armazena mesas com _id
3. Chamado inclui table_id (MongoDB)
4. OrderModal recebe table_id
5. API usa table_id para criar pedido
```

## 🎯 O Que Acontece Agora

- **COM `table_id`**: Pedido é enviado ao backend ✅
- **SEM `table_id`**: Mostra alerta de "Modo Demo" ⚠️

## 📋 Checklist para Produção

- [ ] Backend rodando na porta 5000
- [ ] Criar mesas no MongoDB via backend
- [ ] Buscar mesas do backend no app
- [ ] Atualizar IDs nos chamados
- [ ] Testar criação de pedido real
- [ ] Remover dados mockados

## 🔗 APIs Disponíveis

- `mesaAPI.listar()` - Lista todas as mesas
- `mesaAPI.buscarPorId(id)` - Busca mesa por ID
- `cardapioAPI.listar()` - Lista cardápio (já implementado)
- `pedidoAPI.criar(mesaId, pedido)` - Cria pedido (já implementado)

## 📝 Nota Importante

O backend espera o formato:
```
POST /api/pedidos/mesa/:mesaId
```

Onde `:mesaId` deve ser o `_id` do MongoDB (não o número da mesa).
