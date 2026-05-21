# Diagramas C4 — Inventario SYS

## Nivel 1 — Contexto

```mermaid
flowchart TB
    user[Encargado_de_bodega]
    sys[Sistema_Inventario_SYS]
    api[API_REST_Render]
    web[Web_Estatica_Render]

    user -->|Gestiona catalogo y movimientos| web
    web -->|HTTPS JSON| api
```

## Nivel 2 — Contenedores

```mermaid
flowchart LR
    browser[Navegador]
    staticSite[Static_Site_Expo_export]
    nestApi[NestJS_API]
    postgres[(PostgreSQL_Render)]

    browser --> staticSite
    staticSite -->|Axios EXPO_PUBLIC_API_URL| nestApi
    nestApi -->|TypeORM| postgres
```

## URLs de producción

| Contenedor | URL |
|------------|-----|
| Web | https://proyecto-inventario-8r82.onrender.com |
| API | https://inventario-api-yyie.onrender.com |
| Base de datos | Postgres managed (Render) |

## CI/CD

```mermaid
flowchart LR
    gh[GitHub_Actions]
    gh -->|jest pbt stryker| nestApi
    gh -->|playwright lint| staticSite
```

Pipeline: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).
