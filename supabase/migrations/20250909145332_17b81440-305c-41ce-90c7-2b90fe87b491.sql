-- Secure member tables: require authentication for inserts and bind rows to the inserting user via user_id, with owner-only read access.

-- 1) Add user_id column to each table (if missing)
ALTER TABLE public.basic_members ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.personal_training_members ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.community_members ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.premium_members ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.vip_members ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2) Helper trigger function to ensure user_id is set to the current auth user
CREATE OR REPLACE FUNCTION public.ensure_user_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3) Create BEFORE INSERT triggers to populate user_id when not provided
DROP TRIGGER IF EXISTS ensure_user_id_on_basic_members ON public.basic_members;
CREATE TRIGGER ensure_user_id_on_basic_members
BEFORE INSERT ON public.basic_members
FOR EACH ROW EXECUTE FUNCTION public.ensure_user_id();

DROP TRIGGER IF EXISTS ensure_user_id_on_personal_training_members ON public.personal_training_members;
CREATE TRIGGER ensure_user_id_on_personal_training_members
BEFORE INSERT ON public.personal_training_members
FOR EACH ROW EXECUTE FUNCTION public.ensure_user_id();

DROP TRIGGER IF EXISTS ensure_user_id_on_community_members ON public.community_members;
CREATE TRIGGER ensure_user_id_on_community_members
BEFORE INSERT ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.ensure_user_id();

DROP TRIGGER IF EXISTS ensure_user_id_on_premium_members ON public.premium_members;
CREATE TRIGGER ensure_user_id_on_premium_members
BEFORE INSERT ON public.premium_members
FOR EACH ROW EXECUTE FUNCTION public.ensure_user_id();

DROP TRIGGER IF EXISTS ensure_user_id_on_vip_members ON public.vip_members;
CREATE TRIGGER ensure_user_id_on_vip_members
BEFORE INSERT ON public.vip_members
FOR EACH ROW EXECUTE FUNCTION public.ensure_user_id();

-- 4) Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.basic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_training_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_members ENABLE ROW LEVEL SECURITY;

-- 5) Replace overly-permissive policies with secure, auth-based owner policies
-- BASIC MEMBERS
DROP POLICY IF EXISTS "Anyone can insert basic members" ON public.basic_members;
DROP POLICY IF EXISTS "No one can read basic members" ON public.basic_members;

CREATE POLICY "Users can insert their own basic members"
ON public.basic_members
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own basic members"
ON public.basic_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- PERSONAL TRAINING MEMBERS
DROP POLICY IF EXISTS "Anyone can insert personal training members" ON public.personal_training_members;
DROP POLICY IF EXISTS "No one can read personal training members" ON public.personal_training_members;

CREATE POLICY "Users can insert their own personal training members"
ON public.personal_training_members
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own personal training members"
ON public.personal_training_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- COMMUNITY MEMBERS
DROP POLICY IF EXISTS "Anyone can insert community members" ON public.community_members;
DROP POLICY IF EXISTS "No one can read community members" ON public.community_members;

CREATE POLICY "Users can insert their own community members"
ON public.community_members
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own community members"
ON public.community_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- PREMIUM MEMBERS
DROP POLICY IF EXISTS "Anyone can insert premium members" ON public.premium_members;
DROP POLICY IF EXISTS "No one can read premium members" ON public.premium_members;

CREATE POLICY "Users can insert their own premium members"
ON public.premium_members
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own premium members"
ON public.premium_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- VIP MEMBERS
DROP POLICY IF EXISTS "Anyone can insert vip members" ON public.vip_members;
DROP POLICY IF EXISTS "No one can read vip members" ON public.vip_members;

CREATE POLICY "Users can insert their own vip members"
ON public.vip_members
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own vip members"
ON public.vip_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());