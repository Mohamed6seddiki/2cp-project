-- ============================================================
-- Promote existing Supabase account to ADMIN
-- Usage: replace v_email with the target account email, then run.
-- ============================================================

DO $$
DECLARE
  v_email TEXT := 'm_seddiki@estin.dz'; -- TODO: replace with real email
  v_user_id UUID;
  v_meta JSONB;
  v_username_base TEXT;
  v_username TEXT;
  v_attempt INT := 0;
BEGIN
  SELECT id, raw_user_meta_data
  INTO v_user_id
     , v_meta
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth.users account found for email: %', v_email;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    v_username_base := COALESCE(
      NULLIF(LOWER(REGEXP_REPLACE(v_meta->>'preferred_username', '[^a-z0-9_]+', '', 'g')), ''),
      NULLIF(LOWER(REGEXP_REPLACE(v_meta->>'name', '[^a-z0-9_]+', '', 'g')), ''),
      NULLIF(LOWER(REGEXP_REPLACE(v_meta->>'username', '[^a-z0-9_]+', '', 'g')), ''),
      NULLIF(LOWER(REGEXP_REPLACE(split_part(v_email, '@', 1), '[^a-z0-9_]+', '', 'g')), ''),
      'user_' || REPLACE(SUBSTRING(v_user_id::text, 1, 8), '-', '')
    );

    v_username := v_username_base;

    LOOP
      BEGIN
        INSERT INTO public.users (id, email, username, password, role)
        VALUES (v_user_id, v_email, v_username, '', 'student');
        EXIT;
      EXCEPTION
        WHEN unique_violation THEN
          v_attempt := v_attempt + 1;
          IF v_attempt > 10 THEN
            RAISE EXCEPTION 'Could not generate unique username for id=%', v_user_id;
          END IF;
          v_username := v_username_base || '_' || SUBSTRING(MD5(v_user_id::text || CLOCK_TIMESTAMP()::text || v_attempt::text), 1, 6);
      END;
    END LOOP;
  END IF;

  UPDATE public.users
  SET role = 'admin'
  WHERE id = v_user_id;

  INSERT INTO public.admins (id)
  VALUES (v_user_id)
  ON CONFLICT DO NOTHING;

  DELETE FROM public.students
  WHERE id = v_user_id;

  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
  WHERE id = v_user_id;

  RAISE NOTICE 'User % (%) promoted to admin successfully.', v_user_id, v_email;
END
$$;
