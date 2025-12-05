-- ============================================
-- DigestAI - Food Analysis Functions
-- Cria funções para analisar correlação entre alimentos e sintomas
-- ============================================

-- ============================================
-- Função para calcular score de segurança de um alimento
-- ============================================
CREATE OR REPLACE FUNCTION calculate_food_safety_score(
    p_user_id UUID,
    p_food_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_logs INTEGER;
    v_logs_with_symptoms INTEGER;
    v_avg_symptom_intensity DECIMAL;
    v_safety_score INTEGER;
BEGIN
    -- Conta total de vezes que o alimento foi consumido
    SELECT COUNT(*)
    INTO v_total_logs
    FROM food_logs
    WHERE user_id = p_user_id
        AND food_id = p_food_id;
    
    -- Se nunca foi consumido, retorna score neutro
    IF v_total_logs = 0 THEN
        RETURN 50;
    END IF;
    
    -- Conta quantas vezes teve sintomas nas próximas 4 horas após consumir
    SELECT 
        COUNT(DISTINCT fl.id),
        COALESCE(AVG(s.intensity), 0)
    INTO v_logs_with_symptoms, v_avg_symptom_intensity
    FROM food_logs fl
    LEFT JOIN symptoms s ON s.user_id = fl.user_id
        AND s.datetime BETWEEN fl.datetime AND (fl.datetime + INTERVAL '4 hours')
    WHERE fl.user_id = p_user_id
        AND fl.food_id = p_food_id
        AND s.id IS NOT NULL;
    
    -- Calcula o score (0-100)
    -- Score alto = seguro, score baixo = evitar
    v_safety_score := 100 - (
        (v_logs_with_symptoms::DECIMAL / v_total_logs * 50) + 
        (v_avg_symptom_intensity * 5)
    )::INTEGER;
    
    -- Garante que está entre 0 e 100
    v_safety_score := GREATEST(0, LEAST(100, v_safety_score));
    
    RETURN v_safety_score;
END;
$$;

-- ============================================
-- Função para determinar status do alimento
-- ============================================
CREATE OR REPLACE FUNCTION get_food_status(p_safety_score INTEGER)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_safety_score >= 70 THEN
        RETURN 'safe';
    ELSIF p_safety_score >= 40 THEN
        RETURN 'moderate';
    ELSE
        RETURN 'avoid';
    END IF;
END;
$$;

-- ============================================
-- Função para gerar notas da IA sobre o alimento
-- ============================================
CREATE OR REPLACE FUNCTION generate_food_ai_notes(
    p_user_id UUID,
    p_food_id UUID,
    p_safety_score INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_food_name TEXT;
    v_symptom_count INTEGER;
    v_common_symptoms TEXT;
BEGIN
    -- Busca nome do alimento
    SELECT name INTO v_food_name FROM foods WHERE id = p_food_id;
    
    -- Conta sintomas relacionados
    SELECT COUNT(DISTINCT s.id)
    INTO v_symptom_count
    FROM food_logs fl
    INNER JOIN symptoms s ON s.user_id = fl.user_id
        AND s.datetime BETWEEN fl.datetime AND (fl.datetime + INTERVAL '4 hours')
    WHERE fl.user_id = p_user_id
        AND fl.food_id = p_food_id;
    
    -- Gera nota baseada no score
    IF p_safety_score >= 70 THEN
        RETURN format('Você tolera bem %s. Nenhum sintoma significativo foi registrado após o consumo.', v_food_name);
    ELSIF p_safety_score >= 40 THEN
        RETURN format('Consumir %s com moderação. Foram registrados %s sintoma(s) após o consumo.', v_food_name, v_symptom_count);
    ELSE
        RETURN format('Evite %s. Forte correlação com sintomas (%s ocorrência(s) registradas).', v_food_name, v_symptom_count);
    END IF;
END;
$$;

-- ============================================
-- Função principal para atualizar status de todos os alimentos
-- ============================================
CREATE OR REPLACE FUNCTION update_user_food_status_scores(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID;
    v_food RECORD;
    v_safety_score INTEGER;
    v_status VARCHAR(20);
    v_ai_notes TEXT;
    v_updated_count INTEGER := 0;
BEGIN
    -- Se não passou user_id, usa o usuário autenticado
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Para cada alimento que o usuário já consumiu
    FOR v_food IN 
        SELECT DISTINCT f.id, f.name
        FROM foods f
        INNER JOIN food_logs fl ON fl.food_id = f.id
        WHERE fl.user_id = v_user_id
    LOOP
        -- Calcula o score de segurança
        v_safety_score := calculate_food_safety_score(v_user_id, v_food.id);
        
        -- Determina o status
        v_status := get_food_status(v_safety_score);
        
        -- Gera notas da IA
        v_ai_notes := generate_food_ai_notes(v_user_id, v_food.id, v_safety_score);
        
        -- Insere ou atualiza o status
        INSERT INTO user_food_status (
            user_id,
            food_id,
            status,
            safety_score,
            ai_notes,
            updated_at
        ) VALUES (
            v_user_id,
            v_food.id,
            v_status,
            v_safety_score,
            v_ai_notes,
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, food_id)
        DO UPDATE SET
            status = EXCLUDED.status,
            safety_score = EXCLUDED.safety_score,
            ai_notes = EXCLUDED.ai_notes,
            updated_at = CURRENT_TIMESTAMP;
        
        v_updated_count := v_updated_count + 1;
    END LOOP;
    
    RETURN v_updated_count;
END;
$$;

-- ============================================
-- Trigger para atualizar scores automaticamente
-- quando novos sintomas ou alimentos são registrados
-- ============================================

-- Função do trigger
CREATE OR REPLACE FUNCTION trigger_update_food_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Atualiza os scores do usuário em background
    PERFORM update_user_food_status_scores(NEW.user_id);
    RETURN NEW;
END;
$$;

-- Remove triggers antigos se existirem
DROP TRIGGER IF EXISTS update_food_scores_on_symptom ON symptoms;
DROP TRIGGER IF EXISTS update_food_scores_on_food_log ON food_logs;

-- Trigger quando um sintoma é registrado
CREATE TRIGGER update_food_scores_on_symptom
    AFTER INSERT ON symptoms
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_food_scores();

-- Trigger quando um alimento é registrado
CREATE TRIGGER update_food_scores_on_food_log
    AFTER INSERT ON food_logs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_food_scores();

-- ============================================
-- Atualiza scores de todos os usuários existentes
-- ============================================
DO $$
DECLARE
    v_user RECORD;
    v_count INTEGER;
BEGIN
    FOR v_user IN SELECT DISTINCT user_id FROM food_logs
    LOOP
        v_count := update_user_food_status_scores(v_user.user_id);
        RAISE NOTICE 'Atualizados % alimentos para usuário %', v_count, v_user.user_id;
    END LOOP;
END $$;

-- ============================================
-- Mensagem de sucesso
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Sistema de análise de alimentos configurado!';
    RAISE NOTICE 'Os scores serão atualizados automaticamente quando você registrar sintomas ou alimentos.';
END $$;
