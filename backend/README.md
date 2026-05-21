# Backend — Inventario API

NestJS + TypeORM + PostgreSQL.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con hot reload |
| `npm run build` | Compilar a `dist/` |
| `npm run start:prod` | Producción (Render) |
| `npm test` | Jest unitarios + PBT |
| `npm run test:stryker` | Mutation testing |

## Variables de entorno

Ver `.env.example`. En Render: `DATABASE_URL`, `NODE_ENV=production`, `CORS_ORIGIN`, `PORT` (inyectado por Render).
