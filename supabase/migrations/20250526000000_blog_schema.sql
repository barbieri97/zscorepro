-- =====================================================
-- Blog Schema Migration
-- Roles: user (default), author, admin
-- Promotion only via direct SQL by the owner
-- =====================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username    TEXT UNIQUE,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'author', 'admin')),
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.profiles.role IS
  'Roles: user (default), author (can create posts), admin (full access). Promote via: UPDATE profiles SET role = ''author'' WHERE id = ''USER_ID'';';

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Prevent role changes via API (only allow via direct DB connection)
CREATE OR REPLACE FUNCTION public.protect_role_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_setting('request.jwt.claims', true) IS NOT NULL
     AND current_setting('request.jwt.claims', true) != '' THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_role ON public.profiles;
CREATE TRIGGER profiles_protect_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_role_column();

-- Auto-update updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  excerpt               TEXT,
  content               TEXT,
  cover_image           TEXT,
  published             BOOLEAN NOT NULL DEFAULT FALSE,
  published_at          TIMESTAMPTZ,
  reading_time_minutes  INT,
  tags                  TEXT[] NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS posts_set_updated_at ON public.posts;
CREATE TRIGGER posts_set_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- POST LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id   UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content             TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS comments_set_updated_at ON public.comments;
CREATE TRIGGER comments_set_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- COMMENT LIKES
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_slug        ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published   ON public.posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author      ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post     ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent   ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post   ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_c   ON public.comment_likes(comment_id);

-- ENABLE RLS
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- ==== PROFILES POLICIES ====
CREATE POLICY "profiles_select"      ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ==== POSTS POLICIES ====
CREATE POLICY "posts_select_published" ON public.posts
  FOR SELECT USING (published = TRUE);

CREATE POLICY "posts_select_own_drafts" ON public.posts
  FOR SELECT USING (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin'))
  );

CREATE POLICY "posts_select_admin" ON public.posts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "posts_insert_author" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin'))
  );

CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE USING (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin'))
  );

CREATE POLICY "posts_update_admin" ON public.posts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE USING (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin'))
  );

-- ==== POST LIKES POLICIES ====
CREATE POLICY "post_likes_select" ON public.post_likes FOR SELECT USING (TRUE);
CREATE POLICY "post_likes_insert" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "post_likes_delete" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ==== COMMENTS POLICIES ====
CREATE POLICY "comments_select"     ON public.comments FOR SELECT USING (TRUE);
CREATE POLICY "comments_insert"     ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_admin" ON public.comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==== COMMENT LIKES POLICIES ====
CREATE POLICY "comment_likes_select" ON public.comment_likes FOR SELECT USING (TRUE);
CREATE POLICY "comment_likes_insert" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);
CREATE POLICY "comment_likes_delete" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ==== STORAGE BUCKETS ====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('post-covers', 'post-covers', TRUE, 5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('post-images', 'post-images', TRUE, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage: post-covers
CREATE POLICY "storage_post_covers_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'post-covers');
CREATE POLICY "storage_post_covers_insert" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'post-covers' AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin'))
  );
CREATE POLICY "storage_post_covers_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'post-covers' AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin')));
CREATE POLICY "storage_post_covers_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'post-covers' AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin')));

-- Storage: post-images
CREATE POLICY "storage_post_images_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');
CREATE POLICY "storage_post_images_insert" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin'))
  );
CREATE POLICY "storage_post_images_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'post-images' AND auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('author','admin')));
