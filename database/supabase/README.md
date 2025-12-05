# DigestAI - Supabase Database

## 🎯 Visão Geral

Esta é a versão **adaptada para Supabase** do banco de dados DigestAI. Inclui:

- ✅ **Row Level Security (RLS)** em todas as tabelas
- ✅ **Integração com Supabase Auth** (`auth.users`)
- ✅ **Realtime** habilitado para notificações
- ✅ **Storage** preparado para PDFs e imagens
- ✅ **Funções RPC** para chamadas do frontend

## 📁 Estrutura de Arquivos

```
database/supabase/
├── 01_schema.sql       # Tabelas, índices e RLS policies
├── 02_functions.sql    # Funções e triggers
├── 03_seed.sql         # Dados iniciais (alimentos)
└── README.md           # Esta documentação
```

## 🚀 Instalação no Supabase

### Método 1: Via Dashboard (Recomendado)

1. **Acesse seu projeto no Supabase Dashboard**
   - Vá para: https://app.supabase.com

2. **Abra o SQL Editor**
   - Menu lateral → SQL Editor → New Query

3. **Execute os scripts na ordem:**

   **Passo 1 - Schema:**
   ```sql
   -- Cole todo o conteúdo de 01_schema.sql
   -- Execute (Ctrl/Cmd + Enter)
   ```

   **Passo 2 - Functions:**
   ```sql
   -- Cole todo o conteúdo de 02_functions.sql
   -- Execute (Ctrl/Cmd + Enter)
   ```

   **Passo 3 - Seed:**
   ```sql
   -- Cole todo o conteúdo de 03_seed.sql
   -- Execute (Ctrl/Cmd + Enter)
   ```

### Método 2: Via CLI

```bash
# Instale o Supabase CLI
npm install -g supabase

# Faça login
supabase login

# Link com seu projeto
supabase link --project-ref seu-project-ref

# Execute os scripts
supabase db push

# Ou execute manualmente
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  -f database/supabase/01_schema.sql \
  -f database/supabase/02_functions.sql \
  -f database/supabase/03_seed.sql
```

## 🔐 Autenticação

### Diferenças do PostgreSQL Puro

❌ **Antes (PostgreSQL):**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    password_hash VARCHAR(255)
);
```

✅ **Agora (Supabase):**
```sql
-- Usa auth.users do Supabase
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name VARCHAR(255)
);
```

### Como Criar Usuários

**Via Dashboard:**
1. Authentication → Users → Add User
2. Preencha email e senha
3. O profile será criado automaticamente via trigger

**Via JavaScript:**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'senha123',
  options: {
    data: {
      full_name: 'João Silva'
    }
  }
})
```

**Via API REST:**
```bash
curl -X POST 'https://[PROJECT-REF].supabase.co/auth/v1/signup' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }'
```

## 🛡️ Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Exemplos:

### Policies Implementadas

**Symptoms (Sintomas):**
```sql
-- Usuários só veem seus próprios sintomas
CREATE POLICY "Users can view own symptoms"
    ON symptoms FOR SELECT
    USING (auth.uid() = user_id);
```

**Foods (Alimentos):**
```sql
-- Todos podem ler alimentos (catálogo público)
CREATE POLICY "Anyone can view foods"
    ON foods FOR SELECT
    TO authenticated
    USING (true);
```

### Testando RLS

```sql
-- Como usuário autenticado
SELECT * FROM symptoms; -- Retorna apenas seus sintomas

-- Como admin (bypass RLS)
SELECT * FROM symptoms; -- Retorna todos (se tiver permissão)
```

## 📞 Funções RPC

Todas as funções podem ser chamadas do frontend via `supabase.rpc()`:

### Exemplos de Uso

**1. Dashboard Stats:**
```javascript
const { data, error } = await supabase
  .rpc('get_user_dashboard_stats')

console.log(data)
// {
//   totalSymptoms: 7,
//   avgIntensity: 5.3,
//   safeFoods: 12,
//   avoidFoods: 6,
//   ...
// }
```

**2. Gerar Relatório:**
```javascript
const { data: reportId, error } = await supabase
  .rpc('generate_user_report', { p_period_days: 30 })

console.log('Relatório criado:', reportId)
```

**3. Análise de Intolerâncias:**
```javascript
const { data, error } = await supabase
  .rpc('get_intolerance_analysis', { p_days: 30 })

console.log(data)
// [
//   {
//     allergen_type: 'lactose',
//     probability: 78,
//     symptom_count: 5,
//     ...
//   }
// ]
```

**4. Atualizar Scores de Alimentos:**
```javascript
const { data: updatedCount, error } = await supabase
  .rpc('update_user_food_status_scores')

console.log(`${updatedCount} alimentos atualizados`)
```

**5. Buscar Alimentos:**
```javascript
const { data, error } = await supabase
  .rpc('search_foods', {
    p_search_term: 'queijo',
    p_category: 'Laticínios',
    p_limit: 10
  })
```

**6. Recomendações de Alimentos:**
```javascript
const { data, error } = await supabase
  .rpc('get_food_recommendations', {
    p_meal_type: 'lunch',
    p_limit: 10
  })
```

## 📊 Queries Comuns

### Inserir Sintoma
```javascript
const { data, error } = await supabase
  .from('symptoms')
  .insert({
    types: ['bloating', 'gas'],
    intensity: 6,
    datetime: new Date().toISOString(),
    duration: '2 horas',
    notes: 'Após almoço'
  })
```

### Listar Sintomas
```javascript
const { data, error } = await supabase
  .from('symptoms')
  .select('*')
  .order('datetime', { ascending: false })
  .limit(10)
```

### Buscar Alimentos Seguros
```javascript
const { data, error } = await supabase
  .from('user_food_status')
  .select(`
    *,
    food:foods(*)
  `)
  .eq('status', 'safe')
  .order('safety_score', { ascending: false })
```

### Obter Relatórios
```javascript
const { data, error } = await supabase
  .from('reports')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(5)
```

## 🔄 Realtime

Habilitado para receber atualizações em tempo real:

### Notificações
```javascript
const channel = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Nova notificação:', payload.new)
      // Mostrar toast/alert
    }
  )
  .subscribe()
```

### Insights da IA
```javascript
const channel = supabase
  .channel('ai_insights')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'ai_insights',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Novo insight:', payload.new)
    }
  )
  .subscribe()
```

### Mensagens do Chat
```javascript
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('Nova mensagem:', payload.new)
      // Adicionar à lista de mensagens
    }
  )
  .subscribe()
```

## 📦 Storage (Arquivos)

### Configurar Buckets

**Via Dashboard:**
1. Storage → Create Bucket
2. Nome: `reports` (para PDFs)
3. Nome: `avatars` (para fotos de perfil)
4. Nome: `food-images` (para imagens de alimentos)

**Policies de Storage:**
```sql
-- Bucket: reports
-- Policy: Users can upload own reports
CREATE POLICY "Users can upload own reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view own reports
CREATE POLICY "Users can view own reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Upload de Arquivos

**PDF de Relatório:**
```javascript
const { data, error } = await supabase.storage
  .from('reports')
  .upload(`${userId}/report-${reportId}.pdf`, pdfFile, {
    contentType: 'application/pdf'
  })

// Atualizar URL no relatório
await supabase
  .from('reports')
  .update({ pdf_url: data.path })
  .eq('id', reportId)
```

**Avatar do Usuário:**
```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, imageFile, {
    contentType: 'image/jpeg',
    upsert: true
  })

// Atualizar profile
await supabase
  .from('profiles')
  .update({ avatar_url: data.path })
  .eq('id', userId)
```

## 🔧 Manutenção

### Backup
```bash
# Via CLI
supabase db dump -f backup.sql

# Via Dashboard
# Settings → Database → Backups
```

### Migrations

Crie migrations para mudanças futuras:

```bash
# Criar nova migration
supabase migration new add_new_feature

# Editar arquivo em supabase/migrations/
# Aplicar migration
supabase db push
```

### Monitoramento

**Via Dashboard:**
- Database → Query Performance
- Database → Logs
- Database → Extensions

**Queries Lentas:**
```sql
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Erro: "new row violates row-level security policy"

**Causa:** Tentando inserir dados sem autenticação ou para outro usuário.

**Solução:**
```javascript
// Certifique-se de estar autenticado
const { data: { user } } = await supabase.auth.getUser()

// Use o user_id correto
await supabase.from('symptoms').insert({
  user_id: user.id, // ← Importante!
  types: ['bloating'],
  intensity: 5,
  datetime: new Date().toISOString()
})
```

### Erro: "permission denied for function"

**Causa:** Função não tem `SECURITY DEFINER`.

**Solução:** Todas as funções já têm `SECURITY DEFINER` nos scripts.

### RLS não está funcionando

**Verificar:**
```sql
-- Ver policies da tabela
SELECT * FROM pg_policies WHERE tablename = 'symptoms';

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Dados de seed não aparecem

**Causa:** Precisa criar usuário primeiro.

**Solução:**
1. Crie usuário via Auth
2. Obtenha o UUID: `SELECT id FROM auth.users WHERE email = 'seu@email.com'`
3. Execute o seed substituindo `YOUR_USER_ID_HERE`

## 📚 Recursos Adicionais

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🆘 Suporte

Para questões específicas do Supabase:
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

## ✅ Checklist de Instalação

- [ ] Criar projeto no Supabase
- [ ] Executar `01_schema.sql`
- [ ] Executar `02_functions.sql`
- [ ] Executar `03_seed.sql`
- [ ] Criar usuário via Auth
- [ ] Executar seed de dados do usuário
- [ ] Configurar Storage buckets
- [ ] Testar RLS policies
- [ ] Configurar Realtime
- [ ] Integrar com frontend

## 🎉 Pronto!

Seu banco de dados DigestAI está configurado no Supabase com:
- ✅ 11 tabelas com RLS
- ✅ 10+ funções RPC
- ✅ 50+ alimentos no catálogo
- ✅ Realtime habilitado
- ✅ Storage configurado
- ✅ Segurança completa
