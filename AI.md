Execution Plan
- I will implement this as a strict vertical flow: Controllers -> Services -> Supabase/CLI adapters -> DTO mapping -> HTTP response.
- I will keep raw Supabase records internal (Models), and ensure Controllers return DTOs only.
- I will proceed sequentially and stop after each phase for your validation if you want.
Phase 1 — Backend Base & DTOs*****************
- Create backend folders under backend/: DTOs/, Services/, Models/, Supabase/ (keep existing Controllers/).
- Supabase DI setup
  - Create backend/Supabase/SupabaseOptions.cs (URL + ServiceKey config model).
  - Create backend/Supabase/ISupabaseClientFactory.cs.
  - Create backend/Supabase/SupabaseClientFactory.cs (build/configure supabase-csharp client once).
  - Modify backend/Program.cs to register options + factory + services.
  - Modify backend/appsettings.json and backend/appsettings.Development.json with Supabase section placeholders.
- DTOs
  - Create backend/DTOs/LessonDto.cs
  - Create backend/DTOs/LessonDetailDto.cs
  - Create backend/DTOs/ExerciseDto.cs
  - Create backend/DTOs/CodeExecutionRequestDto.cs
  - Create backend/DTOs/CodeExecutionResponseDto.cs
- Internal raw models (non-response)
  - Create backend/Models/LessonModel.cs
  - Create backend/Models/ExerciseModel.cs
  - (If needed by current table structure) create lightweight row models for deserialization only.
- Outcome
  - Backend compiles with DI wired and DTO contract foundation ready.
Phase 2 — Content Services & Controllers***************
- Services
  - Create backend/Services/ILessonService.cs
  - Create backend/Services/LessonService.cs
  - Create backend/Services/IExerciseService.cs
  - Create backend/Services/ExerciseService.cs
  - Service responsibilities:
    - Query Supabase tables/views.
    - Map raw models -> DTOs.
    - Return clean contract objects (never DB-shaped payloads to controller).
- Controllers
  - Create backend/Controllers/LessonsController.cs
    - GET /api/lessons -> IEnumerable<LessonDto>
    - GET /api/lessons/{id} -> LessonDetailDto (lesson + exercises)
  - Create backend/Controllers/ExercisesController.cs
    - GET /api/exercises/general -> IEnumerable<ExerciseDto>
- Program wiring
  - Update backend/Program.cs for service DI registrations.
- Outcome
  - Core content endpoints available and returning DTOs only.
Phase 3 — Execution Engine (Core Feature)*****************
- Execution service
  - Create backend/Services/ICodeExecutionService.cs
  - Create backend/Services/CodeExecutionService.cs
  - Use System.Diagnostics.Process to call local MyAlgo CLI.
  - Capture stdout/stderr, exit code, elapsed time.
  - Add timeout/cancellation protection and safe temp-file handling.
- Configuration
  - Add MyAlgo settings (CLI path, timeout defaults) to:
    - backend/appsettings.json
    - backend/appsettings.Development.json
  - (Optional typed config model) backend/Models/MyAlgoOptions.cs
- Controller
  - Create backend/Controllers/CodeExecutionController.cs
    - POST /api/code/execute
    - Request: CodeExecutionRequestDto
    - Response: CodeExecutionResponseDto
- Outcome
  - End-to-end compile/run endpoint for MyAlgo code.
Phase 4 — Frontend Missing Pages (React -> .NET API only)*************
- Create API layer (frontend)
  - Create frontend/src/api/httpClient.ts (base URL + error normalization)
  - Create frontend/src/api/lessonsApi.ts
  - Create frontend/src/api/exercisesApi.ts
  - Create frontend/src/api/codeApi.ts
  - Add VITE_API_BASE_URL support (and update env example if present).
- Update pages/components
  - Update frontend/src/pages/student/LessonsBrowser.tsx to fetch /api/lessons.
  - Update frontend/src/pages/student/LessonDetail.tsx to fetch /api/lessons/{id}.
  - Create frontend/src/pages/student/ExercisesPage.tsx for /api/exercises/general.
  - Extract/create frontend/src/components/editor/CodeEditorComponent.tsx to POST /api/code/execute.
  - Update frontend/src/pages/student/CodeEditorWorkspace.tsx to use the component/API response.
  - Update frontend/src/App.tsx routes to expose the new exercises page.
- Legacy service cleanup
  - Replace Supabase-based calls in:
    - frontend/src/services/lessonService.js
    - frontend/src/services/exerciseService.js
  - Keep or deprecate these files depending on whether any legacy JSX pages still use them.
- Outcome
  - Lessons, lesson details, exercises, and code execution flow through ASP.NET API only.
Validation & Quality Gates (after each phase)
- Backend: dotnet build + quick endpoint smoke tests (Swagger/manual calls).
- Frontend: npm run build (or npm run lint if needed) + route checks.
- Functional checks:
  - /api/lessons, /api/lessons/{id}, /api/exercises/general, /api/code/execute return expected DTO shape.
  - No page in scope directly queries Supabase for content/execution flows.
Important Note Identified
- Current frontend auth still uses Supabase directly in frontend/src/context/AuthContext.jsx.
- Your architecture rule says frontend should only communicate with .NET API.
- My default for this migration: keep auth as-is for now (to avoid scope explosion) and fully enforce the rule for lessons/exercises/code execution first; then optionally add a dedicated auth-migration phase.

*****************************************************************************************************

Phase 5 — API Contract Stabilization************
- Add OpenAPI accuracy + response standards (error envelope, validation messages).
- Standardize DTO naming/fields for all current + future endpoints.
- Add global exception middleware for consistent 4xx/5xx.
- Files to add/modify (backend):
  - backend/Middleware/ExceptionHandlingMiddleware.cs (new)
  - backend/Program.cs (register middleware)
  - backend/DTOs/Common/ApiErrorDto.cs (new)
Phase 6 — Auth & Identity Through .NET API (Critical)*********
- Move frontend away from direct Supabase auth for business flows.
- Implement JWT validation in API, user-context resolution, role checks (student/admin).
- Add auth endpoints if needed (/api/auth/login, /api/auth/register, /api/auth/me) or at least token passthrough pattern.
- Update frontend auth layer to call backend only.
- Files:
  - Backend: backend/Controllers/AuthController.cs (new), backend/Services/AuthService.cs (new), backend/Program.cs (auth setup)
  - Frontend: frontend/src/context/AuthContext.jsx, frontend/src/hooks/useAuth.tsx, frontend/src/api/authApi.ts (new)
Phase 7 — Exercise Submission & Progress**************
- Implement missing endpoints:
  - POST /api/exercises/{id}/submit
  - POST /api/lessons/exercises/{id}/submit
  - GET /api/progress/me
- Map Supabase RPCs in backend service layer only.
- Replace temporary placeholders in frontend services.
- Files:
  - Backend: backend/Controllers/ProgressController.cs (new), backend/Services/ProgressService.cs (new), extend ExercisesController
  - Frontend: frontend/src/services/exerciseService.js, frontend/src/api/progressApi.ts (new), frontend/src/pages/student/Progress.tsx
Phase 8 — Admin Features (Production-ready)*****************************
- Build backend admin CRUD endpoints for lessons + exercises.
- Connect admin pages to live APIs (currently mostly static/mock).
- Add server-side role authorization on admin routes.
- Files:
  - Backend: backend/Controllers/AdminLessonsController.cs (new), backend/Controllers/AdminExercisesController.cs (new), admin services
  - Frontend: frontend/src/pages/admin/ManageLessons.tsx, frontend/src/pages/admin/AddPractice.tsx, frontend/src/pages/admin/ManageUsers.tsx, frontend/src/api/adminApi.ts (new)
Phase 9 — Student Product Completion*******************
- Dashboard data endpoints (/api/dashboard/me for stats, streak, recent activity).
- Lesson completion tracking.
- Hook daily challenge and leaderboard to real data.
- Files:
  - Backend: backend/Controllers/DashboardController.cs (new), service models/DTOs
  - Frontend: frontend/src/pages/student/Dashboard.tsx, frontend/src/pages/student/Leaderboard.tsx, frontend/src/pages/student/LessonDetail.tsx
Phase 10 — Quality, Security, DevOps
- Add test layers:
  - Unit tests for services
  - Integration tests for controllers
  - Frontend component/API tests
- Add environment hardening:
  - secrets handling, CORS policy by env, rate limiting on /api/code/execute
  - execution sandbox constraints (timeout, max output, process isolation)
- CI/CD:
  - backend build+test pipeline
  - frontend build+lint pipeline
  - optional Docker compose for local full stack
- Files:
  - backend.Tests/* (new test project)
  - frontend test setup files
  - .github/workflows/*.yml (new)
  - docker/ compose files (new)
---
Execution Order I Recommend
1. Phase 6 (Auth centralization)  
2. Phase 7 (Submissions + Progress)  
3. Phase 8 (Admin live CRUD)  
4. Phase 9 (Dashboard/engagement features)  
5. Phase 10 (hardening + CI/CD)
This order gives you a usable and secure MVP quickly, then completes management and polish.
