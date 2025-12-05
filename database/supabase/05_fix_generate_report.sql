-- ============================================
-- DigestAI - Fix Generate Report Function
-- Corrige o erro "aggregate function calls cannot contain set-returning functions"
-- ============================================

-- ============================================
-- DROP das funções antigas
-- ============================================
DROP FUNCTION IF EXISTS get_intolerance_analysis(integer) CASCADE;
DROP FUNCTION IF EXISTS generate_user_report(integer) CASCADE;

-- ============================================
-- FUNÇÃO CORRIGIDA: get_intolerance_analysis
-- Usa CTEs para expandir arrays antes de agregar
-- ============================================
CREATE OR REPLACE FUNCTION get_intolerance_analysis(
    p_days INTEGER DEFAULT 30
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    v_user_id := auth.uid();
    
    -- Usa CTEs para expandir arrays antes de agregar
    WITH expanded_data AS (
        SELECT 
            allergen,
            s.id as symptom_id,
            s.intensity,
            f.name as food_name,
            symptom_type
        FROM symptoms s
        INNER JOIN food_logs fl ON fl.user_id = s.user_id
        INNER JOIN foods f ON f.id = fl.food_id
        CROSS JOIN LATERAL UNNEST(f.common_allergens) AS allergen
        CROSS JOIN LATERAL UNNEST(s.types) AS symptom_type
        WHERE s.user_id = v_user_id
            AND s.datetime >= CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL
            AND s.datetime BETWEEN fl.datetime AND (fl.datetime + INTERVAL '4 hours')
            AND f.common_allergens IS NOT NULL
    ),
    aggregated_data AS (
        SELECT 
            allergen,
            COUNT(DISTINCT symptom_id) as symptom_count,
            AVG(intensity) as avg_intensity,
            ARRAY_AGG(DISTINCT food_name) as foods,
            ARRAY_AGG(DISTINCT symptom_type) as symptoms
        FROM expanded_data
        GROUP BY allergen
        HAVING COUNT(DISTINCT symptom_id) >= 1
    )
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'type', allergen,
            'probability', LEAST(100, (symptom_count * 20 + avg_intensity::INTEGER * 5)),
            'symptomCount', symptom_count,
            'avgIntensity', ROUND(avg_intensity, 1),
            'correlatedFoods', foods,
            'correlatedSymptoms', symptoms
        )
    ), '[]'::jsonb)
    INTO v_result
    FROM aggregated_data;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNÇÃO CORRIGIDA: generate_user_report
-- Adaptada para usar a nova get_intolerance_analysis
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
    
    -- Obtém análise de intolerâncias (agora retorna JSONB)
    v_intolerances := get_intolerance_analysis(p_period_days);
    
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
        v_intolerances
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
-- Mensagem de sucesso
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Funções corrigidas com sucesso!';
    RAISE NOTICE 'Agora você pode gerar relatórios sem erros.';
END $$;
