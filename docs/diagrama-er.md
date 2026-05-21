# Diagrama entidad-relación

```mermaid
erDiagram
    PRODUCTS ||--o{ MOVEMENTS : registra

    PRODUCTS {
        uuid id PK
        string name
        text description
        enum unitMeasure
        string category
        decimal minStock
        boolean active
        timestamp createdAt
    }

    MOVEMENTS {
        uuid id PK
        uuid productId FK
        enum type
        decimal quantity
        enum reason
        timestamp createdAt
    }
```

## Cardinalidad

- Un **producto** tiene cero o muchos **movimientos**.
- Un **movimiento** pertenece a exactamente un **producto**.
- El stock no se almacena: se deriva de la suma de movimientos.

## Notas

- `type = IN` suma `quantity`; `type = OUT` resta.
- Eliminación de producto con historial: solo `active = false`.
