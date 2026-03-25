Perfect — here is a strict execution checklist (plan only, no code changes yet), optimized for the fastest path to a stable, presentable demo while preserving current architecture.
Execution Rules
- Move one phase at a time.
- Do not proceed if phase pass criteria fail.
- Prefer minimal, local fixes over refactors.
- Preserve existing stack and structure; no architecture rewrite.
- Labels:
  - [MUST NOW] = required for stable demo
  - [OPTIONAL LATER] = post-demo hardening
---
Phase 0 — Baseline & Safety Gate [MUST NOW] ***********
Goal
- Freeze current status and establish measurable baseline before edits.
Files involved
- No file edits in this phase.
Actions
- Confirm current failures/successes exactly as baseline.
Validation commands
- cd frontend && npm run lint
- cd frontend && npm run build
- cd backend && dotnet build backend.sln
- cd myalgo-engine && cmake -S . -B build && cmake --build build (expected currently failing due stale cache)
Pass criteria
- Baseline recorded with known failing points:
  - Frontend lint fails (known)
  - Frontend build passes
  - Backend build passes
  - C++ build fails due CMake cache mismatch
- If results differ, re-audit before Phase 1.
---
Phase 1 — Frontend Lint/Import Hygiene [MUST NOW] ***********************
Goal
- Make frontend lint clean without functional redesign.
Files involved
- frontend/src/hooks/useAuth.tsx
- frontend/src/pages/public/LandingPage.tsx
- frontend/src/pages/admin/ManageLessons.tsx
- frontend/src/pages/student/AIAssistant.tsx
- frontend/src/pages/student/CodeEditorWorkspace.tsx
- frontend/src/pages/student/Dashboard.tsx
- frontend/src/pages/student/Profile.tsx
What to fix per file
- useAuth.tsx: resolve Fast Refresh export pattern violation.
- LandingPage.tsx: remove unused Link import.
- ManageLessons.tsx: remove unused MoreHorizontal.
- AIAssistant.tsx: remove unused Search, Input.
- CodeEditorWorkspace.tsx: remove unused Sparkles (or restore its usage).
- student/Dashboard.tsx: remove unused Sparkles, MessageSquareIcon; normalize import placement (all imports at top).
- student/Profile.tsx: normalize extracted icon import location to top; remove import-order anomaly.
Validation commands
- cd frontend && npm run lint
- cd frontend && npm run build
Pass criteria
- npm run lint returns 0 errors.
- npm run build still passes.
- No route behavior changed yet.
---
Phase 2 — Auth Hook Consolidation & Import Consistency [MUST NOW] ***********************************
Goal
- Eliminate duplicate hook surface and prevent future import drift.
Files involved
- frontend/src/hooks/useAuth.tsx
- frontend/src/hooks/useAuth.js
- frontend/src/context/AuthContext.jsx
- All files importing useAuth (as needed after consolidation)
What to fix
- Keep one canonical useAuth module.
- Ensure all imports point to canonical file only.
- Preserve existing AuthContext behavior (no logic rewrite).
Validation commands
- cd frontend && npm run lint
- cd frontend && npm run build
- cd frontend && npm run dev (manual smoke)
Pass criteria
- No duplicate useAuth import paths left.
- Login/register/logout still compile and run.
- No runtime import resolution errors in browser console.
---
Phase 3 — Route Coherence and Page Source-of-Truth [MUST NOW] ******
Goal
- Remove route ambiguity and dead-path confusion while preserving UX.
Files involved
- frontend/src/App.tsx
- Candidate duplicate pages:
  - frontend/src/pages/Login.jsx
  - frontend/src/pages/Register.jsx
  - frontend/src/pages/Dashboard.jsx
  - frontend/src/pages/auth/LoginPage.tsx
  - frontend/src/pages/auth/RegisterPage.tsx
  - frontend/src/pages/student/Dashboard.tsx
- Navigation:
  - frontend/src/components/layout/Navbar.tsx
  - frontend/src/components/layout/AppLayout.tsx
  - frontend/src/components/layout/Sidebar.tsx (if retained)
What to fix
- Choose one canonical page set for each route (recommended: keep current active routes and remove unreachable duplicates from routing, not full deletion yet).
- Ensure /login, /register, /dashboard, /lessons/:lessonId, /lessons, /lesson/:id are intentional and non-conflicting.
- Ensure redirects (/auth/login, /auth/register) stay valid.
- Keep current layout structure; avoid redesign.
Validation commands
- cd frontend && npm run build
- cd frontend && npm run dev
- Manual route checks:
  - /
  - /login
  - /register
  - /dashboard (after auth)
  - /lessons
  - /lesson/dijkstra
  - /profile
  - /settings
  - /admin/dashboard (admin user)
Pass criteria
- All critical routes render without blank/error state.
- No import of pages that are no longer used by router.
- Auth-guarded routes redirect correctly.
---
Phase 4 — Supabase/Auth Session Reliability [MUST NOW]****************************
Goal
- Ensure auth/session and profile mapping are stable for demo flows.
Files involved
- frontend/src/lib/supabaseClient.js
- frontend/src/context/AuthContext.jsx
- frontend/src/components/ProtectedRoute.jsx
- frontend/src/pages/Login.jsx / chosen login page
- frontend/src/pages/Register.jsx / chosen register page
- Env templates:
  - frontend/.env.example
What to fix
- Keep env validation explicit (clear startup failure message).
- Keep current fallback profile mapping, but make behavior deterministic.
- Ensure register flow handles “email confirmation required” cleanly.
- Ensure logout path and guarded-route transitions are robust.
- Confirm .env.example includes all required keys used in code.
Validation commands
- cd frontend && npm run dev
- Manual auth flow:
  - Register new user
  - Confirm behavior when session absent/present
  - Login valid + invalid credentials
  - Reload browser (session persistence)
  - Logout and route guard check
Pass criteria
- No auth infinite loops.
- Session survives refresh when expected.
- User role gating works on protected routes.
- Error messages are user-readable and non-blocking.
---
Phase 5 — Demo Readiness Smoke Pack [MUST NOW]
Goal
- Confirm the project is demo-presentable end-to-end under current architecture.
Files involved
- No mandatory edits unless issues found.
What to verify
- Visual shell: landing, navbar, authenticated pages.
- Lesson browsing and detail routes.
- Admin route access behavior by role.
- No critical console errors in normal navigation.
Validation commands
- cd frontend && npm run lint && npm run build
- cd backend && dotnet build backend.sln
- Frontend manual smoke with browser devtools open.
Pass criteria
- Frontend lint/build green.
- Backend builds.
- Core demo journey works:
  - Landing → Register/Login → Student dashboard/pages
  - Admin account → admin pages
- No crash-level JS/runtime errors.
---
Phase 6 — Backend Minimal Legitimacy Cleanup [OPTIONAL LATER]
Goal
- Make backend non-placeholder without changing architecture.
Files involved
- backend/Controllers/testController.cs
- backend/Program.cs
- backend/appsettings.json
- backend/appsettings.Development.json
What to fix
- Rename/normalize controller class/method casing.
- Replace placeholder response with health/info endpoint.
- Add minimal CORS/auth scaffolding only if frontend-backend integration is planned now.
Validation commands
- cd backend && dotnet build backend.sln
- cd backend && dotnet run --project backend.csproj
- Hit swagger or endpoint manually.
Pass criteria
- Clean build and runnable API.
- Endpoint naming and response are production-credible (not placeholder text).
---
Phase 7 — C++ Engine Portability Repair [OPTIONAL LATER]
Goal
- Restore reproducible local build and run for MyAlgo engine.
Files involved
- myalgo-engine/build/CMakeCache.txt (recreate during implementation)
- myalgo-engine/CMakePresets.json
- myalgo-engine/src/main.cpp
- myalgo-engine/CMakeLists.txt
- myalgo-engine/README.md
What to fix
- Remove stale cache dependency on old machine paths.
- Add Linux-friendly preset/build path guidance.
- Fix executable naming/runtime mismatch across OS.
- Align generated compile standard with expected standard.
Validation commands
- cd myalgo-engine && cmake -S . -B build && cmake --build build
- Run one example:
  - ./build/myalgo examples/hello.algo (Linux/macOS path variant)
- Run one test scenario:
  - ./build/myalgo testes/test_if.algo
Pass criteria
- Fresh configure/build succeeds on current machine.
- At least one example and one test scenario run successfully.
---
Phase 8 — Dead Code Pruning & Documentation Sync [OPTIONAL LATER]
Goal
- Reduce maintenance risk after stable demo.
Files involved
- Unused pages/components identified in prior phases.
- AGENTS.md and project README(s).
What to fix
- Remove or archive dead duplicates only after router canonicalization is stable.
- Update docs with canonical routes, auth expectations, and build commands.
Validation commands
- cd frontend && npm run lint && npm run build
- cd backend && dotnet build backend.sln
- (if Phase 7 done) cd myalgo-engine && cmake --build build
Pass criteria
- No orphan imports, no dead routed pages, docs reflect reality.
---
Mandatory-Now vs Optional-Later Summary
- Mandatory now (stable demo path): Phases 0 → 5
- Optional later (post-demo hardening): Phases 6 → 8
If you want, next I can turn this into a task-by-task execution sheet with estimated effort (S/M/L) and risk level per task before implementation starts.