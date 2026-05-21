# Modelo de datos — Inventario SYS

Modelo lógico alineado con las entidades TypeORM en `backend/src/`.

## Entidades

### `products`

| Campo | Tipo | Restricciones |
|-------|------|----------------|
| `id` | UUID | PK, generado |
| `name` | varchar | NOT NULL |
| `description` | text | default `''` |
| `unitMeasure` | enum | `unidades`, `kg`, `litros` |
| `category` | varchar | NOT NULL |
| `minStock` | decimal(12,3) | >= 0; entero si unidades |
| `active` | boolean | default `true` |
| `createdAt` | timestamp | auto |

### `movements`

| Campo | Tipo | Restricciones |
|-------|------|----------------|
| `id` | UUID | PK |
| `productId` | UUID | FK → `products.id`, RESTRICT |
| `type` | enum | `IN`, `OUT` |
| `quantity` | decimal(12,3) | > 0; reglas por unidad del producto |
| `reason` | enum | compra, venta, ajuste, merma, devolución |
| `createdAt` | timestamp | auto, inmutable |

## Reglas derivadas (no persistidas)

| Concepto | Cálculo |
|----------|---------|
| **Stock actual** | `SUM(IN) - SUM(OUT)` por `productId` |
| **Alerta** | `currentStock <= minStock` |
| **Borrado producto** | Si hay movimientos → `active = false`; sin movimientos → desactivación lógica igual |

## Validación de cantidades

| `unitMeasure` | `minStock` / `quantity` |
|---------------|-------------------------|
| `unidades` | Enteros >= 0 (mínimo) o > 0 (movimiento) |
| `kg`, `litros` | Hasta 3 decimales |

Implementación: [`backend/src/common/quantity.util.ts`](../backend/src/common/quantity.util.ts).

## Índices implícitos

- FK `movements.productId` para agregaciones de stock.
- Filtros en `GET /movements`: `productId`, `type`, `startDate`, `endDate`.
