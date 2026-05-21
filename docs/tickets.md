# Tickets Tecnicos - Backlog del Proyecto

Este documento detalla los paquetes de trabajo técnicos requeridos para la implementación del sistema de inventario, organizados por módulos y capas de software.

---

## [BACKEND-001] Configuracion Inicial y Modelado de Datos con TypeORM
**Prioridad:** Alta (Bloqueante)

### Descripcion:
Inicializar el proyecto NestJS en la carpeta `backend/` y configurar la conexión a PostgreSQL a través de TypeORM. Se deben definir las entidades principales asegurando las restricciones de integridad relacional.

### Especificaciones Tecnicas:
- Crear la entidad `Product` dentro de `src/products/entities/product.entity.ts` con los campos: `id` (UUID), `name` (string), `description` (string, opcional), `unitOfMeasure` (enum: unidades, kg, litros), `category` (string), `minStock` (int), `status` (boolean, default: true) y `createdAt`.
- Crear la entidad `Movement` dentro de `src/movements/entities/movement.entity.ts` con los campos: `id` (UUID), `productId` (FK hacia Product), `type` (enum: IN, OUT), `quantity` (int), `reason` (enum: compra, venta, ajuste, merma, devolución) y `createdAt`.
- Configurar `app.module.ts` para leer las variables de entorno de la base de datos de Render.

### Tareas:
- [ ] Inicializar estructura base de NestJS bajo la arquitectura de carpetas del enunciado.
- [ ] Crear archivos de entidad para Products y Movements con decoradores de TypeORM.
- [ ] Configurar las validaciones globales en el punto de entrada mediante `ValidationPipe` (`class-validator`).

---

## [BACKEND-002] Implementacion de Logica de Negocio y Endpoints de Inventario
**Prioridad:** Alta

### Descripcion:
Desarrollar los servicios y controladores para los módulos de Products, Movements e Inventory, protegiendo al sistema contra el stock negativo y manejando la desactivación lógica en lugar del borrado físico.

### Especificaciones Tecnicas:
- **ProductsController:** Implementar los métodos POST, GET, PATCH y DELETE bajo la ruta `/products`. El método `DELETE /products/:id` debe verificar en el servicio si existen movimientos relacionados antes de proceder; si los hay, mutará el campo `status` a false.
- **MovementsController:** Implementar `POST /movements` y `GET /movements`. El servicio debe ejecutar una transacción SQL (`DataSource.transaction`) al procesar un movimiento tipo `OUT`, calculando la sumatoria actual en la base de datos para validar que la cantidad no deje el inventario en negativo.
- **InventoryController:** Implementar `GET /inventory`, `GET /inventory/:productId` y `GET /inventory/alerts/low-stock`. Las consultas deben agrupar los movimientos para retornar el balance neto en tiempo real.

### Tareas:
- [ ] Desarrollar DTOs necesarios para validación de contratos de entrada (`CreateProductDto`, `CreateMovementDto`).
- [ ] Implementar middleware o lógica de servicio para la verificación atómica de stock antes de registrar salidas.
- [ ] Crear filtros dinámicos mediante query params en el endpoint `GET /movements` para rangos de fechas y tipo.

---

## [FRONTEND-001] Configuracion del Cliente HTTP y Pantalla de Lista de Productos
**Prioridad:** Media

### Descripcion:
Desarrollar la estructura base de React en la carpeta `frontend/` y programar la pantalla principal que despliega el inventario actual con estilos retro de baja fidelidad (monocromático estilo terminal).

### Especificaciones Tecnicas:
- Configurar una instancia centralizada de Axios en `src/services/api.ts` apuntando a la URL del backend en Render.
- Desarrollar la vista `ProductList.tsx` dentro de `src/pages/`. Esta debe consumir los endpoints del backend para unificar la información del catálogo con el stock calculado.
- Implementar el componente `StockBadge.tsx` para evaluar de manera condicional si `stock <= minStock`. En caso afirmativo, aplicar una clase CSS con animaciones de parpadeo retro (`blink`) o video inverso.

### Tareas:
- [ ] Crear estructura de directorios según el diseño estipulado (`pages`, `components`, `services`).
- [ ] Implementar componentes atómicos `ProductCard.tsx` y `StockBadge.tsx`.
- [ ] Integrar hooks de React (`useEffect`, `useState`) para manejar los estados de carga (útil para el cold start de Render) y errores de red.

---

## [FRONTEND-002] Formulario de Registro de Movimientos con Validacion Reactiva
**Prioridad:** Media

### Descripcion:
Construir la pantalla `MovementForm.tsx` para la captura de entradas y salidas de stock, asegurando que las reglas de negocio críticas se validen localmente en el cliente antes de disparar la petición HTTP.

### Especificaciones Tecnicas:
- Crear el formulario interactivo en `src/pages/MovementForm.tsx`.
- Implementar un listener que, al seleccionar un producto del listado y cambiar el tipo a "Salida", consuma inmediatamente `GET /inventory/:productId` para setear un límite máximo en el estado local de la interfaz.
- Validar mediante expresiones regulares o lógica de estado que la cantidad sea exclusivamente un entero positivo. Si la cantidad excede el stock disponible en una salida, el botón de envío debe quedar bloqueado de forma nativa.

### Tareas:
- [ ] Diseñar el formulario respetando la tipografía monoespaciada y la paleta de colores del diseño retro.
- [ ] Desarrollar las validaciones de formulario en tiempo real para el campo de cantidad.
- [ ] Programar la redirección automática hacia la lista de productos tras un guardado exitoso.

---

## [QA-001] Implementacion de Suite de Pruebas y Pipeline CI/CD
**Prioridad:** Alta

### Descripcion:
Escribir las pruebas automatizadas demandadas por el curso tanto en backend como en frontend para garantizar la estabilidad del software y configurar la integración continua.

### Especificaciones Tecnicas:
- **Backend Tests:** Crear pruebas unitarias con Jest. Configurar `fast-check` en pruebas basadas en propiedades (PBT) para el ingreso de strings masivos o números inválidos en productos. Configurar `Stryker` para evaluar la supervivencia de mutantes en la lógica de validación de salidas.
- **Frontend E2E:** Escribir los scripts de Playwright en `frontend/e2e/product-list.spec.ts` y `movement-form.spec.ts` para simular clics de usuario, validaciones de stock negativo bloqueadas en la UI y flujos de navegación correctos.
- **CI/CD:** Crear el archivo `.github/workflows/ci.yml` para ejecutar automáticamente toda la suite de pruebas en cada evento de push al repositorio.

### Tareas:
- [ ] Escribir y pasar las pruebas unitarias y PBT en el backend.
- [ ] Correr Stryker Mutation Testing y ajustar los tests según los mutantes sobrevivientes.
- [ ] Desarrollar los archivos `.spec.ts` de Playwright y verificar su ejecución correcta en modo headless.
- [ ] Configurar el archivo de workflow de GitHub Actions.