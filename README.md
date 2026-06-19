# tareka

**Track recycling. Prove impact. Earn rewards.**

tareka is a climate-tech platform built for Kenya. It verifies recycling drop-offs at partner sites, maintains auditable impact records, and supports partner-enabled rewards — including tokens, marketplace redemptions, and sats-based incentives where configured.

---

## Overview

| Layer | Path | Description |
| --- | --- | --- |
| **API** | `apps/api` | FastAPI backend — auth, drop-offs, wallets, company programmes, marketplace, payouts |
| **Web** | `apps/web` | Next.js 15 App Router frontend — marketing site, recycler dashboard, operator tools, company console, admin |

The repository is a two-app monorepo. Domain types live in `apps/web/types`; the API uses Pydantic schemas and SQLAlchemy models.

---

## Features

- **Verified drop-offs** — Operators log and confirm material intake at collection sites.
- **Impact records** — Recyclers build a contribution history tied to verified weigh-ins.
- **Partner rewards** — Companies configure programmes (tokens, discounts, marketplace, sats) per material type.
- **Marketplace** — Published partner catalogues and reward redemption flows.
- **Network visibility** — Public network map and directory for participating hubs.
- **Role-based access** — Separate experiences for recyclers, operators, company admins, and platform admins.
- **Bilingual UI** — English and Swahili using built-in frontend localization dictionaries. (`messages/en.ts`, `messages/sw.ts`)  

---

## Tech stack

**Backend:** Python 3.11 · FastAPI · SQLAlchemy 2 · Alembic · PostgreSQL 15 · Redis 7 · Celery · JWT auth

**Frontend:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · TanStack Query · Zustand · Axios

**Deployment:** Docker · Railway (`apps/api/railway.toml`)

---

## Prerequisites

- Python **3.11+**
- Node.js **20+** and npm **10+**
- PostgreSQL **15+**
- Redis **7+**
- Docker & Docker Compose (optional, for containerised local dev)

---

## Quick start (Docker Compose)

From the repository root:

```bash
cp .env.example .env
# Edit .env — at minimum SECRET_KEY for non-local use

docker compose up --build
```

| Service | URL |
| --- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/api/v1/docs |

> **Note:** Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1` in `apps/web/.env.local` when running the web app outside Docker Compose. Use `localhost`, not `127.0.0.1`, to avoid CORS mismatches with `ALLOWED_ORIGINS`.

---

## Local development

### 1. Environment

Copy example env files and configure credentials:

```bash
cp .env.example .env                    # API + shared secrets
cp apps/web/.env.example apps/web/.env.local
```

**Root / API (`.env`)**

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql://…`) |
| `REDIS_URL` | Yes | Redis connection string |
| `SECRET_KEY` | Yes | JWT signing secret — change in production |
| `ALLOWED_ORIGINS` | Yes | Comma-separated frontend origins (e.g. `http://localhost:3000`) |
| `ENVIRONMENT` | Yes | `development` or `production` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | Default `7` |
| `ANTHROPIC_API_KEY` | No | AI-assisted features |
| `KOTANI_API_KEY` | No | Sats payout integration |
| `AFRICASTALKING_*` | No | SMS / notifications (sandbox by default) |

**Web (`apps/web/.env.local`)**

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | FastAPI base URL including `/api/v1` |

### 2. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 3. Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

API: http://127.0.0.1:8000 · Health: http://127.0.0.1:8000/health

### 4. Frontend

```bash
cd apps/web
npm install
npm run dev
```

Web: http://localhost:3000

### 5. Useful scripts

```bash
# apps/web
npm run build        # production build
npm run type-check   # TypeScript validation
npm run start        # serve production build
npm run clean        # clear .next cache
```

---

## Database migrations

Migrations live in `apps/api/alembic/versions/`. On a fresh database:

```bash
cd apps/api
alembic upgrade head
```

To generate a new revision after model changes (development only):

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

Railway deployments run `alembic upgrade head` automatically via `docker-entrypoint.sh` before starting Uvicorn.

---

## API surface

All versioned routes are mounted at `/api/v1`.

| Area | Routers |
| --- | --- |
| Auth & users | `auth` |
| Drop-offs & sites | `dropoff`, `operator` |
| Wallets & payouts | `wallet`, `payout`, `sats_reward_channel` |
| Companies | `company`, `company_access`, `company_dashboard`, `company_rewards` |
| Catalogue & impact | `product`, `impact` |
| Platform admin | `platform` |

Interactive docs: `/api/v1/docs` · OpenAPI spec: `/api/v1/openapi.json`

---

## Web routes

### Public (marketing)

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/network` | Network impact & constellation map |
| `/directory` | Hub directory |
| `/marketplace` | Partner rewards catalogue |
| `/for-companies` | Company onboarding & product story |

### Authenticated

| Role | Home route | Key paths |
| --- | --- | --- |
| `recycler` | `/dashboard` | `/wallet`, `/history`, `/settings`, `/site/[id]` |
| `operator` | `/operator/quick-log` | `/operator/history`, `/operator/verifications` |
| `company_admin` | `/company/dashboard` | `/company/rewards`, `/company/settings` |
| `platform_admin` | `/admin` | `/admin/settings` |

Auth entry points: `/auth/login`, `/auth/register` · Company portal: `/company/login`, `/company/request-access`

Role routing is centralised in `apps/web/lib/auth-routing.ts`.

---

## Deployment (Railway)

**API service** (`apps/api`)

1. Connect the repository and set the service root to `apps/api`.
2. Railway uses `Dockerfile` + `railway.toml` (health check: `/health`).
3. Set all required environment variables (see table above). `postgres://` URLs are normalised to `postgresql://` automatically.
4. Ensure `ALLOWED_ORIGINS` includes the deployed web origin.

**Web service** (`apps/web`)

1. Set build/start commands for Next.js (`npm run build` / `npm run start`).
2. Set `NEXT_PUBLIC_API_BASE_URL` to the production API URL (including `/api/v1`).

Before staging or production cutover, confirm migrations apply cleanly on a fresh PostgreSQL instance and that `/health` returns `200`.

---

## Repository structure

```text
.
├── apps/
│   ├── api/
│   │   ├── alembic/              # Database migrations
│   │   ├── app/
│   │   │   ├── api/routes/       # Route registration
│   │   │   ├── controllers/      # HTTP handlers
│   │   │   ├── core/             # Config, security, rate limits
│   │   │   ├── db/               # Session, base models
│   │   │   ├── models/           # SQLAlchemy models
│   │   │   ├── repositories/     # Data access
│   │   │   ├── schemas/          # Pydantic request/response types
│   │   │   ├── services/         # Business logic
│   │   │   └── utils/
│   │   ├── docker-entrypoint.sh
│   │   ├── Dockerfile
│   │   ├── railway.toml
│   │   └── requirements.txt
│   └── web/
│       ├── app/                  # Next.js App Router pages & layouts
│       ├── components/           # Shared UI
│       ├── lib/                  # Auth routing, API client, i18n, utilities
│       ├── messages/             # en / sw translations
│       ├── services/             # Typed API service layer
│       ├── store/                # Zustand stores
│       └── types/                # Shared TypeScript domain types
├── docker-compose.yml            # Local Postgres, Redis, API, Web
├── .env.example                  # API environment template
└── README.md
```

---

## Architecture notes

**API** follows a layered pattern: routes → controllers → services → repositories → models. Validation uses Pydantic; persistence uses SQLAlchemy 2 with Alembic migrations.

**Web** uses a typed service layer (`services/`) over Axios, TanStack Query for server state, and Zustand for auth session state. Public marketing pages may use curated fallback data where live API data is not yet wired; authenticated areas call the API directly.

---

## Support

For questions about setup, deployment, or contributing, open an issue in the project repository or contact the tareka team.
