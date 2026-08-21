# GEMINI.md — Project: 2029

## What this is
A private, two-person relationship journal and memory archive. Text-only. Not a social app, not a SaaS product, not an admin dashboard, and **no AI functionality anywhere** — don't add Gemini/OpenAI/Claude API calls, AI summaries, or companions.

## Stack
- Frontend: React + TypeScript + Vite + React Router
- Backend: FastAPI + Python (Uvicorn)
- Database: PostgreSQL (SQLAlchemy + Pydantic v2)
- Zero Firebase / zero media storage dependencies.

## Architecture
- Client: `src/` (React SPA) communicating via REST with FastAPI backend (`VITE_API_BASE_URL`).
- Backend: `backend/app/` (FastAPI with routers for `auth`, `relationship`, `diary`, `milestones`, `meetings`, `plans`).
- Auth: JWT-based authentication with bcrypt password hashing. Two pre-seeded partner accounts. No public signups.

## UI directive — read this twice
Plain, unstyled HTML only: `<div> <button> <input> <textarea> <select>`. White/default background.

Do NOT add a CSS framework, component library, custom colors/gradients/shadows/animations, or spend time on responsive polish.

Why: a theme reference file will be provided later and applied across the whole app as one dedicated phase. Anything you style now is thrown-away work. Keep markup simple and semantic so that phase can hook into it.

## Non-negotiables
- Security is enforced server-side via FastAPI JWT bearer dependency (`get_current_user`).
- API logic lives in service modules (`src/services/`), not scattered in components.
- Don't weaken TypeScript to silence errors — fix the actual type issue.
- No media upload/storage — text-only.
