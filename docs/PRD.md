# PRD — Sistema de Inventario SYS

## 1. Visión general

Sistema transaccional de inventario: catálogo de productos, movimientos IN/OUT, stock calculado en tiempo real y alertas por stock mínimo. Backend NestJS + PostgreSQL; frontend Expo (React Native Web) con estética retro cyberpunk.

## 2. URLs desplegadas

| Servicio | URL |
|----------|-----|
| Web | https://proyecto-inventario-8r82.onrender.com |
| API | https://inventario-api-yyie.onrender.com |

## 3. Alcance

- CRUD de productos (desactivación lógica si hay movimientos).
- Movimientos con validación de stock en salidas (transacción).
- Inventario agregado y endpoint de alertas low-stock.
- UI: lista (`/`), movimientos (`/movement`), catálogo (`/products`), historial (`/history`).

## 4. Stack técnico

| Capa | Tecnología |
|------|------------|
| Backend | NestJS, TypeORM, PostgreSQL, class-validator |
| Frontend | Expo Router 54, React Native Web, Axios, Cascadia Code |
| Tests | Jest, fast-check, Stryker, Playwright |
| CI/CD | GitHub Actions |
| Hosting | Render (API + Static Site + Postgres) |

## 5. Estructura del repositorio (implementada)

```text
proyecto-inventario/
├── backend/src/{products,movements,inventory,common}
├── frontend/app/{index,movement,products,history}.tsx
├── frontend/components/{atoms,molecules,organisms}
├── frontend/e2e/*.spec.ts
└── docs/
```

## 6. Criterios de aceptación globales

- [x] Todos los endpoints del enunciado responden correctamente.
- [x] Stock = SUM(IN) − SUM(OUT); no se persiste columna de stock.
- [x] OUT rechazado si quantity > stock (400).
- [x] Producto con movimientos: DELETE → `active: false`.
- [x] Frontend lista productos con badge si `stock <= minStock`.
- [x] Formulario movimiento valida cantidad y bloquea OUT excesivo.
- [x] Cantidades: enteros en unidades; hasta 3 decimales en kg/litros.
- [x] Pipeline CI y deploy en Render operativos.

## 7. Reglas de negocio

Ver [`modelo-datos.md`](modelo-datos.md) y [`user-stories.md`](user-stories.md).

## 8. Restricciones técnicas

- Node.js 20+.
- Variables: `DATABASE_URL`, `CORS_ORIGIN`, `EXPO_PUBLIC_API_URL`.
- Paleta UI fija en `frontend/constants/theme.ts`.

## 9. Matriz de endpoints

| Módulo | Método | Ruta |
|--------|--------|------|
| Products | POST, GET, GET/:id, PATCH, DELETE | `/products` |
| Movements | POST, GET, GET/:id | `/movements` |
| Inventory | GET, GET/:id, GET alerts | `/inventory`, `/inventory/alerts/low-stock` |

## 10. Calidad

- Unitarias: servicios NestJS (≥10 casos con borde/error).
- PBT: ≥3 propiedades de negocio (`quantity.util`, stock, alertas).
- Stryker: mutation score ≥ 70% en servicios críticos.
- E2E Playwright: `product-list.spec.ts`, `movement-form.spec.ts`.

Documentación relacionada: [`diagrama-er.md`](diagrama-er.md), [`diagrama-c4.md`](diagrama-c4.md), [`tickets.md`](tickets.md).
