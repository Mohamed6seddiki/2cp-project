# ============================================================
# SUPABASE REFERENCE — 2cp Project
# ============================================================

Project URL: https://ekpvjnxplmmzwlqzdcgj.supabase.co


# ============================================================
# ENUMS
# ============================================================

user_role        → 'admin' | 'student'
difficulty_level → 'easy'  | 'medium' | 'hard'


# ============================================================
# TABLES
# ============================================================

## users
| Column     | Type      | Notes                    |
|------------|-----------|--------------------------|
| id         | UUID      | PRIMARY KEY              |
| email      | TEXT      | UNIQUE NOT NULL          |
| username   | TEXT      | UNIQUE NOT NULL          |
| password   | TEXT      | Managed by Supabase Auth |
| role       | user_role | DEFAULT 'student'        |
| created_at | TIMESTAMP | DEFAULT NOW()            |

## admins
| Column | Type | Notes                           |
|--------|------|---------------------------------|
| id     | UUID | FK → users.id ON DELETE CASCADE |

## students
| Column      | Type | Notes                           |
|-------------|------|---------------------------------|
| id          | UUID | FK → users.id ON DELETE CASCADE |
| total_score | INT  | DEFAULT 0                       |

## lessons
| Column      | Type             | Notes         |
|-------------|------------------|---------------|
| id          | UUID             | PRIMARY KEY   |
| title       | TEXT             | NOT NULL      |
| content     | TEXT             | NOT NULL      |
| difficulty  | difficulty_level | NOT NULL      |
| order_index | INT              | NOT NULL      |
| created_at  | TIMESTAMP        | DEFAULT NOW() |

## lesson_exercises
| Column      | Type      | Notes                             |
|-------------|-----------|-----------------------------------|
| id          | UUID      | PRIMARY KEY                       |
| lesson_id   | UUID      | FK → lessons.id ON DELETE CASCADE |
| title       | TEXT      | NOT NULL                          |
| description | TEXT      | NOT NULL                          |
| points      | INT       | DEFAULT 0                         |
| created_at  | TIMESTAMP | DEFAULT NOW()                     |

## general_exercises
| Column      | Type             | Notes         |
|-------------|------------------|---------------|
| id          | UUID             | PRIMARY KEY   |
| title       | TEXT             | NOT NULL      |
| description | TEXT             | NOT NULL      |
| difficulty  | difficulty_level | NOT NULL      |
| points      | INT              | DEFAULT 0     |
| created_at  | TIMESTAMP        | DEFAULT NOW() |

## student_lesson_exercises
| Column             | Type      | Notes                                      |
|--------------------|-----------|--------------------------------------------|
| id                 | UUID      | PRIMARY KEY                                |
| student_id         | UUID      | FK → students.id ON DELETE CASCADE         |
| lesson_exercise_id | UUID      | FK → lesson_exercises.id ON DELETE CASCADE |
| score              | INT       | DEFAULT 0                                  |
| completed          | BOOLEAN   | DEFAULT FALSE                              |
| submitted_at       | TIMESTAMP | DEFAULT NOW()                              |
| UNIQUE             |           | (student_id, lesson_exercise_id)           |

## student_general_exercises
| Column       | Type      | Notes                                       |
|--------------|-----------|---------------------------------------------|
| id           | UUID      | PRIMARY KEY                                 |
| student_id   | UUID      | FK → students.id ON DELETE CASCADE          |
| exercise_id  | UUID      | FK → general_exercises.id ON DELETE CASCADE |
| score        | INT       | DEFAULT 0                                   |
| completed    | BOOLEAN   | DEFAULT FALSE                               |
| submitted_at | TIMESTAMP | DEFAULT NOW()                               |
| UNIQUE       |           | (student_id, exercise_id)                   |


# ============================================================
# TRIGGERS
# ============================================================

## on_auth_user_created
- Table  : auth.users
- Event  : AFTER INSERT
- Action : Automatically creates a record in users + students or admins
           on every new signup (Email or Google)


# ============================================================
# FUNCTIONS (RPC)
# ============================================================
# Usage from React:
# supabase.rpc('function_name', { param: value })
# ============================================================

## Auth (managed directly by Supabase Auth)
  supabase.auth.signUp({ email, password, options })
  supabase.auth.signInWithPassword({ email, password })
  supabase.auth.signInWithOAuth({ provider: 'google' })
  supabase.auth.signOut()
  supabase.auth.getUser()

## Admin Functions
| Function                | Parameters                                              |
|-------------------------|---------------------------------------------------------|
| create_lesson           | p_title, p_content, p_difficulty, p_order_index         |
| delete_lesson           | p_lesson_id                                             |
| update_lesson           | p_lesson_id, p_title?, p_content?, p_difficulty?,       |
|                         | p_order_index?                                          |
| create_lesson_exercise  | p_lesson_id, p_title, p_description, p_points           |
| delete_lesson_exercise  | p_exercise_id                                           |
| create_general_exercise | p_title, p_description, p_difficulty, p_points          |
| delete_general_exercise | p_exercise_id                                           |
| manage_user_role        | p_user_id, p_new_role                                   |

## Student Functions
| Function                | Parameters                                              |
|-------------------------|---------------------------------------------------------|
| submit_lesson_exercise  | p_lesson_exercise_id, p_score                           |
| submit_general_exercise | p_exercise_id, p_score                                  |
| view_student_progress   | p_student_id? (null = current user)                     |

## Helper Functions
| Function                          | Parameters                          |
|-----------------------------------|-------------------------------------|
| update_student_total_score        | p_student_id                        |
| evaluate_lesson_exercise          | p_exercise_id, p_answers (JSONB)    |
| evaluate_general_exercise         | p_exercise_id, p_answers (JSONB)    |
| calculate_lesson_exercise_score   | p_submission_id                     |
| calculate_general_exercise_score  | p_submission_id                     |


# ============================================================
# ROW LEVEL SECURITY (RLS)
# ============================================================

| Table                      | Policy                                            |
|----------------------------|---------------------------------------------------|
| users                      | Each user sees own data only / Admin sees all     |
| admins                     | Admin can read only                               |
| students                   | Each student sees own data only / Admin sees all  |
| lessons                    | Read: all authenticated / Write: Admin only       |
| lesson_exercises           | Read: all authenticated / Write: Admin only       |
| general_exercises          | Read: all authenticated / Write: Admin only       |
| student_lesson_exercises   | Student sees own only / Admin sees all            |
| student_general_exercises  | Student sees own only / Admin sees all            |


# ============================================================
# REACT USAGE EXAMPLES
# ============================================================

## Register a new student
supabase.auth.signUp({
  email: 'student@email.com',
  password: '123456',
  options: { data: { username: 'ahmed', role: 'student' } }
})

## Sign in with email
supabase.auth.signInWithPassword({
  email: 'student@email.com',
  password: '123456'
})

## Sign in with Google
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin + '/dashboard' }
})

## Get all lessons
supabase.from('lessons').select('*').order('order_index')

## Get exercises for a specific lesson
supabase.from('lesson_exercises').select('*').eq('lesson_id', lessonId)

## Get all general exercises
supabase.from('general_exercises').select('*')

## Create a lesson (Admin only)
supabase.rpc('create_lesson', {
  p_title: 'Lesson 1',
  p_content: 'Content here',
  p_difficulty: 'easy',
  p_order_index: 1
})

## Update a lesson (Admin only)
supabase.rpc('update_lesson', {
  p_lesson_id: 'uuid-here',
  p_title: 'Updated Title'
})

## Delete a lesson (Admin only)
supabase.rpc('delete_lesson', { p_lesson_id: 'uuid-here' })

## Create lesson exercise (Admin only)
supabase.rpc('create_lesson_exercise', {
  p_lesson_id: 'uuid-here',
  p_title: 'Exercise 1',
  p_description: 'Description here',
  p_points: 100
})

## Submit a lesson exercise (Student)
supabase.rpc('submit_lesson_exercise', {
  p_lesson_exercise_id: 'uuid-here',
  p_score: 80
})

## Submit a general exercise (Student)
supabase.rpc('submit_general_exercise', {
  p_exercise_id: 'uuid-here',
  p_score: 90
})

## View student progress (current user)
supabase.rpc('view_student_progress')

## View specific student progress (Admin)
supabase.rpc('view_student_progress', { p_student_id: 'uuid-here' })

## Change user role (Admin only)
supabase.rpc('manage_user_role', {
  p_user_id: 'uuid-here',
  p_new_role: 'admin'
})
