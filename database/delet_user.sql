DO $$
DECLARE
  v_email TEXT := 'seddikimoh84@gmail.com';
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_email)
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.users WHERE id = v_user_id;
    DELETE FROM auth.users   WHERE id = v_user_id;
    RAISE NOTICE 'Deleted from auth + public for email % (id=%).', v_email, v_user_id;
  ELSE

    DELETE FROM public.users
    WHERE lower(email) = lower(v_email);

    RAISE NOTICE 'No auth.users row for %, deleted from public.users if existed.', v_email;
  END IF;
END
$$;