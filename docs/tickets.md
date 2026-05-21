# Tickets de desarrollo

Backlog vinculado a [`user-stories.md`](user-stories.md). Stack real: **NestJS + Expo Router**.

---

## BACKEND-001 — Modelado y bootstrap

**US:** US01 | **Prioridad:** Alta

**Criterios de aceptación:**
- [x] Entidades `Product` y `Movement` con TypeORM
- [x] Enums `UnitMeasure`, `MovementType`, `MovementReason`
- [x] `ValidationPipe` global
- [x] `docker-compose` + `.env.example`

---

## BACKEND-002 — Módulos y reglas de negocio

**US:** US01, US02, US03, US04 | **Prioridad:** Alta

**Criterios de aceptación:**
- [x] CRUD `/products` con soft delete
- [x] `POST /movements` con transacción en OUT
- [x] `GET /inventory` y `/inventory/alerts/low-stock`
- [x] Filtros en `GET /movements`
- [x] `quantity.util` para unidades vs decimales

---

## FRONTEND-001 — Lista y tema retro

**US:** US-F01 | **Prioridad:** Media

**Criterios de aceptación:**
- [x] `frontend/app/index.tsx` con stock y `StockBadge`
- [x] `services/api.ts` → API Render
- [x] Tema en `constants/theme.ts`
- [x] `WebShell` con navegación

**Rutas:** `frontend/app/` (no `src/pages/`).

---

## FRONTEND-002 — Formulario de movimientos

**US:** US-F02 | **Prioridad:** Media

**Criterios de aceptación:**
- [x] `frontend/app/movement.tsx`
- [x] Stock disponible en OUT
- [x] Botón deshabilitado si cantidad > stock
- [x] Sanitización por unidad (`utils/quantity.ts`)

---

## FRONTEND-003 — Catálogo e historial

**US:** US01, US04 | **Prioridad:** Media

**Criterios de aceptación:**
- [x] `frontend/app/products.tsx` CRUD + chips categoría
- [x] `frontend/app/history.tsx` con filtros

---

## QA-001 — Pruebas y CI/CD

**US:** US02, US03, US-F01, US-F02 | **Prioridad:** Alta

**Criterios de aceptación:**
- [x] Jest unitarios en services
- [x] fast-check PBT (`*.pbt.spec.ts`, `quantity.pbt.spec.ts`)
- [x] Stryker en `movements`, `products`, `inventory` services
- [x] Playwright `frontend/e2e/product-list.spec.ts`, `movement-form.spec.ts`
- [x] `.github/workflows/ci.yml`

---

## DEVOPS-001 — Deploy Render

**Prioridad:** Alta

**Criterios de aceptación:**
- [x] API en Render + Postgres
- [x] Static site: `expo export --platform web` → `dist/`
- [x] `EXPO_PUBLIC_API_URL` y `CORS_ORIGIN` configurados
- [x] README con URLs de producción
