# Backend — Inventario API

API REST construida con **NestJS**, **TypeORM** y **PostgreSQL**. Expone catálogo de productos, movimientos de inventario (entradas/salidas con transacciones en salidas) y consultas agregadas de stock con alertas de mínimo.

---

## Producción

| | |
|---|---|
| **URL base** | [https://inventario-api-yyie.onrender.com](https://inventario-api-yyie.onrender.com) |
| **Health check** | `GET /products` |
| **Plataforma** | [Render](https://render.com) (Web Service + Postgres) |

```bash
curl https://inventario-api-yyie.onrender.com/products
```

En el plan free, la primera petición tras inactividad puede tardar ~30–60 s.

---

## Módulos

| Módulo | Responsabilidad |
|--------|-----------------|
| **Products** | CRUD de productos; desactivación lógica si existen movimientos |
| **Movements** | Registro IN/OUT; validación de stock en salidas dentro de transacción |
| **Inventory** | Stock calculado (`SUM` de movimientos), detalle por producto y alertas `low-stock` |

### Reglas de negocio destacadas

- **Stock mínimo:** entero si `unitMeasure` es `unidades`; hasta **3 decimales** si es `kg` o `litros`.
- **Cantidad en movimientos:** misma regla según la unidad del producto.
- **Salida (OUT):** no permite cantidad mayor al stock disponible.
- **DELETE producto:** desactiva (`active: false`); no elimina físicamente si hay historial.

---

## Ejecución local

### Requisitos

- Node.js 20+
- Docker (Postgres vía `docker-compose`)

### Pasos

```bash
cd backend
docker compose up -d
cp .env.example .env
npm install
npm run start:dev
```

La API queda en **http://localhost:3000**.

### Variables de entorno

| Variable | Desarrollo | Producción (Render) |
|----------|------------|---------------------|
| `DATABASE_URL` | `postgresql://inventario:inventario@localhost:5432/inventario` | Internal Database URL |
| `NODE_ENV` | `development` | `production` |
| `CORS_ORIGIN` | `http://localhost:8081` | `https://proyecto-inventario-8r82.onrender.com` o `*` |
| `PORT` | `3000` (opcional) | Inyectado por Render |

Ver plantilla completa en [`.env.example`](.env.example).

> En producción, TypeORM usa `synchronize: true` para crear tablas al arrancar y SSL hacia Postgres.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con hot reload |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Producción (`node dist/main`) |
| `npm test` | Tests unitarios (Jest) |
| `npm run test:pbt` | Property-based tests (fast-check) |
| `npm run test:stryker` | Mutation testing |

---

## Endpoints

Base local: `http://localhost:3000` · Base prod: `https://inventario-api-yyie.onrender.com`

```
POST   /products
GET    /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id

POST   /movements
GET    /movements
GET    /movements/:id

GET    /inventory
GET    /inventory/:productId
GET    /inventory/alerts/low-stock
```

**Ejemplo — movimiento de entrada:**

```bash
curl -X POST http://localhost:3000/movements \
  -H "Content-Type: application/json" \
  -d '{
    "type": "IN",
    "quantity": 50,
    "productId": "<UUID_DEL_PRODUCTO>",
    "reason": "compra"
  }'
```

---

## Tests

```bash
npm install
npm test
npm run test:pbt
```

Requiere Postgres accesible (local con Docker o variables de CI).

---

## Despliegue en Render

| Campo | Valor |
|-------|--------|
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm run start:prod` |

Blueprint: [`render.yaml`](render.yaml).

---

## Volver al README principal

[Documentación general del proyecto](../README.md)
