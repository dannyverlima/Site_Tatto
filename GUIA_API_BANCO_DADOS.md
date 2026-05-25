# 📚 Guia de Uso - API do Banco de Dados

## 1️⃣ Configuração Inicial

### Arquivo: `.env.local`
```
VITE_DB_HOST=localhost5173
VITE_DB_USER=postgres
VITE_DB_PASSWORD=27102006
VITE_DB_NAME=postgres
VITE_DB_PORT=5432
```

### Instalação
```bash
npm install
```

---

## 2️⃣ Estrutura dos Arquivos

```
src/
├── database.ts              # Configuração e pool de conexões
├── databaseService.ts       # Funções CRUD genéricas
├── apiControllers.ts        # Controladores (Usuários, Serviços)
└── useDatabaseAPI.ts        # Hook React
```

---

## 3️⃣ Como Usar em Componentes React

### Exemplo 1: Buscar todos os usuários
```tsx
import { useDatabaseAPI } from '@/useDatabaseAPI';

export function MyComponent() {
  const { getUsers, loading, data, error } = useDatabaseAPI();

  const handleFetchUsers = async () => {
    await getUsers();
  };

  return (
    <div>
      <button onClick={handleFetchUsers}>Buscar Usuários</button>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Exemplo 2: Criar novo usuário
```tsx
const { createUser, loading } = useDatabaseAPI();

const handleCreateUser = async () => {
  const result = await createUser({
    id: 'user_' + Date.now(),
    name: 'João Silva',
    email: 'joao@example.com',
  });
  console.log('Usuário criado:', result);
};
```

### Exemplo 3: Verificar conexão com BD
```tsx
const { checkHealth } = useDatabaseAPI();

const handleCheckConnection = async () => {
  const health = await checkHealth();
  console.log('Status da conexão:', health);
};
```

---

## 4️⃣ Funções Disponíveis

### DatabaseService (src/databaseService.ts)

| Função | Descrição |
|--------|----------|
| `query(sql, values)` | Executa SELECT |
| `execute(sql, values)` | Executa INSERT/UPDATE/DELETE |
| `findById(table, id)` | Busca por ID |
| `findAll(table, limit)` | Lista todos os registros |
| `create(table, data)` | Insere novo registro |
| `update(table, id, data)` | Atualiza registro |
| `delete(table, id)` | Deleta registro |

### Controllers (src/apiControllers.ts)

**userController:**
- `getAll()` - Lista todos os usuários
- `getById(id)` - Busca usuário por ID
- `create(userData)` - Cria novo usuário
- `update(id, data)` - Atualiza usuário
- `delete(id)` - Deleta usuário

**serviceController:**
- `getAll()` - Lista todos os serviços
- `create(serviceData)` - Cria novo serviço

---

## 5️⃣ Estrutura de Resposta

Todas as respostas seguem este padrão:

```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

ou em caso de erro:

```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

---

## 6️⃣ Próximos Passos

1. ✅ Instalar dependências: `npm install`
2. ✅ Testar conexão com BD
3. ⏳ Criar tabelas no MySQL conforme suas necessidades
4. ⏳ Adaptar controllers para suas tabelas
5. ⏳ Integrar com componentes React

---

## 🚀 Comandos Úteis

```bash
# Verificar status do servidor
npm run dev

# Instalar dependências
npm install

# Build para produção
npm run build
```

---

## ⚠️ Importante

- **NÃO COMMITTE** o arquivo `.env.local` (já está em `.gitignore`)
- **USE** `.env.example` para documentar as variáveis necessárias
- **TESTE** a conexão antes de usar em produção
- **VALIDE** sempre os dados antes de inserir no banco

---

Pronto para usar! 🎉
