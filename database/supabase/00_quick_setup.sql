-- ============================================
-- DigestAI - Setup Rápido
-- Execute APENAS este script para começar
-- ============================================

-- Este script faz tudo de uma vez:
-- 1. Cria as tabelas essenciais
-- 2. Configura RLS
-- 3. Adiciona alimentos
-- 4. NÃO cria usuário (use o Supabase Auth Dashboard)

-- ============================================
-- TABELA: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    birth_date DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
    weight DECIMAL(5,2),
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- TABELA: foods
-- ============================================
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    common_allergens TEXT[],
    image_url TEXT,
    nutritional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view foods" ON foods FOR SELECT TO authenticated USING (true);

-- ============================================
-- TABELA: symptoms
-- ============================================
CREATE TABLE IF NOT EXISTS symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    types TEXT[] NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    duration VARCHAR(100),
    pain_location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptoms" ON symptoms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptoms" ON symptoms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own symptoms" ON symptoms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own symptoms" ON symptoms FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TABELA: food_logs
-- ============================================
CREATE TABLE IF NOT EXISTS food_logs (
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

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food logs" ON food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food logs" ON food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food logs" ON food_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food logs" ON food_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TABELA: user_food_status
-- ============================================
CREATE TABLE IF NOT EXISTS user_food_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('safe', 'moderate', 'avoid')),
    safety_score INTEGER NOT NULL CHECK (safety_score >= 0 AND safety_score <= 100),
    ai_notes TEXT,
    correlation_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, food_id)
);

ALTER TABLE user_food_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food status" ON user_food_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food status" ON user_food_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food status" ON user_food_status FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TABELA: conversations
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TABELA: messages
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own conversations" ON messages FOR SELECT
USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));

CREATE POLICY "Users can insert messages in own conversations" ON messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));

-- ============================================
-- TABELA: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Criar profile automaticamente
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
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED: Alimentos básicos
-- ============================================
INSERT INTO foods (name, category, common_allergens) VALUES
('Leite Integral', 'Laticínios', ARRAY['lactose']),
('Queijo Mussarela', 'Laticínios', ARRAY['lactose']),
('Iogurte Natural', 'Laticínios', ARRAY['lactose']),
('Pão de Forma Integral', 'Grãos', ARRAY['gluten']),
('Macarrão', 'Grãos', ARRAY['gluten']),
('Arroz Branco', 'Grãos', NULL),
('Arroz Integral', 'Grãos', NULL),
('Feijão Preto', 'Leguminosas', NULL),
('Feijão Carioca', 'Leguminosas', NULL),
('Frango Grelhado', 'Proteínas', NULL),
('Peixe (Tilápia)', 'Proteínas', NULL),
('Ovo Cozido', 'Proteínas', NULL),
('Banana', 'Frutas', NULL),
('Maçã', 'Frutas', ARRAY['fodmap']),
('Laranja', 'Frutas', NULL),
('Alface', 'Vegetais', NULL),
('Tomate', 'Vegetais', NULL),
('Cenoura', 'Vegetais', NULL),
('Brócolis', 'Vegetais', NULL),
('Cebola', 'Vegetais', ARRAY['fodmap']),
('Alho', 'Vegetais', ARRAY['fodmap']),
('Batata', 'Vegetais', NULL),
('Batata Doce', 'Vegetais', NULL),
('Café', 'Bebidas', NULL),
('Chá Verde', 'Bebidas', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Mensagem de sucesso
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Setup concluído com sucesso!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '1. Vá em Authentication → Users';
    RAISE NOTICE '2. Clique em "Add User"';
    RAISE NOTICE '3. Crie um usuário com email e senha';
    RAISE NOTICE '4. Use essas credenciais para fazer login no app';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tabelas criadas: profiles, foods, symptoms, food_logs, etc';
    RAISE NOTICE '✅ RLS habilitado em todas as tabelas';
    RAISE NOTICE '✅ 25 alimentos adicionados';
    RAISE NOTICE '✅ Trigger para criar profile automaticamente';
END $$;
