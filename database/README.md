# DigestAI - Database Documentation

## 📋 Visão Geral

Este diretório contém todos os scripts SQL necessários para criar e gerenciar o banco de dados do DigestAI, um sistema de monitoramento de saúde digestiva com inteligência artificial.

## 🗂️ Estrutura de Arquivos

```
database/
├── schema.sql      # Definição de todas as tabelas e índices
├── functions.sql   # Funções e triggers do PostgreSQL
├── views.sql       # Views para consultas otimizadas
├── seed.sql        # Dados iniciais para desenvolvimento
└── README.md       # Esta documentação
```

## 🚀 Instalação

### Pré-requisitos

- PostgreSQL 12 ou superior
- Extensões: `uuid-ossp`, `pgcrypto`

### Passos de Instalação

1. **Criar o banco de dados:**
```bash
createdb digestai
```

2. **Executar os scripts na ordem:**
```bash
psql -d digestai -f database/schema.sql
psql -d digestai -f database/functions.sql
psql -d digestai -f database/views.sql
psql -d digestai -f database/seed.sql  # Opcional: apenas para desenvolvimento
```

Ou executar tudo de uma vez:
```bash
psql -d digestai -f database/schema.sql -f database/functions.sql -f database/views.sql -f database/seed.sql
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **users**
Armazena informações dos usuários do sistema.

**Campos principais:**
- `id` (UUID): Identificador único
- `email` (VARCHAR): E-mail único do usuário
- `password_hash` (VARCHAR): Senha criptografada
- `full_name` (VARCHAR): Nome completo
- `birth_date` (DATE): Data de nascimento
- `gender` (VARCHAR): Gênero (male, female, other)
- `weight` (DECIMAL): Peso em kg
- `height` (INTEGER): Altura em cm

#### 2. **foods**
Catálogo de alimentos disponíveis.

**Campos principais:**
- `id` (UUID): Identificador único
- `name` (VARCHAR): Nome do alimento
- `category` (VARCHAR): Categoria (Laticínios, Grãos, etc.)
- `common_allergens` (TEXT[]): Array de alérgenos comuns
- `nutritional_info` (JSONB): Informações nutricionais

#### 3. **symptoms**
Registro de sintomas digestivos dos usuários.

**Campos principais:**
- `id` (UUID): Identificador único
- `user_id` (UUID): Referência ao usuário
- `types` (TEXT[]): Array de tipos de sintomas
- `intensity` (INTEGER): Intensidade de 1 a 10
- `datetime` (TIMESTAMP): Data e hora do sintoma
- `duration` (VARCHAR): Duração do sintoma
- `notes` (TEXT): Observações adicionais

**Tipos de sintomas suportados:**
- `abdominal_pain` - Dor Abdominal
- `bloating` - Estufamento
- `gas` - Gases
- `diarrhea` - Diarreia
- `constipation` - Prisão de Ventre
- `nausea` - Náusea
- `heartburn` - Azia/Refluxo
- `vomiting` - Vômito
- `cramps` - Cólicas
- `other` - Outro

#### 4. **food_logs**
Registro de alimentos consumidos pelos usuários.

**Campos principais:**
- `id` (UUID): Identificador único
- `user_id` (UUID): Referência ao usuário
- `food_id` (UUID): Referência ao alimento
- `meal_type` (VARCHAR): Tipo de refeição (breakfast, lunch, dinner, snack)
- `datetime` (TIMESTAMP): Data e hora do consumo
- `symptom_id` (UUID): Sintoma relacionado (opcional)

#### 5. **user_food_status**
Status de segurança de cada alimento para cada usuário.

**Campos principais:**
- `id` (UUID): Identificador único
- `user_id` (UUID): Referência ao usuário
- `food_id` (UUID): Referência ao alimento
- `status` (VARCHAR): Status (safe, moderate, avoid)
- `safety_score` (INTEGER): Score de 0 a 100
- `ai_notes` (TEXT): Notas geradas pela IA

#### 6. **reports**
Relatórios de análise gerados pelo sistema.

**Campos principais:**
- `id` (UUID): Identificador único
- `user_id` (UUID): Referência ao usuário
- `period_start` (DATE): Início do período analisado
- `period_end` (DATE): Fim do período analisado
- `risk_score` (INTEGER): Score de risco de 0 a 100
- `intolerances` (JSONB): Análise de intolerâncias
- `summary` (TEXT): Resumo do relatório

#### 7. **conversations** e **messages**
Sistema de chat com a IA.

**conversations:**
- `id` (UUID): Identificador único
- `user_id` (UUID): Referência ao usuário
- `title` (VARCHAR): Título da conversa

**messages:**
- `id` (UUID): Identificador único
- `conversation_id` (UUID): Referência à conversa
- `role` (VARCHAR): Papel (user, assistant)
- `content` (TEXT): Conteúdo da mensagem

#### 8. **user_preferences**
Preferências e configurações do usuário.

**Campos principais:**
- `dietary_restrictions` (TEXT[]): Restrições dietéticas
- `allergies` (TEXT[]): Alergias conhecidas
- `notification_settings` (JSONB): Configurações de notificação
- `alert_intensity` (VARCHAR): Intensidade de alertas
- `theme` (VARCHAR): Tema da interface

#### 9. **ai_insights**
Insights gerados pela inteligência artificial.

**Campos principais:**
- `insight_type` (VARCHAR): Tipo do insight
- `title` (VARCHAR): Título
- `content` (TEXT): Conteúdo
- `priority` (VARCHAR): Prioridade (high, medium, low)
- `is_read` (BOOLEAN): Se foi lido

#### 10. **notifications**
Sistema de notificações.

**Campos principais:**
- `type` (VARCHAR): Tipo da notificação
- `title` (VARCHAR): Título
- `message` (TEXT): Mensagem
- `is_read` (BOOLEAN): Se foi lida

## 🔧 Funções Principais

### 1. `calculate_food_safety_score(user_id, food_id)`
Calcula o score de segurança de um alimento para um usuário específico.

**Retorna:** INTEGER (0-100)

**Exemplo:**
```sql
SELECT calculate_food_safety_score(
    '123e4567-e89b-12d3-a456-426614174000',
    '987fcdeb-51a2-43f7-8d9e-123456789abc'
);
```

### 2. `update_user_food_status_scores(user_id)`
Atualiza os scores de todos os alimentos de um usuário.

**Retorna:** INTEGER (quantidade de alimentos atualizados)

**Exemplo:**
```sql
SELECT update_user_food_status_scores('123e4567-e89b-12d3-a456-426614174000');
```

### 3. `get_intolerance_analysis(user_id, days)`
Analisa possíveis intolerâncias baseado nos últimos N dias.

**Retorna:** TABLE com análise de intolerâncias

**Exemplo:**
```sql
SELECT * FROM get_intolerance_analysis(
    '123e4567-e89b-12d3-a456-426614174000',
    30
);
```

### 4. `generate_user_report(user_id, period_days)`
Gera um relatório completo para o usuário.

**Retorna:** UUID (ID do relatório criado)

**Exemplo:**
```sql
SELECT generate_user_report(
    '123e4567-e89b-12d3-a456-426614174000',
    30
);
```

### 5. `get_user_dashboard_stats(user_id)`
Retorna estatísticas para o dashboard do usuário.

**Retorna:** JSONB com estatísticas

**Exemplo:**
```sql
SELECT get_user_dashboard_stats('123e4567-e89b-12d3-a456-426614174000');
```

### 6. `get_user_symptoms_by_period(user_id, start_date, end_date)`
Retorna sintomas de um usuário em um período específico.

**Exemplo:**
```sql
SELECT * FROM get_user_symptoms_by_period(
    '123e4567-e89b-12d3-a456-426614174000',
    '2024-11-01'::timestamp,
    '2024-12-01'::timestamp
);
```

### 7. `create_ai_insight(user_id, type, title, content, priority, related_data)`
Cria um novo insight da IA.

**Exemplo:**
```sql
SELECT create_ai_insight(
    '123e4567-e89b-12d3-a456-426614174000',
    'pattern',
    'Padrão identificado',
    'Você apresenta sintomas após consumir laticínios',
    'high',
    '{"foods": ["Leite", "Queijo"]}'::jsonb
);
```

### 8. `get_food_recommendations(user_id, meal_type, limit)`
Retorna recomendações de alimentos seguros.

**Exemplo:**
```sql
SELECT * FROM get_food_recommendations(
    '123e4567-e89b-12d3-a456-426614174000',
    'lunch',
    10
);
```

### 9. `get_symptom_patterns(user_id, days)`
Identifica padrões nos sintomas do usuário.

**Exemplo:**
```sql
SELECT * FROM get_symptom_patterns(
    '123e4567-e89b-12d3-a456-426614174000',
    30
);
```

## 📈 Views Disponíveis

### 1. `v_user_symptoms_summary`
Resumo estatístico de sintomas por usuário.

### 2. `v_food_consumption_stats`
Estatísticas de consumo de alimentos.

### 3. `v_user_food_safety_overview`
Visão geral de segurança alimentar.

### 4. `v_symptom_food_correlation`
Correlação entre sintomas e alimentos.

### 5. `v_user_activity_timeline`
Timeline unificada de atividades.

### 6. `v_weekly_symptom_trends`
Tendências semanais de sintomas.

### 7. `v_meal_type_analysis`
Análise por tipo de refeição.

### 8. `v_allergen_exposure`
Exposição a alérgenos.

### 9. `v_user_reports_summary`
Resumo de relatórios.

### 10. `v_unread_notifications_count`
Contagem de notificações não lidas.

### 11. `v_conversation_summary`
Resumo de conversas com IA.

### 12. `v_daily_symptom_intensity`
Intensidade diária de sintomas.

### 13. `v_food_category_tolerance`
Tolerância por categoria de alimento.

## 🔐 Segurança

### Autenticação
- Senhas são armazenadas usando `pgcrypto` com bcrypt
- Exemplo de verificação de senha:
```sql
SELECT * FROM users 
WHERE email = 'user@example.com' 
AND password_hash = crypt('senha_digitada', password_hash);
```

### Permissões Recomendadas
```sql
-- Criar role para aplicação
CREATE ROLE digestai_app WITH LOGIN PASSWORD 'senha_segura';

-- Conceder permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO digestai_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO digestai_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO digestai_app;
```

## 📝 Dados de Teste

O arquivo `seed.sql` cria:
- 1 usuário de teste: `joao@example.com` / `senha123`
- 50+ alimentos no catálogo
- 7 sintomas de exemplo
- 14 logs de alimentos
- 1 relatório gerado
- 1 conversa com mensagens
- 2 insights da IA
- 2 notificações

## 🔄 Manutenção

### Backup
```bash
pg_dump digestai > backup_digestai_$(date +%Y%m%d).sql
```

### Restore
```bash
psql digestai < backup_digestai_20241204.sql
```

### Limpeza de dados antigos
```sql
-- Deletar sintomas com mais de 1 ano
DELETE FROM symptoms WHERE datetime < CURRENT_TIMESTAMP - INTERVAL '1 year';

-- Deletar notificações lidas com mais de 30 dias
DELETE FROM notifications 
WHERE is_read = true 
AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Deletar insights expirados
DELETE FROM ai_insights WHERE expires_at < CURRENT_TIMESTAMP;
```

## 📊 Queries Úteis

### Estatísticas gerais do sistema
```sql
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM symptoms) as total_symptoms,
    (SELECT COUNT(*) FROM food_logs) as total_food_logs,
    (SELECT COUNT(*) FROM reports) as total_reports,
    (SELECT COUNT(*) FROM foods) as total_foods;
```

### Usuários mais ativos
```sql
SELECT 
    u.full_name,
    COUNT(DISTINCT s.id) as symptom_count,
    COUNT(DISTINCT fl.id) as food_log_count,
    MAX(s.datetime) as last_activity
FROM users u
LEFT JOIN symptoms s ON s.user_id = u.id
LEFT JOIN food_logs fl ON fl.user_id = u.id
GROUP BY u.id, u.full_name
ORDER BY symptom_count DESC
LIMIT 10;
```

### Alimentos mais problemáticos
```sql
SELECT 
    f.name,
    f.category,
    COUNT(DISTINCT ufs.user_id) as users_avoiding,
    ROUND(AVG(ufs.safety_score), 1) as avg_safety_score
FROM user_food_status ufs
INNER JOIN foods f ON f.id = ufs.food_id
WHERE ufs.status = 'avoid'
GROUP BY f.id, f.name, f.category
ORDER BY users_avoiding DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Erro: "extension uuid-ossp does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Erro: "extension pgcrypto does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Performance lenta em queries
```sql
-- Recriar índices
REINDEX DATABASE digestai;

-- Atualizar estatísticas
ANALYZE;
```

## 📚 Referências

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [UUID Extension](https://www.postgresql.org/docs/current/uuid-ossp.html)
- [pgcrypto Extension](https://www.postgresql.org/docs/current/pgcrypto.html)
- [JSONB Type](https://www.postgresql.org/docs/current/datatype-json.html)

## 📞 Suporte

Para questões sobre o banco de dados, consulte a documentação do projeto principal ou abra uma issue no repositório.


## ⚠️ IMPORTANTE: Row Level Security (RLS)

### Configuração Obrigatória para Supabase

O arquivo `rls-policies.sql` contém as políticas de segurança **OBRIGATÓRIAS** para o funcionamento correto do sistema no Supabase.

**Execute no SQL Editor do Supabase:**

```bash
# Ordem de execução:
1. schema.sql          # Cria as tabelas
2. rls-policies.sql    # ⚠️ OBRIGATÓRIO - Configura segurança
3. functions.sql       # Cria funções
4. views.sql          # Cria views
5. seed.sql           # Dados de teste (opcional)
```

### Verificar se RLS está ativo

```sql
-- Verificar se RLS está habilitado nas tabelas
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('conversations', 'messages', 'symptoms', 'food_logs');

-- Listar políticas criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Sintomas de RLS não configurado

Se você ver erros como:
- `403 Forbidden`
- `new row violates row-level security policy`
- `Error initializing conversation`

**Solução:** Execute o arquivo `rls-policies.sql` no SQL Editor do Supabase.
