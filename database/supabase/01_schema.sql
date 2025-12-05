-- ============================================
-- DigestAI - Supabase Schema
-- Sistema de Monitoramento de Saúde Digestiva
-- Adaptado para Supabase com RLS
-- ============================================

-- Extensões necessárias (já vêm no Supabase)
-- uuid-ossp, pgcrypto já estão habilitadas

-- ============================================
-- TABELA: profiles
-- Estende auth.users com informações adicionais
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    birth_date DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    weight DECIMAL(5,2), -- em kg
    height INTEGER, -- em cm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Índices para profiles
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- ============================================
-- TABELA: foods
-- Catálogo de alimentos (público para leitura)
-- ============================================
CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    common_allergens TEXT[], -- array de alérgenos comuns
    image_url TEXT,
    nutritional_info JSONB, -- informações nutricionais flexíveis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para foods (todos podem ler, apenas admin pode modificar)
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view foods"
    ON foods FOR SELECT
    TO authenticated
    USING (true);

-- Índices para foods
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_allergens ON foods USING GIN(common_allergens);

-- ============================================
-- TABELA: symptoms
-- Registro de sintomas dos usuários
-- ============================================
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    types TEXT[] NOT NULL, -- array de tipos de sintomas
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    duration VARCHAR(100),
    pain_location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para symptoms
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptoms"
    ON symptoms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms"
    ON symptoms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms"
    ON symptoms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptoms"
    ON symptoms FOR DELETE
    USING (auth.uid() = user_id);

-- Índices para symptoms
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_datetime ON symptoms(datetime);
CREATE INDEX idx_symptoms_intensity ON symptoms(intensity);
CREATE INDEX idx_symptoms_types ON symptoms USING GIN(types);

-- ============================================
-- TABELA: food_logs
-- Registro de alimentos consumidos
-- ============================================
CREATE TABLE food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symptom_id UUID REFERENCES symptoms(id) ON DELETE SET NULL,
    food_name VARCHAR(255) NOT NULL,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    portion_size VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para food_logs
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food logs"
    ON food_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
    ON food_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
    ON food_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
    ON food_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Índices para food_logs
CREATE INDEX idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX idx_food_logs_symptom_id ON food_logs(symptom_id);
CREATE INDEX idx_food_logs_food_id ON food_logs(food_id);
CREATE INDEX idx_food_logs_datetime ON food_logs(datetime);
CREATE INDEX idx_food_logs_meal_type ON food_logs(meal_type);

-- ============================================
-- TABELA: user_food_status
-- Status de segurança de alimentos por usuário
-- ============================================
CREATE TABLE user_food_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('safe', 'moderate', 'avoid')),
    safety_score INTEGER NOT NULL CHECK (safety_score >= 0 AND safety_score <= 100),
    ai_notes TEXT,
    correlation_data JSONB, -- dados de correlação com sintomas
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, food_id)
);

-- RLS para user_food_status
ALTER TABLE user_food_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food status"
    ON user_food_status FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food status"
    ON user_food_status FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food status"
    ON user_food_status FOR UPDATE
    USING (auth.uid() = user_id);

-- Índices para user_food_status
CREATE INDEX idx_user_food_status_user_id ON user_food_status(user_id);
CREATE INDEX idx_user_food_status_food_id ON user_food_status(food_id);
CREATE INDEX idx_user_food_status_status ON user_food_status(status);
CREATE INDEX idx_user_food_status_safety_score ON user_food_status(safety_score);

-- ============================================
-- TABELA: reports
-- Relatórios de análise gerados
-- ============================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    summary TEXT NOT NULL,
    intolerances JSONB NOT NULL, -- array de análises de intolerância
    recommendations JSONB, -- recomendações personalizadas
    pdf_url TEXT, -- URL do Storage do Supabase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Índices para reports
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- ============================================
-- TABELA: conversations
-- Conversas com o assistente AI
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
    ON conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Índices para conversations
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);

-- ============================================
-- TABELA: messages
-- Mensagens das conversas
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB, -- dados adicionais como tokens, modelo usado, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para messages (herda permissão da conversation)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own conversations"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Índices para messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- TABELA: user_preferences
-- Preferências e configurações do usuário
-- ============================================
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dietary_restrictions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    notification_settings JSONB DEFAULT '{
        "symptomReminder": true,
        "newInsights": true,
        "reportsReady": true,
        "dailyTips": false
    }'::jsonb,
    alert_intensity VARCHAR(20) DEFAULT 'medium' CHECK (alert_intensity IN ('high', 'medium', 'low')),
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'pt-BR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Índices para user_preferences
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- TABELA: ai_insights
-- Insights gerados pela IA
-- ============================================
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL, -- 'pattern', 'recommendation', 'alert', etc
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    is_read BOOLEAN DEFAULT false,
    related_data JSONB, -- dados relacionados (sintomas, alimentos, etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- RLS para ai_insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
    ON ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
    ON ai_insights FOR UPDATE
    USING (auth.uid() = user_id);

-- Índices para ai_insights
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX idx_ai_insights_is_read ON ai_insights(is_read);
CREATE INDEX idx_ai_insights_created_at ON ai_insights(created_at);

-- ============================================
-- TABELA: notifications
-- Sistema de notificações
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- TRIGGER: Criar profile automaticamente
-- Quando um usuário se registra via Supabase Auth
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Criar preferências padrão
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- HABILITAR REALTIME
-- Para notificações e atualizações em tempo real
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================
-- Comentários nas tabelas
-- ============================================
COMMENT ON TABLE profiles IS 'Perfis de usuários estendendo auth.users';
COMMENT ON TABLE foods IS 'Catálogo de alimentos disponíveis';
COMMENT ON TABLE symptoms IS 'Registro de sintomas digestivos';
COMMENT ON TABLE food_logs IS 'Registro de alimentos consumidos';
COMMENT ON TABLE user_food_status IS 'Status de segurança de alimentos por usuário';
COMMENT ON TABLE reports IS 'Relatórios de análise gerados';
COMMENT ON TABLE conversations IS 'Conversas com o assistente AI';
COMMENT ON TABLE messages IS 'Mensagens das conversas';
COMMENT ON TABLE user_preferences IS 'Preferências e configurações do usuário';
COMMENT ON TABLE ai_insights IS 'Insights gerados pela IA';
COMMENT ON TABLE notifications IS 'Sistema de notificações';
