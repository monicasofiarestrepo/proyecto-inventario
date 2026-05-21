# Command: /new-module

Crea un módulo NestJS en `backend/src/` siguiendo el skill `nest-module`.

## Uso

```
/new-module <nombre>
```

Ejemplo: `/new-module suppliers`

## Pasos

1. Crear carpeta `backend/src/<nombre>/`.
2. Generar archivos según `.cursor/skills/nest-module/SKILL.md`.
3. Registrar `<Nombre>Module` en `app.module.ts`.
4. Añadir tests unitarios mínimos (3 casos).
5. Si aplica cantidades, importar `quantity.util` y `UnitMeasure`.

## Checklist

- [ ] DTOs con validación
- [ ] Entity TypeORM si persiste datos
- [ ] Controller con rutas REST coherentes con PRD
- [ ] Service sin lógica en controller
- [ ] `*.service.spec.ts` pasa con `npm test`

## Referencias

- `backend/src/products/` — referencia CRUD
- `backend/src/movements/` — referencia transacciones
- `backend/src/inventory/` — referencia agregaciones
