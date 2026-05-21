# Directrices de Desarrollo y Reglas de Código

## 1. Reglas Específicas para Frontend (React)

### 1.1. Estética Retro Cyberpunk (Colores y Legibilidad)
- **Fondo Principal:** Siempre usar negro puro o gris ultra oscuro (`#0A0512`).
- **Acentos Morados:** Usar morados eléctricos y tonos neón para la jerarquía visual:
  - Base del sistema: `#1A0B2E`
  - Texto e interactivos principales (Morado Neón): `#BC34FA`
  - Texto secundario (Lavanda tenue): `#A193B8`
  - Alertas/Bajo Stock (Rosa Neón / Fucsia): `#FF2A85`
- **Tipografía:** Usar exclusivamente fuentes monoespaciadas (`Courier New`, `monospace` o importadas tipo `VT323`). 
- **Legibilidad (Readability):** Todo texto debe mantener un contraste mínimo de 4.5:1. Los bloques de datos densos deben separarse mediante cajas con bordes de 1px usando caracteres o estilos de línea sólida (`border: 1px solid #BC34FA`).

### 1.2. Arquitectura Atómica de Componentes
El código debe dividirse estrictamente bajo los siguientes niveles de abstracción dentro de `src/components/` y `src/pages/`:
- **Átomos:** Componentes puros sin estado de negocio (ej. `StockBadge.tsx`, `ButtonRetro.tsx`, `TextMono.tsx`). No manejan márgenes externos; el espaciado lo dicta el contenedor padre.
- **Moléculas:** Unión de dos o más átomos con lógica de interacción local (ej. `ProductRow.tsx` combinando texto y el badge).
- **Organismos / Pantallas (`src/pages/`):** Componentes complejos que manejan el estado, hooks de efectos, llamadas a Axios y distribución de layouts (`ProductList.tsx` y `MovementForm.tsx`).

### 1.3. Animaciones y Estados de Carga
- **Efecto de Carga (Loader):** Debido al "Cold Start" de los servicios gratuitos de Render, toda petición asíncrona inicial debe mostrar un loader que simule una terminal cargando datos (ej. texto parpadeante `>> LOADING SYSTEM DATA... [|||||     ]`).
- **Animación de Alerta:** El componente `StockBadge.tsx` en estado crítico debe activar una animación CSS nativa de parpadeo (`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`) a intervalos de 1.5s para emular pantallas CRT antiguas.

---

## 2. Reglas Específicas para Backend (NestJS)

### 2.1. Separación de Responsabilidades Estricta
El flujo de datos debe respetar la arquitectura nativa de NestJS definida en la estructura del proyecto:
- **Controladores (`.controller.ts`):** Únicamente exponen las rutas de la API, configuran los códigos de estado HTTP y reciben los payloads. Queda prohibido meter lógica de negocio o consultas SQL directas aquí.
- **Servicios (`.service.ts`):** Contienen el 100% de la lógica de negocio, reglas de cálculo dinámico y orquestación de transacciones de bases de datos.
- **DTOs (`dto/`):** Validar de forma estricta todos los payloads de entrada utilizando `class-validator` y `class-transformer`. El controlador debe rechazar formatos corruptos mediante pipes antes de tocar el servicio.

### 2.2. Optimización y Control Transaccional
- **Cálculo Eficiente:** El cálculo de inventario debe delegarse al motor PostgreSQL mediante queries de agregación optimizadas (`SUM` y `CASE WHEN`) a través del `QueryBuilder` de TypeORM, evitando traer arreglos masivos a la memoria de Node.js para iterarlos.
- **Atomicidad Transaccional:** El registro de movimientos tipo `OUT` (Salida) debe emplear obligatoriamente `dataSource.transaction()`. La lectura del stock actual y la inserción del nuevo registro deben ejecutarse en el mismo bloque aislado para prevenir condiciones de carrera (Race Conditions).

### 2.3. Legibilidad del Código (Readability)
- **Tipado Estricto:** Prohibido el uso de `any`. Todos los métodos deben declarar explícitamente el tipo de dato que retornan (ej: `Promise<Product[]>`, `Promise<Movement>`).
- **Manejo Semántico de Errores:** No usar bloques `try/catch` vacíos. Lanzar excepciones nativas de NestJS (`BadRequestException`, `NotFoundException`, `InternalServerErrorException`) con mensajes descriptivos claros para el consumidor de la API.