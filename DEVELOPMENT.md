# Development Setup

## Overview

This project now uses a **hybrid containerized development approach**:

- **Backend Services**: Run in Docker containers (PHP, MariaDB, Redis)
- **Frontend Apps**: Run locally with Vite dev servers for fast hot module reload

## Quick Start

### 1. Start Backend Services

```bash
docker-compose up -d
```

This starts:
- **Proto Backend**: `http://localhost:8080`
- **MariaDB**: `localhost:3307`
- **Redis**: `localhost:6380`
- **phpMyAdmin**: `http://localhost:8081`

### 2. Start Frontend Apps

Start each app in separate terminals:

```bash
# Main App
cd apps/main
npm run dev
# → http://localhost:3000

# CRM App
cd apps/crm
npm run dev
# → http://localhost:3001

# Developer App
cd apps/developer
npm run dev
# → http://localhost:3002
```

## Benefits

✅ **Fast Hot Module Reload**: Vite runs natively on host machine
✅ **Instant Changes**: File changes reflect immediately in browser
✅ **Clean Architecture**: Backend and frontend properly separated
✅ **Easy API Access**: Frontend apps proxy `/api` requests to containerized backend
✅ **CORS Configured**: Backend allows requests from all three frontend ports

## Development Workflow

1. **Backend Changes**: Edit PHP files → Changes reflect immediately (volume mounted)
2. **Frontend Changes**: Edit JS/CSS files → Hot reload updates browser instantly
3. **Database**: Use phpMyAdmin at `http://localhost:8081` or direct connection on port 3307
4. **API Testing**: Backend APIs available at `http://localhost:8080/api/*`

## Architecture

```
┌─────────────────────┐    ┌─────────────────────┐
│  Frontend (Host)    │    │  Backend (Docker)   │
│                     │    │                     │
│ Main:    :3000 ────────────► PHP:    :8080     │
│ CRM:     :3001 ────────────► MariaDB: :3307     │
│ Dev:     :3002 ────────────► Redis:   :6380     │
│                     │    │ Admin:   :8081     │
└─────────────────────┘    └─────────────────────┘
```

## Troubleshooting

### Backend Issues
- Check containers: `docker ps`
- View logs: `docker logs proto-web`
- Restart: `docker-compose restart`

### Frontend Issues
- Check Vite config: `apps/*/vite.config.js`
- Clear cache: `rm -rf apps/*/node_modules/.vite`
- Reinstall: `cd apps/main && npm install`

### CORS Issues
- Backend CORS configured in: `public/api/index.php`
- Allows: `localhost:3000`, `localhost:3001`, `localhost:3002`

## Previous Containerized Setup

The old setup containerized everything including Vite servers, which caused:
- Slow hot module reload (1+ minute delays)
- Complex volume mounting issues
- Unnecessary containerization overhead

This new approach is faster and simpler for local development.
