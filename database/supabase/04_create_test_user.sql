-- ============================================
-- DigestAI - Criar Usuário de Teste
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- IMPORTANTE: Este script cria um usuário de teste
-- Email: teste@digestai.com
-- Senha: teste123

-- ============================================
-- 1. Criar usuário via auth.users
-- ============================================

-- Inserir usuário no auth.users
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'teste@digestai.com',
    crypt('teste123', gen_salt('bf')), -- Senha: teste123
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Usuário Teste"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Pegar o ID do usuário criado
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Busca o ID do usuário
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'teste@digestai.com';
    
    RAISE NOTICE 'Usuário criado com ID: %', v_user_id;
    
    -- ============================================
    -- 2. Criar profile (será criado automaticamente pelo trigger)
    -- Mas vamos garantir que existe
    -- ============================================
    INSERT INTO public.profiles (id, full_name, birth_date, gender, weight, height)
    VALUES (
        v_user_id,
        'Usuário Teste',
        '1990-01-15',
        'male',
        75.0,
        175
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = 'Usuário Teste',
        birth_date = '1990-01-15',
        gender = 'male',
        weight = 75.0,
        height = 175;
    
    -- ============================================
    -- 3. Criar sintomas de exemplo
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
    -- 4. Criar logs de alimentos
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
    -- 5. Criar conversa inicial
    -- ============================================
    DECLARE
        v_conversation_id UUID;
    BEGIN
        INSERT INTO conversations (user_id, title)
        VALUES (v_user_id, 'Primeira conversa')
        RETURNING id INTO v_conversation_id;
        
        INSERT INTO messages (conversation_id, role, content) VALUES
        (v_conversation_id, 'assistant', 'Olá! Eu sou o DigestAI, seu assistente especializado em saúde digestiva.

Estou aqui para ajudá-lo a entender melhor seu sistema digestivo, identificar possíveis intolerâncias alimentares e criar um plano alimentar personalizado.

Como posso ajudá-lo hoje?');
    END;
    
    -- ============================================
    -- 6. Criar notificações
    -- ============================================
    INSERT INTO notifications (user_id, type, title, message) VALUES
    (v_user_id, 'welcome', 'Bem-vindo ao DigestAI!', 'Comece registrando seus sintomas e alimentos para receber análises personalizadas.'),
    (v_user_id, 'insight', 'Dica do dia', 'Manter um diário alimentar ajuda a identificar padrões e intolerâncias.');
    
    RAISE NOTICE '✅ Dados de teste criados com sucesso!';
    RAISE NOTICE '📧 Email: teste@digestai.com';
    RAISE NOTICE '🔑 Senha: teste123';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Criado:';
    RAISE NOTICE '  - 7 sintomas';
    RAISE NOTICE '  - 14 logs de alimentos';
    RAISE NOTICE '  - 1 conversa com mensagem inicial';
    RAISE NOTICE '  - 2 notificações';
END $$;
