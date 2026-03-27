# MAD Project - Setup & Progress Guide

## Last Updated
2026-03-27

## Project Structure

```
mad/
├── backend/              # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── routes/       # API route definitions
│   │   ├── utils/        # Database, Redis helpers
│   │   ├── validations/  # Zod schemas
│   │   └── server.ts     # Express server entry
│   ├── prisma/           # Database schema & migrations
│   ├── docker-compose.yml # Postgres, Redis, n8n
│   ├── Dockerfile        # Backend container
│   └── .env              # Environment variables (create from template)
│
├── src/                  # Frontend React app
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── api/client.js    # Axios client with auth interceptor
│   └── index.css        # Global styles
│
├── .gitignore           # Ignores for both frontend & backend
├── vite.config.js       # Vite config with API proxy
└── package.json         # Root scripts for both services

```

## What We Accomplished (2026-03-27)

### ✅ Backend Integration
- Copied backend from `C:\Projects\mad-backend` into `backend/` folder
- Updated root `.gitignore` to exclude backend artifacts
- Added root `package.json` scripts for concurrent development

### ✅ Configuration Changes
- **Vite Proxy**: Added `/api` proxy to `http://localhost:3001` in `vite.config.js`
- **API Client**: Changed baseURL to relative `/api/v1` (works with proxy)
- **Concurrently**: Added dev dependency to run both services
- **Scripts**:
  - `npm run dev` - Start both frontend + backend
  - `npm run dev:frontend` - Start only frontend
  - `npm run dev:backend` - Start only backend
  - `npm run install:all` - Install all dependencies

### ✅ Bug Fixes Applied
1. **JWT Secrets Error**: Moved `import 'dotenv/config'` to top of `server.ts` to load `.env` before any code
2. **Express-Validator Issues**: Removed incorrect `.array().length(1)` usage from all route files (validation now handled by Zod in controllers)
3. **Invalid 404 Handler**: Fixed `app.use('*', ...)` to `app.use((req, res) => ...)` for Express 5 compatibility
4. **CSS Import Order**: Moved `@import` to very top of `index.css` to satisfy CSS parser

### ✅ Environment Setup
- Created `backend/.env` with all required variables
- Prisma client generated
- Docker services defined (Postgres, Redis, n8n)

---

## How to Run (Next Time)

### 1. **Start Database & Redis**
```bash
cd backend
docker-compose up -d postgres redis
```
Wait ~10 seconds for databases to initialize.

### 2. **Start Development Servers**
From project root:
```bash
npm run dev
```

### 3. **Verify It's Working**

**Frontend**: Open browser → `http://localhost:5173`

**Backend Health**: `http://localhost:3001/health`
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...,
  "environment": "development"
}
```

**API Endpoints**:
- `GET /api/v1/artists`
- `GET /api/v1/concerts`
- `POST /api/v1/auth/login`
- etc.

---

## Database Setup

The backend uses Prisma with PostgreSQL. When ready to initialize the database:

```bash
cd backend

# Option 1: Push schema to database (creates tables)
npx prisma db push

# Option 2: Create a migration (recommended for changes)
npx prisma migrate dev --name init

# Optional: Seed database with sample data
npx prisma db seed
```

---

## Current State & Next Steps

### ✅ Working Now
- [x] Frontend + Backend in single repo
- [x] Dev server proxy configured
- [x] Both services run with `npm run dev`
- [x] Backend starts without crashing (when Docker DB not running, shows DB errors on API calls)

### ⚠️ Pending Tasks
- [ ] **Initialize Database**: Run `prisma db push` to create tables
- [ ] **Add CORS origin** to `.env` if frontend runs on different port
- [ ] **Configure secrets** in `.env` for production (change from defaults)
- [ ] **Docker Compose for entire stack**: Consider adding frontend build to docker-compose
- [ ] **Environment-specific configs** (production vs development)
- [ ] **Add seed data** for testing
- [ ] **Set up user authentication flow** (first admin user)
- [ ] **Test all API endpoints** after DB setup

### Known Issues
- Database tables don't exist yet → API calls return `DATABASE_ERROR`
- Need to run `prisma db push` before using any data features
- Docker compose only starts Postgres/Redis; API runs directly via `npm run dev`

---

## Important Files to Know

| File | Purpose |
|------|---------|
| `backend/.env` | Backend secrets & DB config (keep out of Git) |
| `backend/prisma/schema.prisma` | Database schema definition |
| `backend/src/server.ts` | Express server - main entry point |
| `src/api/client.js` | Frontend API client with auth |
| `vite.config.js` | Frontend build config + API proxy |

---

## Git Status

**All changes committed?** Not yet. We modified:
- `.gitignore`
- `package.json`
- `vite.config.js`
- `src/api/client.js`
- `src/index.css`
- Added `backend/` folder
- Added `.env` (but it's gitignored)

**Before pushing:**
1. Ensure `.env` is properly gitignored ✅
2. Run `git add -A` and commit
3. Verify backend compiles: `cd backend && npm run build`
4. Consider adding `backend/package-lock.json` to git (it is)

---

## Troubleshooting

### "JWT secrets not configured"
- Ensure `backend/.env` exists with `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Verify `dotenv/config` is first import in `server.ts`

### Port already in use
- Frontend: port 5173 (change in `vite.config.js` or `.env`)
- Backend: port 3001 (change in `backend/.env`)

### Database errors
- Start Postgres & Redis: `cd backend && docker-compose up -d`
- Check connection: `DATABASE_URL` in `.env`
- Run migrations: `npx prisma db push`

### Module not found errors
- Install dependencies: `npm run install:all`
- Backend: `cd backend && npm install`

---

## Notes for Next Session

- Database needs to be initialized (prisma db push)
- After DB setup, will need to create an admin user
- Consider implementing auth flow (login/register)
- Check all API endpoints work
- Potentially add Docker multi-stage build for full stack deployment
- Add error handling for DB/Redis connection failures

---

## Questions for Next Time

1. Do you want to set up the database schema now?
2. Should we create seed data for testing?
3. Any specific API endpoints you want to test first?
4. Do you need Docker compose to also build/start the frontend container?

---

**Remember**: The `.env` file contains secrets and is gitignored. Create it from the template provided above when cloning on a new machine.
