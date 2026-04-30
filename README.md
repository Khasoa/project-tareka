# tareka

Track recycling. Prove impact. Earn rewards.

tareka is a production-focused climate-tech platform for Kenya that verifies recycling drop-offs, builds trusted impact records, and supports rewards where enabled by partner companies.

## Monorepo overview

- `apps/api`: FastAPI backend with MVC + Service + Repository architecture
- `apps/web`: Next.js App Router frontend with Tailwind, Zustand, and typed services
- `packages/types`: shared TypeScript domain types
- `packages/config`: shared frontend config presets
- `infra`: infrastructure-related assets

## Local setup

### 1) Prerequisites

- Python 3.10+
- Node.js 20+
- npm 10+
- PostgreSQL 15+
- Redis 7+

### 2) Environment

Copy `.env.example` into local env files:

- Backend: `apps/api/.env`
- Frontend (optional): `apps/web/.env.local`

At minimum, set:

- `DATABASE_URL`
- `REDIS_URL`
- `SECRET_KEY`

## Backend run steps

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend target: `http://127.0.0.1:8000`

## Redis + Celery local run

Start Redis locally:

```bash
sudo service redis-server start
```

Start a Celery worker:

```bash
cd apps/api
source .venv/bin/activate
python -m celery -A app.core.celery_app worker --loglevel=info
```

## Frontend run steps

```bash
cd apps/web
npm install
npm run dev
```

Frontend target: `http://localhost:3000`

## Database migration steps

```bash
cd apps/api
python3 -m alembic revision --autogenerate -m "init schema"
python3 -m alembic upgrade head
```

## Folder structure

```text
.
├── apps
│   ├── api
│   │   ├── alembic
│   │   ├── alembic.ini
│   │   ├── app
│   │   │   ├── api
│   │   │   ├── controllers
│   │   │   ├── core
│   │   │   ├── db
│   │   │   ├── models
│   │   │   ├── repositories
│   │   │   ├── schemas
│   │   │   ├── services
│   │   │   └── utils
│   │   └── requirements.txt
│   └── web
│       ├── app
│       ├── lib
│       ├── store
│       └── types
├── packages
│   ├── config
│   └── types
└── infra
```
