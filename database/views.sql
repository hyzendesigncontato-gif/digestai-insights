-- ============================================
-- DigestAI - Database Views
-- Views para consultas otimizadas
-- ============================================

-- ============================================
-- VIEW: v_user_symptoms_summary
-- Resumo de sintomas por usuário
-- ============================================
CREATE OR REPLACE VIEW v_user_symptoms_summary AS
SELECT 
    s.user_id,
    COUNT(*) as total_symptoms,
    ROUND(AVG(s.intensity), 1) as avg_intensity,
    MAX(s.intensity) as max_intensity,
    MIN(s.datetime) as first_symptom_date,
    MAX(s.datetime) as last_symptom_date,
    ARRAY_AGG(DISTINCT UNNEST(s.types)) as all_symptom_types,
    COUNT(*) FILTER (WHERE s.datetime >= CURRENT_TIMESTAMP - INTERVAL '7 days') as symptoms_last_7_days,
    COUNT(*) FILTER (WHERE s.datetime >= CURRENT_TIMESTAMP - INTERVAL '30 days') as symptoms_last_30_days
FROM symptoms s
GROUP BY s.user_id;

COMMENT ON VIEW v_user_symptoms_summary IS 'Resumo estatístico de sintomas por usuário';

-- ============================================
-- VIEW: v_food_consumption_stats
-- Estatísticas de consumo de alimentos
-- ============================================
CREATE OR REPLACE VIEW v_food_consumption_stats AS
SELECT 
    fl.user_id,
    f.id as food_id,
    f.name as food_name,
    f.category,
    COUNT(*) as consumption_count,
    COUNT(DISTINCT DATE(fl.datetime)) as days_consumed,
    ARRAY_AGG(DISTINCT fl.meal_type) as meal_types,
    MIN(fl.datetime) as first_consumed,
    MAX(fl.datetime) as last_consumed,
    COUNT(DISTINCT fl.symptom_id) FILTER (WHERE fl.symptom_id IS NOT NULL) as times_with_symptoms
FROM food_logs fl
INNER JOIN foods f ON f.id = fl.food_id
GROUP BY fl.user_id, f.id, f.name, f.category;

COMMENT ON VIEW v_food_consumption_stats IS 'Estatísticas de consumo de alimentos por usuário';

-- ============================================
-- VIEW: v_user_food_safety_overview
-- Visão geral de segurança alimentar
-- ============================================
CREATE OR REPLACE VIEW v_user_food_safety_overview AS
SELECT 
    ufs.user_id,
    COUNT(*) as total_foods_analyzed,
    COUNT(*) FILTER (WHERE ufs.status = 'safe') as safe_foods,
    COUNT(*) FILTER (WHERE ufs.status = 'moderate') as moderate_foods,
    COUNT(*) FILTER (WHERE ufs.status = 'avoid') as avoid_foods,
    ROUND(AVG(ufs.safety_score), 1) as avg_safety_score,
    ARRAY_AGG(f.name ORDER BY ufs.safety_score ASC) FILTER (WHERE ufs.status = 'avoid') as foods_to_avoid,
    ARRAY_AGG(f.name ORDER BY ufs.safety_score DESC) FILTER (WHERE ufs.status = 'safe') as safe_food_list
FROM user_food_status ufs
INNER JOIN foods f ON f.id = ufs.food_id
GROUP BY ufs.user_id;

COMMENT ON VIEW v_user_food_safety_overview IS 'Visão geral do status de segurança alimentar por usuário';

-- ============================================
-- VIEW: v_symptom_food_correlation
-- Correlação entre sintomas e alimentos
-- ============================================
CREATE OR REPLACE VIEW v_symptom_food_correlation AS
SELECT 
    s.user_id,
    f.id as food_id,
    f.name as food_name,
    f.category as food_category,
    UNNEST(f.common_allergens) as allergen,
    COUNT(DISTINCT s.id) as symptom_occurrences,
    ROUND(AVG(s.intensity), 1) as avg_symptom_intensity,
    ARRAY_AGG(DISTINCT UNNEST(s.types)) as symptom_types,
    MIN(s.datetime - fl.datetime) as min_time_to_symptom,
    MAX(s.datetime - fl.datetime) as max_time_to_symptom
FROM symptoms s
INNER JOIN food_logs fl ON fl.user_id = s.user_id
INNER JOIN foods f ON f.id = fl.food_id
WHERE s.datetime BETWEEN fl.datetime AND (fl.datetime + INTERVAL '6 hours')
    AND f.common_allergens IS NOT NULL
GROUP BY s.user_id, f.id, f.name, f.category, allergen
HAVING COUNT(DISTINCT s.id) >= 2;

COMMENT ON VIEW v_symptom_food_correlation IS 'Correlação entre alimentos consumidos e sintomas subsequentes';

-- ============================================
-- VIEW: v_user_activity_timeline
-- Timeline de atividades do usuário
-- ============================================
CREATE OR REPLACE VIEW v_user_activity_timeline AS
SELECT 
    user_id,
    'symptom' as activity_type,
    id as activity_id,
    datetime as activity_datetime,
    jsonb_build_object(
        'types', types,
        'intensity', intensity,
        'notes', notes
    ) as activity_data
FROM symptoms

UNION ALL

SELECT 
    user_id,
    'food_log' as activity_type,
    id as activity_id,
    datetime as activity_datetime,
    jsonb_build_object(
        'food_name', food_name,
        'meal_type', meal_type
    ) as activity_data
FROM food_logs

ORDER BY activity_datetime DESC;

COMMENT ON VIEW v_user_activity_timeline IS 'Timeline unificada de todas as atividades do usuário';

-- ============================================
-- VIEW: v_weekly_symptom_trends
-- Tendências semanais de sintomas
-- ============================================
CREATE OR REPLACE VIEW v_weekly_symptom_trends AS
SELECT 
    user_id,
    DATE_TRUNC('week', datetime) as week_start,
    COUNT(*) as symptom_count,
    ROUND(AVG(intensity), 1) as avg_intensity,
    ARRAY_AGG(DISTINCT UNNEST(types)) as symptom_types,
    COUNT(DISTINCT DATE(datetime)) as days_with_symptoms
FROM symptoms
WHERE datetime >= CURRENT_TIMESTAMP - INTERVAL '12 weeks'
GROUP BY user_id, DATE_TRUNC('week', datetime)
ORDER BY user_id, week_start DESC;

COMMENT ON VIEW v_weekly_symptom_trends IS 'Tendências semanais de sintomas para análise de evolução';

-- ============================================
-- VIEW: v_meal_type_analysis
-- Análise por tipo de refeição
-- ============================================
CREATE OR REPLACE VIEW v_meal_type_analysis AS
SELECT 
    fl.user_id,
    fl.meal_type,
    COUNT(DISTINCT fl.id) as total_meals,
    COUNT(DISTINCT s.id) as meals_with_symptoms,
    ROUND(
        (COUNT(DISTINCT s.id)::DECIMAL / NULLIF(COUNT(DISTINCT fl.id), 0) * 100),
        1
    ) as symptom_rate_percentage,
    ROUND(AVG(s.intensity) FILTER (WHERE s.id IS NOT NULL), 1) as avg_symptom_intensity,
    ARRAY_AGG(DISTINCT f.category) as food_categories_consumed
FROM food_logs fl
LEFT JOIN symptoms s ON s.user_id = fl.user_id 
    AND s.datetime BETWEEN fl.datetime AND (fl.datetime + INTERVAL '4 hours')
LEFT JOIN foods f ON f.id = fl.food_id
GROUP BY fl.user_id, fl.meal_type;

COMMENT ON VIEW v_meal_type_analysis IS 'Análise de sintomas por tipo de refeição';

-- ============================================
-- VIEW: v_allergen_exposure
-- Exposição a alérgenos por usuário
-- ============================================
CREATE OR REPLACE VIEW v_allergen_exposure AS
SELECT 
    fl.user_id,
    UNNEST(f.common_allergens) as allergen,
    COUNT(*) as exposure_count,
    COUNT(DISTINCT DATE(fl.datetime)) as days_exposed,
    ARRAY_AGG(DISTINCT f.name) as foods_containing_allergen,
    MAX(fl.datetime) as last_exposure,
    COUNT(DISTINCT s.id) as symptoms_after_exposure,
    ROUND(AVG(s.intensity) FILTER (WHERE s.id IS NOT NULL), 1) as avg_symptom_intensity
FROM food_logs fl
INNER JOIN foods f ON f.id = fl.food_id
LEFT JOIN symptoms s ON s.user_id = fl.user_id 
    AND s.datetime BETWEEN fl.datetime AND (fl.datetime + INTERVAL '4 hours')
WHERE f.common_allergens IS NOT NULL
GROUP BY fl.user_id, allergen;

COMMENT ON VIEW v_allergen_exposure IS 'Rastreamento de exposição a alérgenos e sintomas relacionados';

-- ============================================
-- VIEW: v_user_reports_summary
-- Resumo de relatórios por usuário
-- ============================================
CREATE OR REPLACE VIEW v_user_reports_summary AS
SELECT 
    r.user_id,
    COUNT(*) as total_reports,
    MAX(r.created_at) as last_report_date,
    ROUND(AVG(r.risk_score), 1) as avg_risk_score,
    MAX(r.risk_score) as max_risk_score,
    MIN(r.risk_score) as min_risk_score,
    jsonb_agg(
        jsonb_build_object(
            'id', r.id,
            'period_start', r.period_start,
            'period_end', r.period_end,
            'risk_score', r.risk_score,
            'created_at', r.created_at
        ) ORDER BY r.created_at DESC
    ) as recent_reports
FROM reports r
GROUP BY r.user_id;

COMMENT ON VIEW v_user_reports_summary IS 'Resumo histórico de relatórios por usuário';

-- ============================================
-- VIEW: v_unread_notifications_count
-- Contagem de notificações não lidas
-- ============================================
CREATE OR REPLACE VIEW v_unread_notifications_count AS
SELECT 
    user_id,
    COUNT(*) as unread_count,
    COUNT(*) FILTER (WHERE type = 'insight') as unread_insights,
    COUNT(*) FILTER (WHERE type = 'report') as unread_reports,
    COUNT(*) FILTER (WHERE type = 'alert') as unread_alerts,
    MAX(created_at) as latest_notification_date
FROM notifications
WHERE is_read = false
GROUP BY user_id;

COMMENT ON VIEW v_unread_notifications_count IS 'Contagem de notificações não lidas por tipo';

-- ============================================
-- VIEW: v_conversation_summary
-- Resumo de conversas com IA
-- ============================================
CREATE OR REPLACE VIEW v_conversation_summary AS
SELECT 
    c.user_id,
    c.id as conversation_id,
    c.title,
    COUNT(m.id) as message_count,
    COUNT(m.id) FILTER (WHERE m.role = 'user') as user_messages,
    COUNT(m.id) FILTER (WHERE m.role = 'assistant') as assistant_messages,
    MIN(m.created_at) as first_message_at,
    MAX(m.created_at) as last_message_at,
    c.created_at as conversation_created_at
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.user_id, c.id, c.title, c.created_at;

COMMENT ON VIEW v_conversation_summary IS 'Resumo de conversas e mensagens trocadas';

-- ============================================
-- VIEW: v_daily_symptom_intensity
-- Intensidade diária de sintomas
-- ============================================
CREATE OR REPLACE VIEW v_daily_symptom_intensity AS
SELECT 
    user_id,
    DATE(datetime) as symptom_date,
    COUNT(*) as symptom_count,
    ROUND(AVG(intensity), 1) as avg_intensity,
    MAX(intensity) as max_intensity,
    ARRAY_AGG(DISTINCT UNNEST(types)) as symptom_types,
    EXTRACT(DOW FROM datetime)::INTEGER as day_of_week,
    TO_CHAR(datetime, 'Day') as day_name
FROM symptoms
WHERE datetime >= CURRENT_TIMESTAMP - INTERVAL '90 days'
GROUP BY user_id, DATE(datetime), EXTRACT(DOW FROM datetime), TO_CHAR(datetime, 'Day')
ORDER BY user_id, symptom_date DESC;

COMMENT ON VIEW v_daily_symptom_intensity IS 'Intensidade e frequência de sintomas por dia';

-- ============================================
-- VIEW: v_food_category_tolerance
-- Tolerância por categoria de alimento
-- ============================================
CREATE OR REPLACE VIEW v_food_category_tolerance AS
SELECT 
    ufs.user_id,
    f.category,
    COUNT(*) as foods_in_category,
    COUNT(*) FILTER (WHERE ufs.status = 'safe') as safe_count,
    COUNT(*) FILTER (WHERE ufs.status = 'moderate') as moderate_count,
    COUNT(*) FILTER (WHERE ufs.status = 'avoid') as avoid_count,
    ROUND(AVG(ufs.safety_score), 1) as avg_safety_score,
    ROUND(
        (COUNT(*) FILTER (WHERE ufs.status = 'safe')::DECIMAL / COUNT(*)::DECIMAL * 100),
        1
    ) as safe_percentage
FROM user_food_status ufs
INNER JOIN foods f ON f.id = ufs.food_id
GROUP BY ufs.user_id, f.category
ORDER BY ufs.user_id, avg_safety_score DESC;

COMMENT ON VIEW v_food_category_tolerance IS 'Análise de tolerância por categoria de alimento';

-- ============================================
-- Mensagem de conclusão
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Views criadas com sucesso!';
    RAISE NOTICE '📊 Total de views: 14';
END $$;
