# Sistema de gestión de inventario

Backend NestJS + frontend Expo (React Native Web) para catálogo de productos, movimientos de stock, consulta de inventario en tiempo real y alertas de stock mínimo.

## URLs del sistema desplegado

| Servicio | URL |
|----------|-----|
| **API (Render)** | https://inventario-api-yyie.onrender.com |
| **Frontend** | Ejecución local (ver abajo). La interfaz web se abre en el navegador tras `npm run web`. |

Comprobación rápida de la API (el plan free puede tardar ~30–60 s en despertar):

```bash
curl https://inventario-api-yyie.onrender.com/products
```

Respuesta esperada: `[]` o un arreglo JSON de productos.

---

## Ejecución para el evaluador (solo frontend + API en Render)

No es necesario levantar backend ni base de datos en local: el frontend usa la API ya desplegada en Render.

### Requisitos

- Node.js 20 o superior
- npm

### Pasos

```bash
git clone https://github.com/monicasofiarestrepo/proyecto-inventario.git
cd proyecto-inventario/frontend
npm install
cp .env.example .env
npm run web
```

El archivo `frontend/.env.example` ya apunta a la API de producción:

```
EXPO_PUBLIC_API_URL=https://inventario-api-yyie.onrender.com
```

Abre en el navegador la URL que muestre Expo (suele ser `http://localhost:8081`).

### Flujo sugerido para validar funcionalidades

1. **Catálogo** (`/products`) — Crear un producto (nombre, categoría, unidad, stock mínimo).
2. **Productos** (`/`) — Listado con stock actual e indicador de alerta si `stock <= minStock`.
3. **Movimiento** (`/movement`) — Registrar entrada (IN) y luego salida (OUT); en salida se muestra stock disponible y no permite superar el límite.
4. **Historial** (`/history`) — Filtrar movimientos por producto, tipo y fechas.

---

## Estructura del repositorio

```
proyecto-inventario/
├── backend/          # NestJS, TypeORM, PostgreSQL
├── frontend/         # Expo Router, pantallas web
├── docs/             # PRD, user stories, tickets
├── prompts.md        # Prompts usados en el proyecto
└── .github/workflows/ci.yml
```

---

## Endpoints de la API (Render)

Base: `https://inventario-api-yyie.onrender.com`

| Módulo | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| Products | POST | `/products` | Crear producto |
| Products | GET | `/products` | Listar productos activos |
| Products | GET | `/products/:id` | Detalle |
| Products | PATCH | `/products/:id` | Actualizar |
| Products | DELETE | `/products/:id` | Desactivar (no borra si hay movimientos) |
| Movements | POST | `/movements` | Registrar entrada/salida |
| Movements | GET | `/movements` | Historial (filtros: `productId`, `type`, `startDate`, `endDate`) |
| Movements | GET | `/movements/:id` | Detalle |
| Inventory | GET | `/inventory` | Stock de todos los productos |
| Inventory | GET | `/inventory/:productId` | Stock de un producto |
| Inventory | GET | `/inventory/alerts/low-stock` | Productos en o bajo stock mínimo |

Ejemplo — crear producto:

```bash
curl -X POST https://inventario-api-yyie.onrender.com/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Tornillo M6","description":"","unitMeasure":"unidades","category":"Ferretería","minStock":10}'
```

---

## Ejecución local completa (opcional)

Para desarrollar o probar backend y base de datos en la máquina local.

### Base de datos

```bash
cd backend
docker compose up -d
cp .env.example .env
```

### Backend (puerto 3000)

```bash
cd backend
npm install
npm run start:dev
```

### Frontend apuntando al backend local

```bash
cd frontend
npm install
export EXPO_PUBLIC_API_URL=http://localhost:3000
npm run web
```

---

## Tests

```bash
cd backend
npm install
npm test
npm run test:pbt
```

El pipeline en `.github/workflows/ci.yml` ejecuta tests del backend (con Postgres) y lint/typecheck del frontend en cada push.

---

## Despliegue (referencia)

La API y PostgreSQL están en [Render](https://render.com). Configuración del Web Service:

- **Root Directory:** `backend`
- **Build:** `npm install --include=dev && npm run build`
- **Start:** `npm run start:prod`
- **Variables:** `DATABASE_URL`, `NODE_ENV=production`, `CORS_ORIGIN=*` (o URL del frontend)

Blueprint opcional: [`backend/render.yaml`](backend/render.yaml).
