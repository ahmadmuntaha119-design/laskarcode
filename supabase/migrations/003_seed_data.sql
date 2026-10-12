-- ============================================================================
-- LaskarCode Migration 003: Idempotent Seed Data
-- Specification: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §08, §14, §15, §39
-- Synchronized 100% with Task 006 Level Catalog (src/game/levels/catalog.ts)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED ISLANDS (2 Pulau)
-- ----------------------------------------------------------------------------
INSERT INTO public.islands (id, slug, name, description, order_index, is_active)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'desa-boti',
        'Pulau 1 — Desa Boti',
        'Petualangan perdana Boti mempelajari instruksi dasar, urutan langkah (sequence), dan arah belok.',
        1,
        true
    ),
    (
        'a2222222-2222-2222-2222-222222222222',
        'hutan-pola',
        'Pulau 2 — Hutan Pola',
        'Eksplorasi algoritma langkah, pengenalan pola pergerakan (pattern), dan efisiensi rute di Hutan Pola.',
        2,
        true
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 2. SEED CONCEPTS (8 Konsep Inti §14.1)
-- ----------------------------------------------------------------------------
INSERT INTO public.concepts (id, slug, name, description)
VALUES
    (
        'c1111111-1111-1111-1111-111111111111',
        'sequence',
        'Sequence',
        'Urutan instruksi langkah demi langkah secara terstruktur dan teratur.'
    ),
    (
        'c2222222-2222-2222-2222-222222222222',
        'direction',
        'Direction',
        'Arah orientasi hadap (North, East, South, West) dan rotasi Boti.'
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        'planning',
        'Planning',
        'Perencanaan rute dan estimasi aksi sebelum mengeksekusi program.'
    ),
    (
        'c4444444-4444-4444-4444-444444444444',
        'debugging',
        'Debugging',
        'Proses mengidentifikasi, menganalisis, dan memperbaiki kesalahan langkah.'
    ),
    (
        'c5555555-5555-5555-5555-555555555555',
        'pattern',
        'Pattern',
        'Pengenalan bentuk pergerakan berulang yang dapat diprediksi.'
    ),
    (
        'c6666666-6666-6666-6666-666666666666',
        'algorithm',
        'Algorithm',
        'Kumpulan aturan dan rangkaian instruksi logis untuk menyelesaikan misi.'
    ),
    (
        'c7777777-7777-7777-7777-777777777777',
        'problem-solving',
        'Problem Solving',
        'Kemampuan memecahkan tantangan dan menavigasi labirin rintangan.'
    ),
    (
        'c8888888-8888-8888-8888-888888888888',
        'efficiency',
        'Efficiency',
        'Optimalisasi rute untuk mencapai target dengan langkah seminimal mungkin.'
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 3. SEED LEVELS (12 Level Kurikulum MVP)
-- ----------------------------------------------------------------------------
INSERT INTO public.levels (
    id, island_id, code, title, description, level_type, order_index, difficulty, configuration, is_active
)
VALUES
    -- Pulau 1 — Desa Boti (1.1 - 1.6)
    (
        'b0101010-0000-0000-0000-000000000001',
        'a1111111-1111-1111-1111-111111111111',
        '1.1',
        'Boti Mau Maju',
        'Bantu Boti melangkah maju 4 kali untuk mencapai bintang target pertamanya.',
        'Learn',
        1,
        1,
        '{"grid": {"width": 5, "height": 3}, "start": {"x": 0, "y": 1, "direction": "EAST"}, "goal": {"x": 4, "y": 1}, "obstacles": [], "availableBlocks": ["MOVE"], "maxActions": 10}'::jsonb,
        true
    ),
    (
        'b0101010-0000-0000-0000-000000000002',
        'a1111111-1111-1111-1111-111111111111',
        '1.2',
        'Jalan Menuju Apel',
        'Pahami konsep urutan (Sequence) dengan menyusun langkah maju Boti menuju apel emas.',
        'Learn',
        2,
        1,
        '{"grid": {"width": 5, "height": 3}, "start": {"x": 0, "y": 2, "direction": "EAST"}, "goal": {"x": 4, "y": 2}, "obstacles": [{"x": 2, "y": 1}], "availableBlocks": ["MOVE"], "maxActions": 10}'::jsonb,
        true
    ),
    (
        'b0101010-0000-0000-0000-000000000003',
        'a1111111-1111-1111-1111-111111111111',
        '1.3',
        'Belok, Boti!',
        'Pelajari cara berbelok menggunakan blok Belok Kanan dan Belok Kiri untuk menghindari pembatas.',
        'Learn',
        3,
        2,
        '{"grid": {"width": 5, "height": 4}, "start": {"x": 0, "y": 0, "direction": "EAST"}, "goal": {"x": 3, "y": 2}, "obstacles": [{"x": 3, "y": 0}, {"x": 1, "y": 1}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 12}'::jsonb,
        true
    ),
    (
        'b0101010-0000-0000-0000-000000000004',
        'a1111111-1111-1111-1111-111111111111',
        '1.4',
        'Jalan Desa',
        'Rencanakan rute berliku di jalan desa agar Boti sampai ke tujuan tanpa menabrak rintangan.',
        'Practice',
        4,
        2,
        '{"grid": {"width": 5, "height": 3}, "start": {"x": 0, "y": 0, "direction": "EAST"}, "goal": {"x": 4, "y": 2}, "obstacles": [{"x": 2, "y": 0}, {"x": 0, "y": 1}, {"x": 2, "y": 1}, {"x": 4, "y": 1}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 12}'::jsonb,
        true
    ),
    (
        'b0101010-0000-0000-0000-000000000005',
        'a1111111-1111-1111-1111-111111111111',
        '1.5',
        'Perbaiki Jalan Boti',
        'Temukan dan perbaiki kesalahan (bug) pada urutan langkah Boti agar tidak menabrak rintangan.',
        'Debugging',
        5,
        2,
        '{"grid": {"width": 5, "height": 4}, "start": {"x": 0, "y": 1, "direction": "EAST"}, "goal": {"x": 3, "y": 3}, "obstacles": [{"x": 2, "y": 1}, {"x": 0, "y": 2}, {"x": 2, "y": 2}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 12}'::jsonb,
        true
    ),
    (
        'b0101010-0000-0000-0000-000000000006',
        'a1111111-1111-1111-1111-111111111111',
        '1.6',
        'Tantangan Kepala Boti',
        'Uji keahlianmu menyelesaikan rute petualangan mandiri untuk membuktikan kelulusan dari Desa Boti!',
        'Mastery Check',
        6,
        3,
        '{"grid": {"width": 6, "height": 4}, "start": {"x": 0, "y": 0, "direction": "EAST"}, "goal": {"x": 5, "y": 3}, "obstacles": [{"x": 2, "y": 0}, {"x": 2, "y": 1}, {"x": 4, "y": 2}, {"x": 1, "y": 3}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 16}'::jsonb,
        true
    ),

    -- Pulau 2 — Hutan Pola (2.1 - 2.6)
    (
        'b0202020-0000-0000-0000-000000000001',
        'a2222222-2222-2222-2222-222222222222',
        '2.1',
        'Ikuti Polanya',
        'Kenali pola tangga berulang (Maju-Maju-Belok) untuk melintasi Hutan Pola.',
        'Learn',
        7,
        2,
        '{"grid": {"width": 7, "height": 3}, "start": {"x": 0, "y": 0, "direction": "EAST"}, "goal": {"x": 6, "y": 2}, "obstacles": [{"x": 3, "y": 0}, {"x": 5, "y": 1}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 16}'::jsonb,
        true
    ),
    (
        'b0202020-0000-0000-0000-000000000002',
        'a2222222-2222-2222-2222-222222222222',
        '2.2',
        'Jalan yang Hilang',
        'Lengkapi bagian pola yang rumpang dengan memprediksi arah dan jumlah langkah yang tepat.',
        'Learn',
        8,
        2,
        '{"grid": {"width": 7, "height": 4}, "start": {"x": 0, "y": 0, "direction": "EAST"}, "goal": {"x": 6, "y": 3}, "obstacles": [{"x": 2, "y": 1}, {"x": 4, "y": 0}, {"x": 4, "y": 1}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 16}'::jsonb,
        true
    ),
    (
        'b0202020-0000-0000-0000-000000000003',
        'a2222222-2222-2222-2222-222222222222',
        '2.3',
        'Urutkan Instruksi',
        'Susun kembali algoritma langkah Boti yang berantakan agar berurutan dengan benar menuju target.',
        'Practice',
        9,
        2,
        '{"grid": {"width": 6, "height": 4}, "start": {"x": 0, "y": 1, "direction": "EAST"}, "goal": {"x": 4, "y": 3}, "obstacles": [{"x": 2, "y": 1}, {"x": 2, "y": 2}, {"x": 0, "y": 2}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 14}'::jsonb,
        true
    ),
    (
        'b0202020-0000-0000-0000-000000000004',
        'a2222222-2222-2222-2222-222222222222',
        '2.4',
        'Dua Jalan',
        'Ada dua jalan menuju bintang! Pilih jalan atas yang lebih singkat atau jalan bawah yang memutar.',
        'Practice',
        10,
        3,
        '{"grid": {"width": 6, "height": 5}, "start": {"x": 0, "y": 2, "direction": "EAST"}, "goal": {"x": 5, "y": 2}, "obstacles": [{"x": 2, "y": 2}, {"x": 3, "y": 2}, {"x": 4, "y": 2}, {"x": 2, "y": 3}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 16}'::jsonb,
        true
    ),
    (
        'b0202020-0000-0000-0000-000000000005',
        'a2222222-2222-2222-2222-222222222222',
        '2.5',
        'Perbaiki Algoritma',
        'Identifikasi kegagalan pola dalam algoritma dan rancang ulang urutan langkah yang benar.',
        'Debugging',
        11,
        3,
        '{"grid": {"width": 6, "height": 4}, "start": {"x": 0, "y": 0, "direction": "EAST"}, "goal": {"x": 5, "y": 3}, "obstacles": [{"x": 2, "y": 0}, {"x": 3, "y": 2}, {"x": 1, "y": 2}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 16}'::jsonb,
        true
    ),
    (
        'b0202020-0000-0000-0000-000000000006',
        'a2222222-2222-2222-2222-222222222222',
        '2.6',
        'Master Challenge',
        'Tantangan pamungkas Pulau 2: Integrasikan pemahaman pola, arah, dan algoritma untuk mencapai puncak!',
        'Mastery Check',
        12,
        3,
        '{"grid": {"width": 7, "height": 5}, "start": {"x": 0, "y": 0, "direction": "EAST"}, "goal": {"x": 6, "y": 4}, "obstacles": [{"x": 2, "y": 0}, {"x": 2, "y": 1}, {"x": 4, "y": 2}, {"x": 4, "y": 3}, {"x": 1, "y": 3}], "availableBlocks": ["MOVE", "TURN_LEFT", "TURN_RIGHT"], "maxActions": 20}'::jsonb,
        true
    )
ON CONFLICT (code) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    level_type = EXCLUDED.level_type,
    order_index = EXCLUDED.order_index,
    difficulty = EXCLUDED.difficulty,
    configuration = EXCLUDED.configuration,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 4. SEED LEVEL CONCEPTS MAPPING
-- ----------------------------------------------------------------------------
INSERT INTO public.level_concepts (level_id, concept_id, weight, role)
VALUES
    -- Level 1.1: Sequence (1.0)
    ('b0101010-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 1.0, 'primary'),
    -- Level 1.2: Sequence (0.8), Planning (0.2)
    ('b0101010-0000-0000-0000-000000000002', 'c1111111-1111-1111-1111-111111111111', 0.8, 'primary'),
    ('b0101010-0000-0000-0000-000000000002', 'c3333333-3333-3333-3333-333333333333', 0.2, 'secondary'),
    -- Level 1.3: Direction (0.7), Sequence (0.3)
    ('b0101010-0000-0000-0000-000000000003', 'c2222222-2222-2222-2222-222222222222', 0.7, 'primary'),
    ('b0101010-0000-0000-0000-000000000003', 'c1111111-1111-1111-1111-111111111111', 0.3, 'secondary'),
    -- Level 1.4: Sequence (0.4), Direction (0.4), Planning (0.2)
    ('b0101010-0000-0000-0000-000000000004', 'c1111111-1111-1111-1111-111111111111', 0.4, 'primary'),
    ('b0101010-0000-0000-0000-000000000004', 'c2222222-2222-2222-2222-222222222222', 0.4, 'primary'),
    ('b0101010-0000-0000-0000-000000000004', 'c3333333-3333-3333-3333-333333333333', 0.2, 'secondary'),
    -- Level 1.5: Debugging (0.6), Sequence (0.2), Direction (0.2)
    ('b0101010-0000-0000-0000-000000000005', 'c4444444-4444-4444-4444-444444444444', 0.6, 'primary'),
    ('b0101010-0000-0000-0000-000000000005', 'c1111111-1111-1111-1111-111111111111', 0.2, 'secondary'),
    ('b0101010-0000-0000-0000-000000000005', 'c2222222-2222-2222-2222-222222222222', 0.2, 'secondary'),
    -- Level 1.6: Problem Solving (0.4), Planning (0.3), Sequence (0.3)
    ('b0101010-0000-0000-0000-000000000006', 'c7777777-7777-7777-7777-777777777777', 0.4, 'primary'),
    ('b0101010-0000-0000-0000-000000000006', 'c3333333-3333-3333-3333-333333333333', 0.3, 'secondary'),
    ('b0101010-0000-0000-0000-000000000006', 'c1111111-1111-1111-1111-111111111111', 0.3, 'secondary'),

    -- Level 2.1: Pattern (0.6), Algorithm (0.4)
    ('b0202020-0000-0000-0000-000000000001', 'c5555555-5555-5555-5555-555555555555', 0.6, 'primary'),
    ('b0202020-0000-0000-0000-000000000001', 'c6666666-6666-6666-6666-666666666666', 0.4, 'secondary'),
    -- Level 2.2: Pattern (0.7), Algorithm (0.3)
    ('b0202020-0000-0000-0000-000000000002', 'c5555555-5555-5555-5555-555555555555', 0.7, 'primary'),
    ('b0202020-0000-0000-0000-000000000002', 'c6666666-6666-6666-6666-666666666666', 0.3, 'secondary'),
    -- Level 2.3: Algorithm (0.6), Sequence (0.4)
    ('b0202020-0000-0000-0000-000000000003', 'c6666666-6666-6666-6666-666666666666', 0.6, 'primary'),
    ('b0202020-0000-0000-0000-000000000003', 'c1111111-1111-1111-1111-111111111111', 0.4, 'secondary'),
    -- Level 2.4: Efficiency (0.6), Problem Solving (0.4)
    ('b0202020-0000-0000-0000-000000000004', 'c8888888-8888-8888-8888-888888888888', 0.6, 'primary'),
    ('b0202020-0000-0000-0000-000000000004', 'c7777777-7777-7777-7777-777777777777', 0.4, 'secondary'),
    -- Level 2.5: Debugging (0.5), Pattern (0.3), Algorithm (0.2)
    ('b0202020-0000-0000-0000-000000000005', 'c4444444-4444-4444-4444-444444444444', 0.5, 'primary'),
    ('b0202020-0000-0000-0000-000000000005', 'c5555555-5555-5555-5555-555555555555', 0.3, 'secondary'),
    ('b0202020-0000-0000-0000-000000000005', 'c6666666-6666-6666-6666-666666666666', 0.2, 'secondary'),
    -- Level 2.6: Problem Solving (0.3), Algorithm (0.3), Pattern (0.2), Sequence (0.2)
    ('b0202020-0000-0000-0000-000000000006', 'c7777777-7777-7777-7777-777777777777', 0.3, 'primary'),
    ('b0202020-0000-0000-0000-000000000006', 'c6666666-6666-6666-6666-666666666666', 0.3, 'primary'),
    ('b0202020-0000-0000-0000-000000000006', 'c5555555-5555-5555-5555-555555555555', 0.2, 'secondary'),
    ('b0202020-0000-0000-0000-000000000006', 'c1111111-1111-1111-1111-111111111111', 0.2, 'secondary')
ON CONFLICT (level_id, concept_id) DO UPDATE SET
    weight = EXCLUDED.weight,
    role = EXCLUDED.role;
