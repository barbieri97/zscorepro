-- =====================================================
-- SEED — Dados de desenvolvimento
-- Senha de todos os usuários: senha123
-- =====================================================

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@zscorepro.com',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"zscorepro_admin"}',
    FALSE, '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'andre@zscorepro.com',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"andre_barbieri"}',
    FALSE, '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'maria@zscorepro.com',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"maria_silva"}',
    FALSE, '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'joao@zscorepro.com',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"joao_santos"}',
    FALSE, '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'ana@zscorepro.com',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"ana_oliveira"}',
    FALSE, '', '', '', '', ''
  );

-- =====================================================
-- ROLES (profiles foram criados pelo trigger)
-- =====================================================
UPDATE public.profiles SET role = 'admin'  WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role = 'author' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role = 'author' WHERE id = '00000000-0000-0000-0000-000000000003';
-- joao e ana ficam como 'user' (default)

UPDATE public.profiles SET bio = 'Administrador da plataforma ZSCOREPRO.' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET bio = 'Psicólogo e pesquisador, apaixonado por psicometria e neurociência.' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET bio = 'Neurocientista com foco em cognição e métodos quantitativos.' WHERE id = '00000000-0000-0000-0000-000000000003';

-- =====================================================
-- POSTS
-- =====================================================
INSERT INTO public.posts (
  id, author_id, title, slug, excerpt, content,
  published, published_at, reading_time_minutes, tags, created_at, updated_at
) VALUES
  -- Admin: 2 publicados, 1 rascunho
  (
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Bem-vindo ao ZSCOREPRO',
    'bem-vindo-ao-zscorepro',
    'Conheça a plataforma criada para psicometristas, pesquisadores e curiosos da ciência.',
    '<p>O ZSCOREPRO nasceu da necessidade de ter ferramentas estatísticas e psicométricas acessíveis online. Neste post apresentamos a plataforma e suas principais funcionalidades.</p><p>Explore as calculadoras, simulações e ferramentas disponíveis e nos diga o que você acha!</p>',
    TRUE, NOW() - INTERVAL '30 days', 2,
    ARRAY['apresentação', 'plataforma'],
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'O que é o Z-score e por que ele importa?',
    'o-que-e-o-z-score-e-por-que-ele-importa',
    'Entenda o conceito de Z-score e como ele transforma escores brutos em informação comparável.',
    '<p>O Z-score é uma das transformações mais utilizadas em psicometria e estatística. Ele expressa quantos desvios-padrão um valor está acima ou abaixo da média da distribuição.</p><p>A fórmula é simples: <strong>Z = (X - μ) / σ</strong>. Mas suas aplicações vão muito além da fórmula.</p><p>Com o Z-score você pode comparar desempenhos em testes com escalas diferentes, identificar outliers e construir perfis neuropsicológicos com mais precisão.</p>',
    TRUE, NOW() - INTERVAL '15 days', 4,
    ARRAY['z-score', 'psicometria', 'estatística'],
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Novas ferramentas chegando em breve',
    'novas-ferramentas-chegando-em-breve',
    'Rascunho com ideias para as próximas funcionalidades da plataforma.',
    '<p>Estamos trabalhando em novas calculadoras e ferramentas. Em breve: análise de fidedignidade, curvas ROC e muito mais.</p>',
    FALSE, NULL, 1,
    ARRAY['novidades'],
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  ),

  -- Andre (author): 1 publicado, 1 rascunho
  (
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'RCI: Como avaliar mudança clínica significativa',
    'rci-como-avaliar-mudanca-clinica-significativa',
    'O Índice de Mudança Confiável ajuda a distinguir mudanças reais de flutuações do erro de medida.',
    '<p>O RCI (Reliable Change Index) foi proposto por Jacobson e Truax (1991) como um critério para determinar se a mudança observada em um escore entre duas avaliações é estatisticamente significativa.</p><p>A fórmula considera o desvio-padrão do instrumento e sua fidedignidade teste-reteste. Um RCI maior que 1,96 (em valor absoluto) indica mudança confiável com 95% de confiança.</p>',
    TRUE, NOW() - INTERVAL '20 days', 5,
    ARRAY['RCI', 'avaliação', 'psicometria', 'clínica'],
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'
  ),
  (
    '00000000-0000-0000-0001-000000000005',
    '00000000-0000-0000-0000-000000000002',
    'Análise descritiva: o ponto de partida de qualquer pesquisa',
    'analise-descritiva-ponto-de-partida-de-qualquer-pesquisa',
    'Rascunho sobre os fundamentos da análise descritiva em pesquisa psicológica.',
    '<p>Antes de qualquer teste inferencial, a análise descritiva conta a história dos seus dados. Médias, medianas, desvios-padrão e distribuições de frequência revelam padrões que podem orientar toda a análise subsequente.</p>',
    FALSE, NULL, 3,
    ARRAY['estatística', 'pesquisa', 'análise descritiva'],
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
  ),

  -- Maria (author): 1 publicado
  (
    '00000000-0000-0000-0001-000000000006',
    '00000000-0000-0000-0000-000000000003',
    'Neurociência cognitiva e avaliação neuropsicológica',
    'neurociencia-cognitiva-e-avaliacao-neuropsicologica',
    'Uma introdução à relação entre neurociência cognitiva e os instrumentos de avaliação neuropsicológica.',
    '<p>A avaliação neuropsicológica busca mapear o funcionamento cerebral a partir de medidas comportamentais. Com o avanço da neurociência cognitiva, compreendemos cada vez melhor quais regiões cerebrais sustentam funções como memória de trabalho, atenção e funções executivas.</p><p>Neste post, exploramos como os achados da neuroimagem podem guiar a interpretação de escores em testes neuropsicológicos padronizados.</p>',
    TRUE, NOW() - INTERVAL '10 days', 6,
    ARRAY['neurociência', 'neuropsicologia', 'cognição'],
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
  );
