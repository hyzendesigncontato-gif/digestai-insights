-- ============================================
-- DigestAI - Fix User Preferences Table
-- Cria/corrige a tabela user_preferences e suas políticas RLS
-- ============================================

-- ============================================
-- Cria a tabela se não existir
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================
-- Habilita RLS
-- ============================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Remove políticas antigas se existirem
-- ============================================
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;

-- ============================================
-- Políticas RLS
-- ============================================

-- Usuários podem ver suas próprias preferências
CREATE POLICY "Users can view own preferences"
    ON user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias preferências
CREATE POLICY "Users can insert own preferences"
    ON user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias preferências
CREATE POLICY "Users can update own preferences"
    ON user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar suas próprias preferências
CREATE POLICY "Users can delete own preferences"
    ON user_preferences
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Função para atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Trigger para atualizar updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_user_preferences_updated_at_trigger ON user_preferences;

CREATE TRIGGER update_user_preferences_updated_at_trigger
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- ============================================
-- Mensagem de sucesso
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Tabela user_preferences configurada com sucesso!';
    RAISE NOTICE 'Agora você pode salvar suas preferências.';
END $$;
