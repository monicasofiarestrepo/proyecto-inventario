# Estrategia de pruebas

## Backend

| Tipo | Ubicación | Comando |
|------|-----------|---------|
| Unitarias | `src/**/*.spec.ts` | `npm test` |
| PBT | `src/**/*.pbt.spec.ts` | `npm run test:pbt` |
| E2E API | `test/app.e2e-spec.ts` | `npm run test:e2e` |
| Mutation | Stryker | `npm run test:stryker` |

**Mutation score objetivo:** ≥ 70% en `quantity.util.ts`, `movements.service.ts`, `products.service.ts`.

## Frontend

| Tipo | Ubicación | Comando |
|------|-----------|---------|
| E2E UI | `e2e/*.spec.ts` | `npm run test:e2e` |

Requiere API accesible y build estático (`npm run build:web`).

## CI

GitHub Actions: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).
