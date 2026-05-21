# Frontend — Inventario SYS (Web)

Interfaz web del sistema de inventario, construida con **Expo Router** y **React Native Web**. Estética retro cyberpunk (paleta oscura, neón morado/rosa, tipografía Cascadia Code) y consumo de la API REST vía Axios.

---

## Producción

| | |
|---|---|
| **Aplicación** | [https://proyecto-inventario-8r82.onrender.com](https://proyecto-inventario-8r82.onrender.com/) |
| **API consumida** | [https://inventario-api-yyie.onrender.com](https://inventario-api-yyie.onrender.com) |
| **Hosting** | Render Static Site (`expo export --platform web`) |

Abre el enlace y usa el flujo: **Catálogo → Productos → Movimiento → Historial**.

---

## Pantallas

| Ruta | Función |
|------|---------|
| `/` | Lista de productos con stock y alertas |
| `/products` | Alta, edición y desactivación del catálogo |
| `/movement` | Registro de entradas (IN) y salidas (OUT) |
| `/history` | Historial de movimientos con filtros |
| `/components` | UI kit de componentes |

---

## Para el evaluador

### Sin instalar nada

Visita **[https://proyecto-inventario-8r82.onrender.com](https://proyecto-inventario-8r82.onrender.com/)**. La app ya está configurada contra la API en Render.

### Con frontend en local (API en la nube)

```bash
git clone https://github.com/monicasofiarestrepo/proyecto-inventario.git
cd proyecto-inventario/frontend
npm install
cp .env.example .env
npm run web
```

Abre la URL que muestre Expo (típicamente `http://localhost:8081`).

---

## Ejecución local

### Requisitos

- Node.js 20+
- npm

### Desarrollo (hot reload)

```bash
npm install
cp .env.example .env
npm run web
```

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | URL base de la API (sin barra final) |

**Producción** (`.env.example`):

```env
EXPO_PUBLIC_API_URL=https://inventario-api-yyie.onrender.com
```

**Backend local:**

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Las variables `EXPO_PUBLIC_*` se inyectan en **build time** al exportar para Render.

---

## Build estático (Render)

El proyecto usa exportación estática (`app.json` → `"web": { "output": "static" }`).

```bash
npm install
npx expo export --platform web
```

Salida en la carpeta **`dist/`** (directorio de publicación en Render).

| Campo Render | Valor |
|--------------|--------|
| Root Directory | `frontend` |
| Build Command | `npm install && npx expo export --platform web` |
| Publish Directory | `dist` |
| Env | `EXPO_PUBLIC_API_URL=https://inventario-api-yyie.onrender.com` |

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run web` | Servidor de desarrollo web |
| `npm start` | Expo dev (todas las plataformas) |
| `npm run lint` | ESLint |

---

## Estructura relevante

```
frontend/
├── app/                 # Rutas (Expo Router)
├── components/
│   ├── atoms/           # Button, TextField, StockBadge, …
│   ├── molecules/       # ProductRow, MovementRow
│   └── organisms/       # WebShell
├── services/api.ts      # Cliente HTTP y mappers
├── utils/quantity.ts    # Validación unidades / decimales
└── constants/theme.ts   # Paleta y tipografía
```

---

## Volver al README principal

[Documentación general del proyecto](../README.md) · [Backend / API](../backend/README.md)
