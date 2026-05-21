# Prompts del proyecto — Inventario SYS

Registro de los prompts que fui usando con la IA durante el desarrollo, ordenados por etapa

---

## Etapa 1 — Documentación inicial

### Prompt 1.1 — PRD y estructura del repositorio

**Contexto:** Recién empecé la actividad. Tenía el enunciado abierto y la estructura obligatoria (`backend/`, `frontend/`, `docs/`) pero todavía no había código.

**Prompt exacto:**
```
Necesito arrancar un PRD para un sistema de inventario del curso.

Piensa paso a paso:
1) Qué debe hacer el sistema (productos, movimientos IN/OUT, stock en tiempo real, alertas).
2) Qué stack usar (NestJS + Postgres + frontend web).
3) Qué pruebas pide la rúbrica (Jest, fast-check, Stryker, Playwright).
4) Cómo organizar el repo según el enunciado.

Con eso, escribe docs/PRD.md con alcance, reglas de negocio, endpoints y criterios de aceptación.
Que sea útil como guía real de implementación, no un texto genérico.
```

**Reflexión:** La IA me devolvió un PRD muy completo, pero asumía React con `src/pages/`. Cuando empecé a codear usé Expo Router (`frontend/app/`) porque ya venía en el template. Tuve que volver y alinear el documento con lo que realmente iba a construir.

**Refinamiento iterativo:**
- **v1:** PRD casi calcado del enunciado.
- **v2:** «Actualiza el PRD: Expo Router, tema retro cyberpunk, deploy en Render (API + static site).»
- **Resultado:** [`docs/PRD.md`](PRD.md) coherente con el repo final.

---

### Prompt 1.2 — User stories y tickets

**Contexto:** Ya tenía el PRD. Necesitaba pasar de “qué hay que hacer” a tareas concretas para no perderme en el backend y el frontend.

**Prompt exacto:**
```
Lee docs/PRD.md.

Primero lista las user stories principales (catálogo, movimientos, inventario, historial).
Para cada una agrega criterios de aceptación que se puedan verificar.
Después conviértelo en tickets técnicos por módulo (NestJS) y por pantalla (frontend).

Prioriza lo bloqueante primero (modelo de datos y API).
```

**Reflexión:** Me sirvió como backlog inicial. Más adelante reescribí las historias en **Gherkin** porque la rúbrica lo pedía explícitamente (ver [`docs/user-stories.md`](user-stories.md)).

---

## Etapa 2 — Backend

### Prompt 2.1 — Scaffold NestJS + TypeORM

**Contexto:** Carpeta `backend/` vacía. Tenía las rules de Cursor (`.cursor/rules/backend-guidelines.mdc`) y los tickets en `docs/tickets.md`.

**Prompt exacto:**
```
Implementa paso a paso el backende en la carpeta:  backend/ luego lo hostearemos en render.

Antes de escribir código, dime el orden que recomiendas:
- entidades y enums
- módulos products / movements / inventory
- DTOs + ValidationPipe
- docker-compose local

Luego implementa siguiendo docs/PRD.md y docs/tickets.md.
Incluye .env.example y CORS para el frontend.
```

**Reflexión:** Pedir el orden primero me ayudó a no saltar directo al controller. La estructura quedó limpia: lógica en services, validación en DTOs. Las rules del proyecto también empujaban en esa dirección.

**Refinamiento iterativo:**
- **v1:** Deploy en Render sin tablas → error 500.
- **v2:** «En producción usa synchronize y SSL hacia Postgres de Render.»
- **Resultado:** API estable en `inventario-api-yyie.onrender.com`.

---

### Prompt 2.2 — Salidas OUT con transacción (chain of thought)

**Contexto:** Las entradas (IN) ya funcionaban. Las salidas (OUT) todavía no validaban stock y eso era la regla de negocio más delicada.

**Prompt exacto:**
```
Tengo un bug de diseño en MovementsService: OUT no valida stock.

Razona en voz alta antes de proponer código:
1) ¿Dónde se calcula el stock hoy? (suma de movimientos)
2) ¿Qué pasa si dos salidas concurrentes leen el mismo stock?
3) ¿Por qué conviene una transacción aquí?
4) ¿Qué excepción HTTP devuelvo si no alcanza?

Con esa lógica, implementa OUT en MovementsService usando DataSource.transaction,
consultando stock con InventoryService dentro de la transacción
y lanzando BadRequestException si quantity > stock disponible.
```

**Reflexión:** El chain of thought fue clave: la IA no solo “puso un if”, sino que justificó la transacción. Después escribí tests que mockean la transacción y verifican el mensaje `Stock insuficiente`.

---

### Prompt 2.3 — Cantidades decimales (kg / litros)

**Contexto:** Un evaluador podía crear harina en kg con `minStock = 2.5`, pero el sistema solo aceptaba enteros. Había inconsistencia entre UI y API.

**Prompt exacto:**
```
Necesito una regla clara de cantidades:

- unidades → solo enteros
- kg y litros → hasta 3 decimales

Aplícalo en backend (DTO + services) y dime qué archivo conviene centralizar
para no repetir la misma validación en products y movements.
```

**Reflexión:** Terminamos con `backend/src/common/quantity.util.ts` y el espejo en `frontend/utils/quantity.ts`. Los tests PBT de cantidades cerraron el tema.

---

## Etapa 3 — Frontend

### Prompt 3.1 — Tema retro y pantallas base

**Contexto:** El template de Expo traía pantallas demo que no tenían nada que ver con inventario. En `docs/code-guidelines.md` la paleta ya estaba definida.

**Prompt exacto:**
```
Quiero resetear el frontend: fuera todo el template demo.

Piensa qué pantallas mínimas necesito según docs/user-stories.md:
- lista con stock y alerta
- formulario de movimiento
- catálogo de productos
- historial

Luego:
1) tema en constants/theme.ts (cyberpunk, Cascadia Code)
2) átomos Button, TextField, StockBadge (parpadeo si stock <= minStock)
3) rutas en frontend/app/ conectadas a la API (EXPO_PUBLIC_API_URL)
```

**Reflexión:** Separar “qué pantallas” de “cómo se ven” me evitó mezclar lógica con estilo. Seguí `frontend-guidelines.mdc` para no hardcodear colores fuera del theme.

---

### Prompt 3.2 — WebShell y detalles de UX

**Contexto:** La app funcionaba pero se sentía “plana”. El formulario de productos repetía categorías a mano.

**Prompt exacto:**
```
El header (WebShell) se ve vacío y en catálogo escribo la categoría desde cero cada vez.

Propón mejoras concretas:
- logo simple estilo pixel/retro
- chips con categorías ya usadas bajo el campo categoría
- StockBadge que muestre stock actual Y mínimo (ej: "5 unidades / min 10")

Implementa sin romper la navegación actual.
```

**Reflexión:** Hubo ida y vuelta con la decoración (primero en el nav, después al lado del contenido). El badge final dejó de ser ambiguo para quien revisa stock bajo.

---

## Etapa 4 — Testing y CI

### Prompt 4.1 — Suite de pruebas backend (chain of thought)

**Contexto:** La rúbrica pedía cuatro tipos de prueba y yo solo tenía Jest básico. No quería agregar tests “de relleno”.

**Prompt exacto:**
```
Debo cumplir la rúbrica de testing del curso. Ayúdame a planear antes de codear:

1) Unitarias (Jest): ¿qué servicios son críticos? ¿qué casos borde faltan?
2) PBT (fast-check): ¿qué propiedades de negocio valen la pena? (no tests triviales)
3) Stryker: ¿qué archivos mutar para llegar a ~70% sin mentir cobertura?
4) CI: ¿qué jobs separar en GitHub Actions?

Después implementa: más unit tests, *.pbt.spec.ts, stryker.config.json
y actualiza .github/workflows/ci.yml con Postgres para los tests.
```

**Reflexión:** Planificar primero evitó PBT inútiles (como validar que un enum solo tiene dos valores). Stryker quedó enfocado en `quantity.util`, `movements.service` y `products.service`, con score ~78% en local.

---

### Prompt 4.2 — Playwright E2E frontend

**Contexto:** En CI corría e2e de API con Supertest, pero la rúbrica pedía Playwright en las **dos pantallas** del frontend (lista + movimiento).

**Prompt exacto:**
```
Necesito E2E de UI con Playwright, no solo tests de API.

Flujo mínimo que debe pasar:
1) Crear producto (puede ser por API helper)
2) Registrar IN
3) Ver stock en "/"
4) Intentar OUT mayor al stock → botón deshabilitado o error visible
5) OUT válido

Usa expo export --platform web, sirve dist/,
y deja scripts npm run build:web y npm run test:e2e.
```

**Reflexión:** Crear el producto por API en un helper simplificó mucho los tests de UI. Los selectores van por texto/roles porque el UI retro no siempre expone `testID`.

---

## Etapa 5 — Despliegue

### Prompt 5.1 — Static site en Render + README para evaluador

**Contexto:** La API ya estaba en Render; el frontend solo corría en local con `npm run web`.

**Prompt exacto:**
```
Quiero dejar el frontend como Static Site en Render.

Confirma:
- build command (expo export web)
- publish directory (dist)
- variable EXPO_PUBLIC_API_URL apuntando a la API de prod

También actualiza README.md raíz: URLs públicas, pasos locales,
y un flujo corto para que un evaluador pruebe sin levantar backend.
```

**Reflexión:** URL final del front: https://proyecto-inventario-8r82.onrender.com. 

---

## Etapa 6 — Entorno Cursor (rules, skill, command)

### Prompt 6.1 — Rules del proyecto

**Contexto:** El curso pedía al menos 3 rules del proyecto. Las necesitaba para que la IA no inventara estructura en cada chat nuevo.

**Prompt exacto:**
```
Crea 3 rules en .cursor/rules/ para este monorepo:

1) regla general: leer docs/ antes de implementar
2) backend NestJS: capas, transacciones, sin any
3) frontend Expo retro: theme, sin hex sueltos

Que sean específicas de ESTE repo, no tips genéricos de Nest o React.
```

**Reflexión:** Después las cité en otros prompts (“sigue backend-guidelines”) y la consistencia mejoró bastante.

---

### Prompt 6.2 — Skill y command `/new-module`

**Contexto:** Faltaba el skill reutilizable y un command para la rúbrica de entorno de desarrollo.

**Prompt exacto:**
```
Necesito dos artefactos de Cursor:

1) Skill nest-module: cómo generar módulo NestJS completo (entity, dto, service, controller, spec)
2) Command /new-module: checklist para crear backend/src/<nombre>/

Ambos deben referenciar backend-guidelines.mdc y quantity.util si aplica.
```

**Reflexión:** El command me sirve como recordatorio cuando agrego módulos nuevos; el skill evita olvidar el `.spec.ts`.

**Refinamiento iterativo:**
- **v1:** Skill demasiado genérico.
- **v2:** «Añade ejemplos tomados de products/ y movements/ del repo.»
- **Resultado:** [`.cursor/skills/nest-module/SKILL.md`](../.cursor/skills/nest-module/SKILL.md) y [`.cursor/commands/new-module.md`](../.cursor/commands/new-module.md).

---

## Resumen — cómo usé la IA de verdad

| Fase | Yo decidí | La IA me ayudó con |
|------|-----------|-------------------|
| Arquitectura | Expo + Render (no Vercel) | PRD, ER, C4, tickets |
| Negocio | Soft delete y decimales por unidad | Código + tests |
| UI | Paleta fija cyberpunk/pixels | Componentes y layouts |
| Calidad | Meta Stryker ≥ 70% | Tests, PBT, CI, Playwright |

En los prompts con **chain of thought** (PRD, OUT transaccional, plan de testing) pedí explícitamente “analyze carefully before starting to code”. Eso redujo parches apresurados y me dio argumentos para defender decisiones en la entrega.

La IA aceleró scaffolding y pruebas; las decisiones finales las fui validando contra `docs/` y contra lo que pedía la rúbrica del curso.
