-- ============================================================
-- SUPABASE SCHEMA — 2cp Project
-- Safe to re-run (uses IF NOT EXISTS + DROP IF EXISTS)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_score INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lessons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  difficulty  difficulty_level NOT NULL,
  order_index INT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_exercises (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  points      INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS general_exercises (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty  difficulty_level NOT NULL,
  points      INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_lesson_exercises (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_exercise_id  UUID NOT NULL REFERENCES lesson_exercises(id) ON DELETE CASCADE,
  score               INT NOT NULL DEFAULT 0,
  completed           BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, lesson_exercise_id)
);

CREATE TABLE IF NOT EXISTS student_general_exercises (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exercise_id  UUID NOT NULL REFERENCES general_exercises(id) ON DELETE CASCADE,
  score        INT NOT NULL DEFAULT 0,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, exercise_id)
);

-- ============================================================
-- TRIGGER — Auto-create user profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_username TEXT;
  v_role     user_role;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  v_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'student'
  );

  INSERT INTO public.users (id, email, username, password, role)
  VALUES (NEW.id, NEW.email, v_username, '', v_role)
  ON CONFLICT (id) DO UPDATE SET
    email    = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.users.username);

  IF v_role = 'admin' THEN
    INSERT INTO public.admins (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.students (id, total_score) VALUES (NEW.id, 0) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ADMIN FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION create_lesson(
  p_title       TEXT,
  p_content     TEXT,
  p_difficulty  difficulty_level,
  p_order_index INT
)
RETURNS lessons
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_lesson lessons;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  INSERT INTO lessons (title, content, difficulty, order_index)
  VALUES (p_title, p_content, p_difficulty, p_order_index)
  RETURNING * INTO v_lesson;
  RETURN v_lesson;
END;
$$;

CREATE OR REPLACE FUNCTION delete_lesson(p_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  DELETE FROM lessons WHERE id = p_lesson_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION update_lesson(
  p_lesson_id   UUID,
  p_title       TEXT DEFAULT NULL,
  p_content     TEXT DEFAULT NULL,
  p_difficulty  difficulty_level DEFAULT NULL,
  p_order_index INT DEFAULT NULL
)
RETURNS lessons
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_lesson lessons;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  UPDATE lessons SET
    title       = COALESCE(p_title, title),
    content     = COALESCE(p_content, content),
    difficulty  = COALESCE(p_difficulty, difficulty),
    order_index = COALESCE(p_order_index, order_index)
  WHERE id = p_lesson_id
  RETURNING * INTO v_lesson;
  RETURN v_lesson;
END;
$$;

CREATE OR REPLACE FUNCTION create_lesson_exercise(
  p_lesson_id   UUID,
  p_title       TEXT,
  p_description TEXT,
  p_points      INT
)
RETURNS lesson_exercises
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_exercise lesson_exercises;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  INSERT INTO lesson_exercises (lesson_id, title, description, points)
  VALUES (p_lesson_id, p_title, p_description, p_points)
  RETURNING * INTO v_exercise;
  RETURN v_exercise;
END;
$$;

CREATE OR REPLACE FUNCTION delete_lesson_exercise(p_exercise_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  DELETE FROM lesson_exercises WHERE id = p_exercise_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION create_general_exercise(
  p_title       TEXT,
  p_description TEXT,
  p_difficulty  difficulty_level,
  p_points      INT
)
RETURNS general_exercises
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_exercise general_exercises;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  INSERT INTO general_exercises (title, description, difficulty, points)
  VALUES (p_title, p_description, p_difficulty, p_points)
  RETURNING * INTO v_exercise;
  RETURN v_exercise;
END;
$$;

CREATE OR REPLACE FUNCTION delete_general_exercise(p_exercise_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  DELETE FROM general_exercises WHERE id = p_exercise_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION manage_user_role(p_user_id UUID, p_new_role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_old_role user_role;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  SELECT role INTO v_old_role FROM users WHERE id = p_user_id;
  UPDATE users SET role = p_new_role WHERE id = p_user_id;
  IF p_new_role = 'admin' AND v_old_role = 'student' THEN
    DELETE FROM students WHERE id = p_user_id;
    INSERT INTO admins (id) VALUES (p_user_id) ON CONFLICT DO NOTHING;
  ELSIF p_new_role = 'student' AND v_old_role = 'admin' THEN
    DELETE FROM admins WHERE id = p_user_id;
    INSERT INTO students (id, total_score) VALUES (p_user_id, 0) ON CONFLICT DO NOTHING;
  END IF;
  RETURN TRUE;
END;
$$;

-- ============================================================
-- STUDENT FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION update_student_total_score(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_total INT;
BEGIN
  SELECT
    COALESCE((SELECT SUM(score) FROM student_lesson_exercises  WHERE student_id = p_student_id), 0) +
    COALESCE((SELECT SUM(score) FROM student_general_exercises WHERE student_id = p_student_id), 0)
  INTO v_total;
  UPDATE students SET total_score = v_total WHERE id = p_student_id;
END;
$$;

CREATE OR REPLACE FUNCTION submit_lesson_exercise(
  p_lesson_exercise_id UUID,
  p_score              INT
)
RETURNS student_lesson_exercises
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_record     student_lesson_exercises;
  v_max_points INT;
BEGIN
  SELECT points INTO v_max_points FROM lesson_exercises WHERE id = p_lesson_exercise_id;
  IF p_score > v_max_points THEN
    RAISE EXCEPTION 'Score % exceeds max points %', p_score, v_max_points;
  END IF;
  INSERT INTO student_lesson_exercises (student_id, lesson_exercise_id, score, completed)
  VALUES (auth.uid(), p_lesson_exercise_id, p_score, p_score > 0)
  ON CONFLICT (student_id, lesson_exercise_id)
  DO UPDATE SET score = p_score, completed = p_score > 0, submitted_at = NOW()
  RETURNING * INTO v_record;
  PERFORM update_student_total_score(auth.uid());
  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION submit_general_exercise(
  p_exercise_id UUID,
  p_score       INT
)
RETURNS student_general_exercises
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_record     student_general_exercises;
  v_max_points INT;
BEGIN
  SELECT points INTO v_max_points FROM general_exercises WHERE id = p_exercise_id;
  IF p_score > v_max_points THEN
    RAISE EXCEPTION 'Score % exceeds max points %', p_score, v_max_points;
  END IF;
  INSERT INTO student_general_exercises (student_id, exercise_id, score, completed)
  VALUES (auth.uid(), p_exercise_id, p_score, p_score > 0)
  ON CONFLICT (student_id, exercise_id)
  DO UPDATE SET score = p_score, completed = p_score > 0, submitted_at = NOW()
  RETURNING * INTO v_record;
  PERFORM update_student_total_score(auth.uid());
  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION view_student_progress(p_student_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_student_id UUID;
  v_result     JSON;
BEGIN
  v_student_id := COALESCE(p_student_id, auth.uid());
  IF v_student_id <> auth.uid() AND NOT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  SELECT json_build_object(
    'student_id',   s.id,
    'total_score',  s.total_score,
    'lesson_exercises', (
      SELECT json_agg(json_build_object(
        'exercise_id',  sle.lesson_exercise_id,
        'title',        le.title,
        'score',        sle.score,
        'completed',    sle.completed,
        'submitted_at', sle.submitted_at
      ))
      FROM student_lesson_exercises sle
      JOIN lesson_exercises le ON le.id = sle.lesson_exercise_id
      WHERE sle.student_id = s.id
    ),
    'general_exercises', (
      SELECT json_agg(json_build_object(
        'exercise_id',  sge.exercise_id,
        'title',        ge.title,
        'score',        sge.score,
        'completed',    sge.completed,
        'submitted_at', sge.submitted_at
      ))
      FROM student_general_exercises sge
      JOIN general_exercises ge ON ge.id = sge.exercise_id
      WHERE sge.student_id = s.id
    )
  ) INTO v_result
  FROM students s WHERE s.id = v_student_id;
  RETURN v_result;
END;
$$;

-- ============================================================
-- EVALUATE & CALCULATE SCORE FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION evaluate_lesson_exercise(p_exercise_id UUID, p_answers JSONB)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER
AS $$ BEGIN RETURN 0; END; $$;

CREATE OR REPLACE FUNCTION evaluate_general_exercise(p_exercise_id UUID, p_answers JSONB)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER
AS $$ BEGIN RETURN 0; END; $$;

CREATE OR REPLACE FUNCTION calculate_lesson_exercise_score(p_submission_id UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_score INT;
BEGIN
  SELECT score INTO v_score FROM student_lesson_exercises WHERE id = p_submission_id;
  RETURN COALESCE(v_score, 0);
END; $$;

CREATE OR REPLACE FUNCTION calculate_general_exercise_score(p_submission_id UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE v_score INT;
BEGIN
  SELECT score INTO v_score FROM student_general_exercises WHERE id = p_submission_id;
  RETURN COALESCE(v_score, 0);
END; $$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE students                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_lesson_exercises  ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_general_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_self"              ON users;
DROP POLICY IF EXISTS "admins_self"             ON admins;
DROP POLICY IF EXISTS "students_self"           ON students;
DROP POLICY IF EXISTS "lessons_read"            ON lessons;
DROP POLICY IF EXISTS "lessons_write"           ON lessons;
DROP POLICY IF EXISTS "lesson_exercises_read"   ON lesson_exercises;
DROP POLICY IF EXISTS "lesson_exercises_write"  ON lesson_exercises;
DROP POLICY IF EXISTS "general_exercises_read"  ON general_exercises;
DROP POLICY IF EXISTS "general_exercises_write" ON general_exercises;
DROP POLICY IF EXISTS "sle_policy"              ON student_lesson_exercises;
DROP POLICY IF EXISTS "sge_policy"              ON student_general_exercises;

CREATE POLICY "users_self" ON users
  FOR ALL USING (auth.uid() = id OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "admins_self" ON admins
  FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "students_self" ON students
  FOR ALL USING (auth.uid() = id OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "lessons_read" ON lessons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "lessons_write" ON lessons
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "lesson_exercises_read" ON lesson_exercises
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "lesson_exercises_write" ON lesson_exercises
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "general_exercises_read" ON general_exercises
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "general_exercises_write" ON general_exercises
  FOR ALL USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "sle_policy" ON student_lesson_exercises
  FOR ALL USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "sge_policy" ON student_general_exercises
  FOR ALL USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));