# 2029 — Master Project Brief

This is the source of truth for the project.

## Product

2029 is a private digital relationship journal and memory archive for exactly two people. Text-only.

It supports:
- relationship info, relationship duration, marriage countdown
- diary entries (text-only)
- relationship milestones / timeline (text-only)
- upcoming meetings
- future plans

It is **not**: a social network, a SaaS product, an admin dashboard, a public website, or an AI chatbot.
**There is no AI functionality and no media/photo/audio uploads.**

## Stack & Architecture

- **Frontend**: React + TypeScript + Vite + React Router
- **Backend**: FastAPI + Python (Uvicorn)
- **Database**: PostgreSQL (SQLAlchemy ORM + Pydantic v2 schemas)

```
UI (React)
↓
Context / Hooks
↓
Services (REST Client)
↓
FastAPI Backend (/api/*)
↓
PostgreSQL Database
```

## Security & Auth

Exactly two accounts can access the system.
- Auth: JWT Bearer tokens issued via `POST /api/auth/login`.
- Protected Routes: All `/api/*` CRUD endpoints require authenticated JWT.
- Default seeded accounts:
  - Partner 1: `partner1@2029.app`
  - Partner 2: `partner2@2029.app`

## Database Schema

- `users` (id, name, email, password_hash, created_at, updated_at)
- `relationships` (id, partner1_id, partner2_id, partner1_name, partner2_name, start_date, marriage_date, created_at, updated_at)
- `diary_entries` (id, relationship_id, title, content, date, created_by, created_at, updated_at)
- `milestones` (id, relationship_id, title, description, date, created_by, created_at, updated_at)
- `meetings` (id, relationship_id, title, date, time, location, notes, completed, created_by, created_at, updated_at)
- `plans` (id, relationship_id, title, description, date, completed, created_by, created_at, updated_at)

## Development Setup

### Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend:
```bash
npm install
npm run dev
```

### Or using Docker Compose:
```bash
docker compose up -d
```
