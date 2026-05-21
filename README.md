# Inventario SYS

Sistema de gestión de inventario con **API REST** (NestJS + PostgreSQL) e **interfaz web** retro cyberpunk (Expo / React Native Web). Permite administrar productos, registrar movimientos de stock, consultar inventario en tiempo real y recibir alertas cuando el stock cae al mínimo configurado.

---

## Demo en producción

El proyecto está **completamente hosteado** en Render. Puedes evaluarlo sin instalar nada en tu máquina.

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación web** | [https://proyecto-inventario-8r82.onrender.com](https://proyecto-inventario-8r82.onrender.com/) | Interfaz estática (Expo export) |
| **API REST** | [https://inventario-api-yyie.onrender.com](https://inventario-api-yyie.onrender.com) | Backend NestJS + PostgreSQL |

> **Nota:** En el plan free de Render, la API puede tardar **30–60 segundos** en responder la primera petición tras un periodo de inactividad. La web estática no tiene ese retraso.

**Comprobación rápida de la API:**

```bash
curl https://inventario-api-yyie.onrender.com/products
```

Respuesta esperada: `[]` o un arreglo JSON de productos activos.

---

## Guía rápida para el evaluador

### Opción A — Solo navegador (recomendada)

1. Abre **[https://proyecto-inventario-8r82.onrender.com](https://proyecto-inventario-8r82.onrender.com/)**.
2. Espera unos segundos si la primera carga de datos tarda (API despertando).
3. Sigue el flujo de validación más abajo.

### Opción B — Frontend local + API en la nube

```bash
git clone https://github.com/monicasofiarestrepo/proyecto-inventario.git
cd proyecto-inventario/frontend
npm install
cp .env.example .env
npm run web
```

Abre en el navegador la URL que indique Expo (habitualmente `http://localhost:8081`). El `.env` ya apunta a la API de producción.

### Flujo sugerido de validación

| Paso | Ruta | Qué validar |
|------|------|-------------|
| 1 | `/products` | Crear producto (nombre, categoría, unidad, stock mínimo). Unidades = enteros; kg/litros = hasta 3 decimales. |
| 2 | `/` | Listado con stock actual y badge de alerta si `stock ≤ minStock`. |
| 3 | `/movement` | Entrada (IN) y salida (OUT). En OUT se muestra stock disponible y no permite excederlo. |
| 4 | `/history` | Historial con filtros por producto, tipo y fechas. |

---

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Backend** | NestJS, TypeORM, PostgreSQL, class-validator, Jest, fast-check |
| **Frontend** | Expo Router, React Native Web, Axios, tipografía Cascadia Code |
| **Infra** | Render (Web Service + Static Site + Postgres), GitHub Actions CI |

---

## Estructura del repositorio

```
proyecto-inventario/
├── backend/              # API NestJS
├── frontend/           # App web Expo
├── docs/               # PRD, user stories, tickets
├── prompts.md          # Prompts de desarrollo con IA
└── .github/workflows/  # CI (tests backend + lint frontend)
```

Documentación de producto: [`docs/PRD.md`](docs/PRD.md).

---

## API — Endpoints principales

**Base URL:** `https://inventario-api-yyie.onrender.com`

| Módulo | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| Products | `POST` | `/products` | Crear producto |
| Products | `GET` | `/products` | Listar activos |
| Products | `GET` | `/products/:id` | Detalle |
| Products | `PATCH` | `/products/:id` | Actualizar |
| Products | `DELETE` | `/products/:id` | Desactivar (lógico si hay movimientos) |
| Movements | `POST` | `/movements` | Registrar IN / OUT |
| Movements | `GET` | `/movements` | Historial (`productId`, `type`, `startDate`, `endDate`) |
| Movements | `GET` | `/movements/:id` | Detalle |
| Inventory | `GET` | `/inventory` | Stock de todos los productos |
| Inventory | `GET` | `/inventory/:productId` | Stock de un producto |
| Inventory | `GET` | `/inventory/alerts/low-stock` | Alertas de stock bajo |

**Ejemplo — crear producto:**

```bash
curl -X POST https://inventario-api-yyie.onrender.com/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tornillo M6",
    "description": "",
    "unitMeasure": "unidades",
    "category": "Ferretería",
    "minStock": 10
  }'
```

Detalle de módulos y scripts: [`backend/README.md`](backend/README.md).  
Pantallas y build web: [`frontend/README.md`](frontend/README.md).

---

## Ejecución local (stack completo)

Para desarrollar o depurar backend y base de datos en tu equipo.

### Requisitos

- Node.js **20+**
- npm
- Docker (solo para Postgres local)

### 1. Base de datos

```bash
cd backend
docker compose up -d
cp .env.example .env
```

### 2. Backend (puerto 3000)

```bash
cd backend
npm install
npm run start:dev
```

### 3. Frontend

**Contra API local:**

```bash
cd frontend
npm install
cp .env.example .env.local
# Edita .env.local: EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run web
```

**Contra API en Render** (sin levantar backend):

```bash
cd frontend
npm install
cp .env.example .env
npm run web
```

---

## Tests y CI

```bash
# Backend
cd backend && npm install
npm test
npm run test:pbt
npm run test:stryker

# Frontend E2E (API local + build estático)
cd frontend && npm install
cd ../backend && docker compose up -d && npm run start:dev
cd ../frontend
EXPO_PUBLIC_API_URL=http://localhost:3000 npm run build:web
PLAYWRIGHT_API_URL=http://localhost:3000 npm run test:e2e
```

![CI](https://github.com/monicasofiarestrepo/proyecto-inventario/actions/workflows/ci.yml/badge.svg)

El workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) ejecuta: tests unitarios, PBT, e2e API, Stryker (mutation score ≥ 70%), lint/tsc (frontend) y Playwright E2E (frontend con API en CI).

Mutation testing (última corrida local): **~78%** en `quantity.util`, `movements.service` y `products.service`.

---

## Despliegue (referencia)

| Componente | Plataforma | Configuración |
|------------|------------|---------------|
| API + DB | Render Web Service + Postgres | `backend/` — ver [`backend/render.yaml`](backend/render.yaml) |
| Web | Render Static Site | `frontend/` — build: `npx expo export --platform web`, publish: `dist` |

Variables clave en producción:

- **API:** `DATABASE_URL`, `NODE_ENV=production`, `CORS_ORIGIN=https://proyecto-inventario-8r82.onrender.com`
- **Web:** `EXPO_PUBLIC_API_URL=https://inventario-api-yyie.onrender.com`

---

## Repositorio

[github.com/monicasofiarestrepo/proyecto-inventario](https://github.com/monicasofiarestrepo/proyecto-inventario)
