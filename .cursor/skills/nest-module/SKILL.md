---
name: nest-module
description: Genera un módulo NestJS completo para proyecto-inventario (controller, service, dto, entity, spec). Usar al crear features en backend/.
---

# Skill: NestJS module (inventario)

## Cuándo usar

Al añadir un módulo bajo `backend/src/` (products, movements, inventory pattern).

## Antes de generar

1. Leer `docs/PRD.md` y `docs/user-stories.md`.
2. Seguir `.cursor/rules/backend-guidelines.mdc`.
3. Si el módulo maneja cantidades, reutilizar `common/quantity.util.ts`.

## Estructura obligatoria

```text
backend/src/<nombre>/
├── <nombre>.module.ts
├── <nombre>.controller.ts
├── <nombre>.service.ts
├── <nombre>.service.spec.ts
├── dto/
│   ├── create-<nombre>.dto.ts
│   └── update-<nombre>.dto.ts
└── entities/
    └── <nombre>.entity.ts
```

## Reglas

- Controller: solo HTTP; DTOs con `class-validator`.
- Service: lógica de negocio; `BadRequestException` / `NotFoundException`.
- Stock: QueryBuilder con `SUM(CASE WHEN...)`, no loops en Node.
- OUT movements: `dataSource.transaction()` si aplica.
- Tests: happy path + error + borde en `.service.spec.ts`.
- Sin `any`; imports desde `common/enums` si hay enums.

## Registrar módulo

Importar en `app.module.ts` y exportar service si otro módulo lo consume.

## Plantilla service spec

```typescript
describe('XService', () => {
  // mock Repository con getRepositoryToken
  it('happy path', async () => { ... });
  it('throws NotFoundException', async () => { ... });
  it('throws BadRequestException on invalid input', async () => { ... });
});
```
