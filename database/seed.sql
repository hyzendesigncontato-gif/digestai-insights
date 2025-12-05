-- ============================================
-- DigestAI - Seed Data
-- Dados iniciais para desenvolvimento e testes
-- ============================================

-- ============================================
-- SEED: foods
-- Catálogo inicial de alimentos
-- ============================================
INSERT INTO foods (name, category, common_allergens, nutritional_info) VALUES
-- Laticínios
('Leite Integral', 'Laticínios', ARRAY['lactose'], '{"calories": 61, "protein": 3.2, "carbs": 4.8, "fat": 3.3}'::jsonb),
('Queijo Mussarela', 'Laticínios', ARRAY['lactose'], '{"calories": 280, "protein": 22, "carbs": 3, "fat": 21}'::jsonb),
('Iogurte Natural', 'Laticínios', ARRAY['lactose'], '{"calories": 61, "protein": 3.5, "carbs": 4.7, "fat": 3.3}'::jsonb),
('Queijo Parmesão', 'Laticínios', ARRAY['lactose'], '{"calories": 431, "protein": 38, "carbs": 4, "fat": 29}'::jsonb),
('Manteiga', 'Laticínios', ARRAY['lactose'], '{"calories": 717, "protein": 0.9, "carbs": 0.1, "fat": 81}'::jsonb),
('Requeijão', 'Laticínios', ARRAY['lactose'], '{"calories": 264, "protein": 11, "carbs": 3, "fat": 24}'::jsonb),

-- Grãos
('Pão de Forma Integral', 'Grãos', ARRAY['gluten'], '{"calories": 247, "protein": 13, "carbs": 41, "fat": 3.5}'::jsonb),
('Macarrão', 'Grãos', ARRAY['gluten'], '{"calories": 371, "protein": 13, "carbs": 75, "fat": 1.5}'::jsonb),
('Arroz Branco', 'Grãos', NULL, '{"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3}'::jsonb),
('Arroz Integral', 'Grãos', NULL, '{"calories": 111, "protein": 2.6, "carbs": 23, "fat": 0.9}'::jsonb),
('Aveia', 'Grãos', NULL, '{"calories": 389, "protein": 17, "carbs": 66, "fat": 7}'::jsonb),
('Quinoa', 'Grãos', NULL, '{"calories": 120, "protein": 4.4, "carbs": 21, "fat": 1.9}'::jsonb),
('Pão Francês', 'Grãos', ARRAY['gluten'], '{"calories": 300, "protein": 9, "carbs": 58, "fat": 3.6}'::jsonb),
('Biscoito Cream Cracker', 'Grãos', ARRAY['gluten'], '{"calories": 432, "protein": 10, "carbs": 71, "fat": 11}'::jsonb),

-- Leguminosas
('Feijão Preto', 'Leguminosas', NULL, '{"calories": 77, "protein": 4.5, "carbs": 14, "fat": 0.5}'::jsonb),
('Feijão Carioca', 'Leguminosas', NULL, '{"calories": 76, "protein": 4.8, "carbs": 13.6, "fat": 0.5}'::jsonb),
('Lentilha', 'Leguminosas', NULL, '{"calories": 116, "protein": 9, "carbs": 20, "fat": 0.4}'::jsonb),
('Grão de Bico', 'Leguminosas', NULL, '{"calories": 164, "protein": 8.9, "carbs": 27, "fat": 2.6}'::jsonb),
('Ervilha', 'Leguminosas', NULL, '{"calories": 81, "protein": 5.4, "carbs": 14, "fat": 0.4}'::jsonb),

-- Proteínas
('Frango Grelhado', 'Proteínas', NULL, '{"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6}'::jsonb),
('Peixe (Tilápia)', 'Proteínas', NULL, '{"calories": 96, "protein": 20, "carbs": 0, "fat": 1.7}'::jsonb),
('Ovo Cozido', 'Proteínas', NULL, '{"calories": 155, "protein": 13, "carbs": 1.1, "fat": 11}'::jsonb),
('Carne Bovina Magra', 'Proteínas', NULL, '{"calories": 250, "protein": 26, "carbs": 0, "fat": 15}'::jsonb),
('Salmão', 'Proteínas', NULL, '{"calories": 208, "protein": 20, "carbs": 0, "fat": 13}'::jsonb),
('Atum', 'Proteínas', NULL, '{"calories": 144, "protein": 23, "carbs": 0, "fat": 5}'::jsonb),

-- Frutas
('Banana', 'Frutas', NULL, '{"calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3}'::jsonb),
('Maçã', 'Frutas', ARRAY['fodmap'], '{"calories": 52, "protein": 0.3, "carbs": 14, "fat": 0.2}'::jsonb),
('Laranja', 'Frutas', NULL, '{"calories": 47, "protein": 0.9, "carbs": 12, "fat": 0.1}'::jsonb),
('Morango', 'Frutas', NULL, '{"calories": 32, "protein": 0.7, "carbs": 7.7, "fat": 0.3}'::jsonb),
('Mamão', 'Frutas', NULL, '{"calories": 43, "protein": 0.5, "carbs": 11, "fat": 0.3}'::jsonb),
('Melancia', 'Frutas', NULL, '{"calories": 30, "protein": 0.6, "carbs": 7.6, "fat": 0.2}'::jsonb),
('Abacate', 'Frutas', NULL, '{"calories": 160, "protein": 2, "carbs": 8.5, "fat": 15}'::jsonb),

-- Vegetais
('Alface', 'Vegetais', NULL, '{"calories": 15, "protein": 1.4, "carbs": 2.9, "fat": 0.2}'::jsonb),
('Tomate', 'Vegetais', NULL, '{"calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2}'::jsonb),
('Cenoura', 'Vegetais', NULL, '{"calories": 41, "protein": 0.9, "carbs": 10, "fat": 0.2}'::jsonb),
('Brócolis', 'Vegetais', NULL, '{"calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4}'::jsonb),
('Cebola', 'Vegetais', ARRAY['fodmap'], '{"calories": 40, "protein": 1.1, "carbs": 9.3, "fat": 0.1}'::jsonb),
('Alho', 'Vegetais', ARRAY['fodmap'], '{"calories": 149, "protein": 6.4, "carbs": 33, "fat": 0.5}'::jsonb),
('Batata', 'Vegetais', NULL, '{"calories": 77, "protein": 2, "carbs": 17, "fat": 0.1}'::jsonb),
('Batata Doce', 'Vegetais', NULL, '{"calories": 86, "protein": 1.6, "carbs": 20, "fat": 0.1}'::jsonb),
('Abobrinha', 'Vegetais', NULL, '{"calories": 17, "protein": 1.2, "carbs": 3.1, "fat": 0.3}'::jsonb),
('Pepino', 'Vegetais', NULL, '{"calories": 15, "protein": 0.7, "carbs": 3.6, "fat": 0.1}'::jsonb),
('Espinafre', 'Vegetais', NULL, '{"calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4}'::jsonb),

-- Bebidas
('Café', 'Bebidas', NULL, '{"calories": 2, "protein": 0.3, "carbs": 0, "fat": 0}'::jsonb),
('Chá Verde', 'Bebidas', NULL, '{"calories": 1, "protein": 0, "carbs": 0, "fat": 0}'::jsonb),
('Suco de Laranja Natural', 'Bebidas', NULL, '{"calories": 45, "protein": 0.7, "carbs": 10, "fat": 0.2}'::jsonb),
('Refrigerante', 'Bebidas', NULL, '{"calories": 42, "protein": 0, "carbs": 11, "fat": 0}'::jsonb),

-- Outros
('Azeite de Oliva', 'Óleos e Gorduras', NULL, '{"calories": 884, "protein": 0, "carbs": 0, "fat": 100}'::jsonb),
('Mel', 'Doces', NULL, '{"calories": 304, "protein": 0.3, "carbs": 82, "fat": 0}'::jsonb),
('Chocolate ao Leite', 'Doces', ARRAY['lactose'], '{"calories": 535, "protein": 7.6, "carbs": 59, "fat": 30}'::jsonb),
('Amendoim', 'Oleaginosas', ARRAY['peanut'], '{"calories": 567, "protein": 26, "carbs": 16, "fat": 49}'::jsonb),
('Castanha de Caju', 'Oleaginosas', NULL, '{"calories": 553, "protein": 18, "carbs": 30, "fat": 44}'::jsonb);

-- ============================================
-- SEED: Usuário de teste
-- ============================================
INSERT INTO users (email, password_hash, full_name, birth_date, gender, weight, height) VALUES
('joao@example.com', crypt('senha123', gen_salt('bf')), 'João Silva', '1990-05-15', 'male', 75.0, 175);

-- Pega o ID do usuário criado
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'joao@example.com';
    
    -- ============================================
    -- SEED: Preferências do usuário
    -- ============================================
    INSERT INTO user_preferences (user_id, dietary_restrictions, allergies) VALUES
    (v_user_id, ARRAY['sem_lactose'], ARRAY[]::TEXT[]);
    
    -- ============================================
    -- SEED: Sintomas de exemplo
    -- ============================================
    INSERT INTO symptoms (user_id, types, intensity, datetime, duration, pain_location, notes) VALUES
    (v_user_id, ARRAY['bloating', 'gas'], 6, CURRENT_TIMESTAMP - INTERVAL '1 day', '2 horas', 'lower_abdomen', 'Começou após o almoço'),
    (v_user_id, ARRAY['abdominal_pain', 'nausea'], 7, CURRENT_TIMESTAMP - INTERVAL '2 days', '3 horas', 'upper_abdomen', 'Tomei leite no café da manhã'),
    (v_user_id, ARRAY['diarrhea'], 5, CURRENT_TIMESTAMP - INTERVAL '3 days', '1 hora', NULL, NULL),
    (v_user_id, ARRAY['bloating'], 4, CURRENT_TIMESTAMP - INTERVAL '4 days', '1.5 horas', NULL, NULL),
    (v_user_id, ARRAY['heartburn'], 3, CURRENT_TIMESTAMP - INTERVAL '5 days', '30 minutos', NULL, NULL),
    (v_user_id, ARRAY['gas', 'cramps'], 6, CURRENT_TIMESTAMP - INTERVAL '6 days', '2 horas', 'lower_abdomen', 'Após jantar com feijão'),
    (v_user_id, ARRAY['bloating'], 5, CURRENT_TIMESTAMP - INTERVAL '7 days', '1 hora', NULL, NULL);
    
    -- ============================================
    -- SEED: Logs de alimentos
    -- ============================================
    INSERT INTO food_logs (user_id, food_name, food_id, meal_type, datetime) VALUES
    (v_user_id, 'Macarrão', (SELECT id FROM foods WHERE name = 'Macarrão'), 'lunch', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '2 hours'),
    (v_user_id, 'Queijo Mussarela', (SELECT id FROM foods WHERE name = 'Queijo Mussarela'), 'lunch', CURRENT_TIMESTAMP - INTERVAL '1 day' - INTERVAL '2 hours'),
    (v_user_id, 'Leite Integral', (SELECT id FROM foods WHERE name = 'Leite Integral'), 'breakfast', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '3 hours'),
    (v_user_id, 'Pão de Forma Integral', (SELECT id FROM foods WHERE name = 'Pão de Forma Integral'), 'breakfast', CURRENT_TIMESTAMP - INTERVAL '2 days' - INTERVAL '3 hours'),
    (v_user_id, 'Arroz Branco', (SELECT id FROM foods WHERE name = 'Arroz Branco'), 'lunch', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '4 hours'),
    (v_user_id, 'Feijão Preto', (SELECT id FROM foods WHERE name = 'Feijão Preto'), 'lunch', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '4 hours'),
    (v_user_id, 'Frango Grelhado', (SELECT id FROM foods WHERE name = 'Frango Grelhado'), 'lunch', CURRENT_TIMESTAMP - INTERVAL '3 days' - INTERVAL '4 hours'),
    (v_user_id, 'Banana', (SELECT id FROM foods WHERE name = 'Banana'), 'snack', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '2 hours'),
    (v_user_id, 'Iogurte Natural', (SELECT id FROM foods WHERE name = 'Iogurte Natural'), 'snack', CURRENT_TIMESTAMP - INTERVAL '4 days' - INTERVAL '2 hours'),
    (v_user_id, 'Café', (SELECT id FROM foods WHERE name = 'Café'), 'breakfast', CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '1 hour'),
    (v_user_id, 'Pão Francês', (SELECT id FROM foods WHERE name = 'Pão Francês'), 'breakfast', CURRENT_TIMESTAMP - INTERVAL '5 days' - INTERVAL '1 hour'),
    (v_user_id, 'Arroz Branco', (SELECT id FROM foods WHERE name = 'Arroz Branco'), 'dinner', CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '3 hours'),
    (v_user_id, 'Feijão Carioca', (SELECT id FROM foods WHERE name = 'Feijão Carioca'), 'dinner', CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '3 hours'),
    (v_user_id, 'Cebola', (SELECT id FROM foods WHERE name = 'Cebola'), 'dinner', CURRENT_TIMESTAMP - INTERVAL '6 days' - INTERVAL '3 hours');
    
    -- ============================================
    -- SEED: Atualiza scores de alimentos
    -- ============================================
    PERFORM update_user_food_status_scores(v_user_id);
    
    -- ============================================
    -- SEED: Gera relatório inicial
    -- ============================================
    PERFORM generate_user_report(v_user_id, 30);
    
    -- ============================================
    -- SEED: Conversas e mensagens
    -- ============================================
    DECLARE
        v_conversation_id UUID;
    BEGIN
        INSERT INTO conversations (user_id, title) VALUES
        (v_user_id, 'Primeira conversa')
        RETURNING id INTO v_conversation_id;
        
        INSERT INTO messages (conversation_id, role, content) VALUES
        (v_conversation_id, 'assistant', 'Olá! Eu sou o DigestAI, seu assistente especializado em saúde digestiva. 👋

Estou aqui para ajudá-lo a entender melhor seu sistema digestivo, identificar possíveis intolerâncias alimentares e criar um plano alimentar personalizado.

Como posso ajudá-lo hoje?'),
        (v_conversation_id, 'user', 'Estou com estufamento após as refeições'),
        (v_conversation_id, 'assistant', 'Entendo que você está com estufamento. Isso pode estar relacionado a alguns fatores:

🔍 Possíveis Causas:
1. Ingestão de alimentos ricos em FODMAPs (cebola, alho)
2. Consumo de laticínios (você tem alta probabilidade de intolerância à lactose)
3. Alimentos com glúten

💡 Recomendações Imediatas:
- Beba chá de hortelã ou gengibre
- Evite deitar após as refeições
- Faça uma caminhada leve de 10-15 minutos
- Evite bebidas gaseificadas

Gostaria que eu analisasse seus sintomas recentes em detalhes?');
    END;
    
    -- ============================================
    -- SEED: Insights da IA
    -- ============================================
    PERFORM create_ai_insight(
        v_user_id,
        'pattern',
        'Padrão identificado: Sintomas após laticínios',
        'Notei que você apresenta sintomas digestivos frequentemente após consumir produtos lácteos. Isso sugere uma possível intolerância à lactose. Recomendo evitar leite, queijo e iogurte por 2 semanas para confirmar.',
        'high',
        jsonb_build_object('foods', ARRAY['Leite', 'Queijo', 'Iogurte'])
    );
    
    PERFORM create_ai_insight(
        v_user_id,
        'recommendation',
        'Dica: Substitua o leite comum',
        'Experimente leites vegetais como leite de aveia, amêndoas ou coco. Eles são naturalmente sem lactose e podem ser uma ótima alternativa.',
        'medium',
        NULL
    );
    
    -- ============================================
    -- SEED: Notificações
    -- ============================================
    INSERT INTO notifications (user_id, type, title, message) VALUES
    (v_user_id, 'report', 'Novo relatório disponível', 'Seu relatório mensal está pronto! Confira as análises e recomendações personalizadas.'),
    (v_user_id, 'insight', 'Novo insight identificado', 'A IA identificou um padrão importante nos seus sintomas. Confira agora!');
    
END $$;

-- ============================================
-- Mensagem de conclusão
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Seed data criado com sucesso!';
    RAISE NOTICE '📧 Usuário de teste: joao@example.com';
    RAISE NOTICE '🔑 Senha: senha123';
END $$;
