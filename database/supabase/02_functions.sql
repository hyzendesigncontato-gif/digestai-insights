-- ============================================
-- DigestAI - Supabase Functions & Triggers
-- Funções adaptadas para Supabase com RLS
-- ============================================

-- ============================================
-- FUNÇÃO: update_updated_at_column
-- Atualiza automaticamente o campo updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at
    BEFORE UPDATE ON foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptoms_updated_at
    BEFORE UPDATE ON symptoms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_food_status_updated_at
    BEFORE UPDATE ON user_food_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: get_user_symptoms_by_period
-- Retorna sintomas de um usuário em um período
-- SECURITY DEFINER para permitir acesso via RPC
-- ============================================
CREATE OR REPLACE FUNCTION get_user_symptoms_by_period(
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    id UUID,
    types TEXT[],
    intensity INTEGER,
    datetime TIMESTAMP WITH TIME ZONE,
    duration VARCHAR,
    pain_location VARCHAR,
    notes TEXT,
    foods_consumed JSONB
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.types,
        s.intensity,
        s.datetime,
        s.duration,
        s.pain_location,
        s.notes,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', fl.id,
                    'food_name', fl.food_name,
                    'meal_type', fl.meal_type,
                    'datetime', fl.datetime
                )
            ) FILTER (WHERE fl.id IS NOT NULL),
            '[]'::jsonb
        ) as foods_consumed
    FROM symptoms s
    LEFT JOIN food_logs fl ON fl.symptom_id = s.id
    WHERE s.user_id = auth.uid()
        AND s.datetime BETWEEN p_start_date AND p_end_date
    GROUP BY s.id, s.types, s.intensity, s.datetime, s.duration, s.pain_location, s.notes
    ORDER BY s.datetime DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: calculate_food_safety_score
-- Calcula o score de segurança de um alimento
-- ============================================
CREATE OR REPLACE FUNCTION calculate_food_safety_score(
    p_food_id UUID
)
RETURNS INTEGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_logs INTEGER;
    v_symptoms_after_food INTEGER;
    v_avg_intensity DECIMAL;
    v_safety_score INTEGER;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Conta quantas vezes o alimento foi consumido
    SELECT COUNT(*) INTO v_total_logs
    FROM food_logs
    WHERE user_id = v_user_id AND food_id = p_food_id;
    
    -- Se não há registros, retorna score neutro
    IF v_total_logs = 0 THEN
        RETURN 50;
    END IF;
    
    -- Conta sintomas que ocorreram até 4 horas após consumo
    SELECT 
        COUNT(DISTINCT s.id),
        COALESCE(AVG(s.intensity), 0)
    INTO v_symptoms_after_food, v_avg_intensity
    FROM food_logs fl
    INNER JOIN symptoms s ON s.user_id = fl.user_id
    WHERE fl.user_id = v_user_id 
        AND fl.food_id = p_food_id
        AND s.datetime BETWEEN fl.datetime AND (fl.datetime + INTERVAL '4 hours');
    
    -- Calcula o score (100 = muito seguro, 0 = evitar)
    v_safety_score := 100 - (
        (v_symptoms_after_food::DECIMAL / v_total_logs::DECIMAL * 50) +
        (v_avg_intensity * 5)
    )::INTEGER;
    
    -- Garante que está entre 0 e 100
    v_safety_score := GREATEST(0, LEAST(100, v_safety_score));
    
    RETURN v_safety_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: update_user_food_status_scores
-- Atualiza scores de todos os alimentos do usuário
-- ============================================
CREATE OR REPLACE FUNCTION update_user_food_status_scores()
RETURNS INTEGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_food RECORD;
    v_score INTEGER;
    v_status VARCHAR(20);
    v_updated_count INTEGER := 0;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    FOR v_food IN 
        SELECT DISTINCT f.id, f.name
        FROM foods f
        INNER JOIN food_logs fl ON fl.food_id = f.id
        WHERE fl.user_id = v_user_id
    LOOP
        -- Calcula o score
        v_score := calculate_food_safety_score(v_food.id);
        
        -- Define o status baseado no score
        IF v_score >= 70 THEN
            v_status := 'safe';
        ELSIF v_score >= 40 THEN
            v_status := 'moderate';
        ELSE
            v_status := 'avoid';
        END IF;
        
        -- Insere ou atualiza o status
        INSERT INTO user_food_status (user_id, food_id, status, safety_score)
        VALUES (v_user_id, v_food.id, v_status, v_score)
        ON CONFLICT (user_id, food_id) 
        DO UPDATE SET 
            status = v_status,
            safety_score = v_score,
            updated_at = CURRENT_TIMESTAMP;
        
        v_updated_count := v_updated_count + 1;
    END LOOP;
    
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: get_intolerance_analysis
-- Analisa possíveis intolerâncias do usuário
-- ============================================
CREATE OR REPLACE FUNCTION get_intolerance_analysis(
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    allergen_type TEXT,
    probability INTEGER,
    symptom_count INTEGER,
    avg_intensity DECIMAL,
    correlated_foods TEXT[],
    correlated_symptoms TEXT[]
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    RETURN QUERY
    WITH symptom_food_correlation AS (
        SELECT 
            UNNEST(f.common_allergens) as allergen,
            s.id as symptom_id,
            s.types as symptom_types,
            s.intensity,
            f.name as food_name
        FROM symptoms s
        INNER JOIN food_logs fl ON fl.user_id = s.user_id
        INNER JOIN foods f ON f.id = fl.food_id
        WHERE s.user_id = v_user_id
            AND s.datetime >= CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL
            AND s.datetime BETWEEN fl.datetime AND (fl.datetime + INTERVAL '4 hours')
            AND f.common_allergens IS NOT NULL
    )
    SELECT 
        sfc.allergen as allergen_type,
        LEAST(100, (
            (COUNT(DISTINCT sfc.symptom_id)::DECIMAL / 
             NULLIF(COUNT(DISTINCT fl.id), 0)::DECIMAL * 100) +
            (AVG(sfc.intensity) * 8)
        ))::INTEGER as probability,
        COUNT(DISTINCT sfc.symptom_id)::INTEGER as symptom_count,
        ROUND(AVG(sfc.intensity), 1) as avg_intensity,
        ARRAY_AGG(DISTINCT sfc.food_name) as correlated_foods,
        ARRAY_AGG(DISTINCT UNNEST(sfc.symptom_types)) as correlated_symptoms
    FROM symptom_food_correlation sfc
    LEFT JOIN food_logs fl ON fl.user_id = v_user_id 
        AND fl.datetime >= CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL
    GROUP BY sfc.allergen
    HAVING COUNT(DISTINCT sfc.symptom_id) >= 2
    ORDER BY probability DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: generate_user_report
-- Gera um relatório completo para o usuário
-- ============================================
CREATE OR REPLACE FUNCTION generate_user_report(
    p_period_days INTEGER DEFAULT 30
)
RETURNS UUID 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_report_id UUID;
    v_period_start DATE;
    v_period_end DATE;
    v_risk_score INTEGER;
    v_symptom_count INTEGER;
    v_avg_intensity DECIMAL;
    v_intolerances JSONB;
    v_summary TEXT;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    v_period_end := CURRENT_DATE;
    v_period_start := CURRENT_DATE - p_period_days;
    
    -- Calcula métricas básicas
    SELECT 
        COUNT(*),
        COALESCE(AVG(intensity), 0)
    INTO v_symptom_count, v_avg_intensity
    FROM symptoms
    WHERE user_id = v_user_id
        AND datetime >= v_period_start
        AND datetime <= v_period_end;
    
    -- Calcula risk score
    v_risk_score := LEAST(100, (
        (v_symptom_count * 2) + 
        (v_avg_intensity * 8)
    ))::INTEGER;
    
    -- Obtém análise de intolerâncias
    SELECT jsonb_agg(
        jsonb_build_object(
            'type', allergen_type,
            'probability', probability,
            'correlatedSymptoms', correlated_symptoms,
            'correlatedFoods', correlated_foods
        )
    )
    INTO v_intolerances
    FROM get_intolerance_analysis(p_period_days);
    
    -- Gera resumo
    v_summary := format(
        'Análise do período de %s a %s. Total de %s sintomas registrados com intensidade média de %s/10.',
        v_period_start, v_period_end, v_symptom_count, ROUND(v_avg_intensity, 1)
    );
    
    -- Insere o relatório
    INSERT INTO reports (
        user_id,
        period_start,
        period_end,
        risk_score,
        summary,
        intolerances
    ) VALUES (
        v_user_id,
        v_period_start,
        v_period_end,
        v_risk_score,
        v_summary,
        COALESCE(v_intolerances, '[]'::jsonb)
    )
    RETURNING id INTO v_report_id;
    
    -- Cria notificação
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
        v_user_id,
        'report',
        'Novo relatório disponível',
        'Seu relatório de análise está pronto! Confira as recomendações personalizadas.'
    );
    
    RETURN v_report_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: get_user_dashboard_stats
-- Retorna estatísticas para o dashboard
-- ============================================
CREATE OR REPLACE FUNCTION get_user_dashboard_stats()
RETURNS JSONB 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stats JSONB;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    SELECT jsonb_build_object(
        'totalSymptoms', (
            SELECT COUNT(*) 
            FROM symptoms 
            WHERE user_id = v_user_id 
                AND datetime >= CURRENT_TIMESTAMP - INTERVAL '7 days'
        ),
        'avgIntensity', (
            SELECT COALESCE(ROUND(AVG(intensity), 1), 0)
            FROM symptoms 
            WHERE user_id = v_user_id 
                AND datetime >= CURRENT_TIMESTAMP - INTERVAL '7 days'
        ),
        'safeFoods', (
            SELECT COUNT(*) 
            FROM user_food_status 
            WHERE user_id = v_user_id AND status = 'safe'
        ),
        'avoidFoods', (
            SELECT COUNT(*) 
            FROM user_food_status 
            WHERE user_id = v_user_id AND status = 'avoid'
        ),
        'moderateFoods', (
            SELECT COUNT(*) 
            FROM user_food_status 
            WHERE user_id = v_user_id AND status = 'moderate'
        ),
        'latestReport', (
            SELECT jsonb_build_object(
                'id', id,
                'riskScore', risk_score,
                'createdAt', created_at,
                'summary', summary
            )
            FROM reports 
            WHERE user_id = v_user_id 
            ORDER BY created_at DESC 
            LIMIT 1
        ),
        'unreadInsights', (
            SELECT COUNT(*) 
            FROM ai_insights 
            WHERE user_id = v_user_id AND is_read = false
        ),
        'unreadNotifications', (
            SELECT COUNT(*) 
            FROM notifications 
            WHERE user_id = v_user_id AND is_read = false
        )
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: create_ai_insight
-- Cria um novo insight da IA
-- ============================================
CREATE OR REPLACE FUNCTION create_ai_insight(
    p_insight_type VARCHAR,
    p_title VARCHAR,
    p_content TEXT,
    p_priority VARCHAR DEFAULT 'medium',
    p_related_data JSONB DEFAULT NULL
)
RETURNS UUID 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_insight_id UUID;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    INSERT INTO ai_insights (
        user_id,
        insight_type,
        title,
        content,
        priority,
        related_data,
        expires_at
    ) VALUES (
        v_user_id,
        p_insight_type,
        p_title,
        p_content,
        p_priority,
        p_related_data,
        CURRENT_TIMESTAMP + INTERVAL '30 days'
    )
    RETURNING id INTO v_insight_id;
    
    -- Cria notificação se for alta prioridade
    IF p_priority = 'high' THEN
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (v_user_id, 'insight', p_title, p_content);
    END IF;
    
    RETURN v_insight_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: get_food_recommendations
-- Retorna recomendações de alimentos seguros
-- ============================================
CREATE OR REPLACE FUNCTION get_food_recommendations(
    p_meal_type VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    food_id UUID,
    food_name VARCHAR,
    category VARCHAR,
    safety_score INTEGER,
    status VARCHAR,
    ai_notes TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.category,
        ufs.safety_score,
        ufs.status,
        ufs.ai_notes
    FROM user_food_status ufs
    INNER JOIN foods f ON f.id = ufs.food_id
    WHERE ufs.user_id = v_user_id
        AND ufs.status IN ('safe', 'moderate')
    ORDER BY ufs.safety_score DESC, f.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: search_foods
-- Busca alimentos por nome ou categoria
-- ============================================
CREATE OR REPLACE FUNCTION search_foods(
    p_search_term VARCHAR,
    p_category VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    category VARCHAR,
    common_allergens TEXT[],
    image_url TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.name,
        f.category,
        f.common_allergens,
        f.image_url
    FROM foods f
    WHERE (
        p_search_term IS NULL OR
        f.name ILIKE '%' || p_search_term || '%'
    )
    AND (
        p_category IS NULL OR
        f.category = p_category
    )
    ORDER BY f.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO: get_symptom_patterns
-- Identifica padrões nos sintomas
-- ============================================
CREATE OR REPLACE FUNCTION get_symptom_patterns(
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    pattern_type VARCHAR,
    description TEXT,
    frequency INTEGER,
    avg_intensity DECIMAL
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    RETURN QUERY
    -- Padrão por horário do dia
    SELECT 
        'time_of_day'::VARCHAR as pattern_type,
        CASE 
            WHEN EXTRACT(HOUR FROM datetime) < 12 THEN 'Manhã (antes do meio-dia)'
            WHEN EXTRACT(HOUR FROM datetime) < 18 THEN 'Tarde (12h-18h)'
            ELSE 'Noite (após 18h)'
        END as description,
        COUNT(*)::INTEGER as frequency,
        ROUND(AVG(intensity), 1) as avg_intensity
    FROM symptoms
    WHERE user_id = v_user_id
        AND datetime >= CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL
    GROUP BY description
    HAVING COUNT(*) >= 2
    
    UNION ALL
    
    -- Padrão por dia da semana
    SELECT 
        'day_of_week'::VARCHAR,
        TO_CHAR(datetime, 'Day') as description,
        COUNT(*)::INTEGER,
        ROUND(AVG(intensity), 1)
    FROM symptoms
    WHERE user_id = v_user_id
        AND datetime >= CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL
    GROUP BY description
    HAVING COUNT(*) >= 2
    
    ORDER BY frequency DESC;
END;
$$ LANGUAGE plpgsql;
