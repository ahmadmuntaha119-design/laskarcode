-- ============================================================================
-- LaskarCode Migration 001: Initial Database Schema (11 Core Tables)
-- Specification: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §15, §16, §17
-- ============================================================================

-- Enable pgcrypto / uuid-ossp if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. profiles
-- Spec §15.1: id UUID PK, nickname VARCHAR(20), avatar_id VARCHAR(50)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname VARCHAR(20) NOT NULL,
    avatar_id VARCHAR(50) NOT NULL DEFAULT 'boti_default',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_nickname_not_empty CHECK (char_length(trim(nickname)) > 0)
);

-- ============================================================================
-- 2. recovery_codes
-- Spec §15.2: id UUID PK, profile_id UUID FK UNIQUE, code_hash TEXT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL
);

-- ============================================================================
-- 3. islands
-- Spec §15.3: id UUID PK, slug VARCHAR(50) UNIQUE, name VARCHAR(100), order_index INT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.islands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. levels
-- Spec §15.4: id UUID PK, island_id UUID FK, code VARCHAR(20) UNIQUE, configuration JSONB
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    island_id UUID NOT NULL REFERENCES public.islands(id) ON DELETE RESTRICT,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    level_type VARCHAR(30) NOT NULL,
    order_index INTEGER NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    configuration JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. concepts
-- Spec §15.5: id UUID PK, slug VARCHAR(50) UNIQUE, name VARCHAR(100)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. level_concepts
-- Spec §15.6: (level_id, concept_id) PK, weight NUMERIC (0 <= weight <= 1), role VARCHAR(20)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.level_concepts (
    level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    weight NUMERIC NOT NULL CHECK (weight >= 0 AND weight <= 1),
    role VARCHAR(20) NOT NULL DEFAULT 'primary',
    PRIMARY KEY (level_id, concept_id)
);

-- ============================================================================
-- 7. level_progress
-- Spec §15.7: id UUID PK, (profile_id, level_id) UNIQUE, status (NOT_STARTED, IN_PROGRESS, COMPLETED)
-- stars SMALLINT (0..3)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.level_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
    stars SMALLINT NOT NULL DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
    best_attempts INTEGER NOT NULL DEFAULT 0,
    best_time_ms INTEGER NULL,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (profile_id, level_id)
);

-- ============================================================================
-- 8. level_attempts
-- Spec §15.8: id UUID PK, profile_id, level_id, attempt_number, successful, error_types JSONB, program_data JSONB
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.level_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    successful BOOLEAN NOT NULL,
    actions_used INTEGER NOT NULL,
    optimal_actions INTEGER NULL,
    collisions INTEGER NOT NULL DEFAULT 0,
    hints_used INTEGER NOT NULL DEFAULT 0,
    program_changes INTEGER NOT NULL DEFAULT 0,
    time_to_complete_ms INTEGER NULL,
    error_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    program_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NULL
);

-- ============================================================================
-- 9. mastery
-- Spec §15.9: id UUID PK, (profile_id, concept_id) UNIQUE, score NUMERIC(5,2) (0 <= score <= 100)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (score >= 0.00 AND score <= 100.00),
    status VARCHAR(20) NOT NULL DEFAULT 'developing',
    evidence_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (profile_id, concept_id)
);

-- ============================================================================
-- 10. learning_events
-- Spec §15.10: id UUID PK, profile_id, level_id NULL, attempt_id NULL, event_type, event_data JSONB
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level_id UUID NULL REFERENCES public.levels(id) ON DELETE SET NULL,
    attempt_id UUID NULL REFERENCES public.level_attempts(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 11. ai_interactions
-- Spec §15.11: id UUID PK, profile_id, level_id NULL, attempt_id NULL, type (KAWAN_KOD, BOTI_STORY)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level_id UUID NULL REFERENCES public.levels(id) ON DELETE SET NULL,
    attempt_id UUID NULL REFERENCES public.level_attempts(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('KAWAN_KOD', 'BOTI_STORY')),
    hint_level SMALLINT NULL CHECK (hint_level IS NULL OR (hint_level >= 1 AND hint_level <= 3)),
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES (§17)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_levels_island_order ON public.levels (island_id, order_index);
CREATE INDEX IF NOT EXISTS idx_level_progress_profile_level ON public.level_progress (profile_id, level_id);
CREATE INDEX IF NOT EXISTS idx_level_attempts_profile_level ON public.level_attempts (profile_id, level_id);
CREATE INDEX IF NOT EXISTS idx_mastery_profile_concept ON public.mastery (profile_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_profile_created ON public.learning_events (profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_profile_created ON public.ai_interactions (profile_id, created_at);
