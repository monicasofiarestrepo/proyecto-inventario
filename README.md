# Sistema de gestión de inventario

Backend NestJS + frontend Expo (React) para catálogo, movimientos de stock, consulta de inventario y alertas de stock mínimo.

## Estructura

```
proyecto-inventario/
├── backend/     # NestJS, TypeORM, PostgreSQL
├── frontend/    # Expo Router, React Native Web
└── docs/        # PRD, user stories, tickets
```

## Ejecución local

### 1. Base de datos

```bash
cd backend
docker compose up -d
cp .env.example .env
```

`.env` por defecto apunta a `postgresql://inventario:inventario@localhost:5432/inventario`.

### 2. Backend (puerto 3000)

```bash
cd backend
npm install
npm run start:dev
```

Probar: `curl http://localhost:3000/products`

### 3. Frontend (web)

```bash
cd frontend
npm install
export EXPO_PUBLIC_API_URL=http://localhost:3000
npm run web
```

## Endpoints principales

| Módulo | Método | Ruta |
|--------|--------|------|
| Products | POST/GET/PATCH/DELETE | `/products`, `/products/:id` |
| Movements | POST/GET | `/movements`, `/movements/:id` |
| Inventory | GET | `/inventory`, `/inventory/:productId`, `/inventory/alerts/low-stock` |

## Tests

```bash
cd backend
npm test
npm run test:pbt
npm run test:stryker   # mutation testing (lento)
```

## Despliegue en Render

### PostgreSQL

1. [Render Dashboard](https://dashboard.render.com) → **New → PostgreSQL**
2. Copiar **Internal Database URL** → variable `DATABASE_URL`

### Web Service (API)

1. **New → Web Service** → repo GitHub, **Root Directory:** `backend`
2. **Build:** `npm install && npm run build`
3. **Start:** `npm run start:prod`
4. Variables de entorno:
   - `DATABASE_URL` — URL de Postgres Render
   - `NODE_ENV` — `production`
   - `CORS_ORIGIN` — URL del frontend (ej. `https://tu-frontend.onrender.com`)

### Frontend

En el build del Static Site o variables de Expo:

```
EXPO_PUBLIC_API_URL=https://tu-api.onrender.com
```

**URLs desplegadas (completar tras deploy):**

- API: `https://____________.onrender.com`
- Frontend: `https://____________.onrender.com`

## CI

GitHub Actions (`.github/workflows/ci.yml`) ejecuta build y tests del backend (con Postgres) y lint/typecheck del frontend en cada push/PR.
