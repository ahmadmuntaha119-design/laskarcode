-- ============================================================================
-- LaskarCode Migration 002: Row Level Security (RLS) Policies
-- Specification: docs/LaskarCode_Vibe_Coding_Acuan_v1.0.md §18, §20, §22
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable RLS on ALL 11 tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Educational Content Tables (Public Read for Active Records)
-- Islands, Levels, Concepts, and Level Concepts can be read by clients
-- ----------------------------------------------------------------------------
CREATE POLICY "Allow public read active islands"
    ON public.islands FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow public read active levels"
    ON public.levels FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow public read concepts"
    ON public.concepts FOR SELECT
    USING (true);

CREATE POLICY "Allow public read level_concepts"
    ON public.level_concepts FOR SELECT
    USING (true);

-- ----------------------------------------------------------------------------
-- 3. Profiles (Children Profiles)
-- - Only authenticated user or owner may view their profile
-- - Direct public anonymous writes are BLOCKED (must go through server-side service)
-- ----------------------------------------------------------------------------
CREATE POLICY "Profiles viewable by owner"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 4. Recovery Codes (High Security)
-- - NEVER readable by anonymous or standard clients directly
-- - Only accessible by authenticated owner or server-side service role
-- ----------------------------------------------------------------------------
CREATE POLICY "Recovery codes strictly private to owner"
    ON public.recovery_codes FOR SELECT
    TO authenticated
    USING (auth.uid() = profile_id);

-- ----------------------------------------------------------------------------
-- 5. Player Progress & Attempts
-- - Child can only read their own progress and attempts
-- - Direct client modifications of stars/mastery without server validation are prohibited
-- ----------------------------------------------------------------------------
CREATE POLICY "Progress viewable by owner"
    ON public.level_progress FOR SELECT
    TO authenticated
    USING (auth.uid() = profile_id);

CREATE POLICY "Attempts viewable by owner"
    ON public.level_attempts FOR SELECT
    TO authenticated
    USING (auth.uid() = profile_id);

-- ----------------------------------------------------------------------------
-- 6. Mastery & Learning Events
-- - Child can only read their own mastery
-- - Direct client score manipulation is blocked
-- ----------------------------------------------------------------------------
CREATE POLICY "Mastery viewable by owner"
    ON public.mastery FOR SELECT
    TO authenticated
    USING (auth.uid() = profile_id);

CREATE POLICY "Learning events viewable by owner"
    ON public.learning_events FOR SELECT
    TO authenticated
    USING (auth.uid() = profile_id);

-- ----------------------------------------------------------------------------
-- 7. AI Interactions
-- - Viewable only by the owning profile
-- ----------------------------------------------------------------------------
CREATE POLICY "AI interactions viewable by owner"
    ON public.ai_interactions FOR SELECT
    TO authenticated
    USING (auth.uid() = profile_id);
