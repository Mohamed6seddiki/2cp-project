-- ============================================================
-- FIX: Supabase signup 500 (unexpected_failure)
-- Applies a hardened trigger for auth.users -> public.users
-- Run this file in Supabase SQL Editor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_username TEXT;
  v_username      TEXT;
  v_role_text     TEXT;
  v_role          user_role := 'student';
  v_attempt       INT := 0;
BEGIN
  v_base_username := COALESCE(
    NULLIF(LOWER(REGEXP_REPLACE(NEW.raw_user_meta_data->>'preferred_username', '[^a-z0-9_]+', '', 'g')), ''),
    NULLIF(LOWER(REGEXP_REPLACE(NEW.raw_user_meta_data->>'name', '[^a-z0-9_]+', '', 'g')), ''),
    NULLIF(LOWER(REGEXP_REPLACE(NEW.raw_user_meta_data->>'username', '[^a-z0-9_]+', '', 'g')), ''),
    NULLIF(LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-z0-9_]+', '', 'g')), ''),
    'user_' || REPLACE(SUBSTRING(NEW.id::text, 1, 8), '-', '')
  );

  v_username := v_base_username;

  v_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  IF v_role_text IN ('admin', 'student') THEN
    v_role := v_role_text::user_role;
  ELSE
    v_role := 'student';
  END IF;

  LOOP
    BEGIN
      INSERT INTO public.users (id, email, username, password, role)
      VALUES (NEW.id, NEW.email, v_username, '', v_role);
      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
        v_attempt := v_attempt + 1;
        IF v_attempt > 10 THEN
          RAISE EXCEPTION 'Could not generate unique username for user %', NEW.id;
        END IF;
        v_username := v_base_username || '_' || SUBSTRING(MD5(NEW.id::text || CLOCK_TIMESTAMP()::text || v_attempt::text), 1, 6);
    END;
  END LOOP;

  IF v_role = 'admin' THEN
    INSERT INTO public.admins (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.students (id, total_score) VALUES (NEW.id, 0) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user failed for id=%, email=%: %', NEW.id, NEW.email, SQLERRM;
    RAISE;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
