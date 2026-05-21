# Product Requirements Document (PRD) - Sistema de Inventario

## 1. Vision General
Este documento especifica los requisitos y la arquitectura para el desarrollo de un sistema de gestión de inventario transaccional. El sistema consta de un backend construido en NestJS y un frontend desarrollado en React puro, utilizando PostgreSQL como motor de persistencia y Render como plataforma de hosting unificada. La interfaz de usuario adoptará una estética retro minimalista basada en interfaces de terminal de línea de comandos.

## 2. Alcance del Sistema
El sistema debe resolver la gestión del catálogo de productos y el control preciso de existencias mediante un registro inmutable de movimientos (entradas y salidas). El cálculo de stock debe realizarse de forma dinámica y atómica para evitar discrepancias por concurrencia. Asimismo, se integrará una suite de pruebas exhaustiva que cubra desde pruebas unitarias hasta mutation testing y pruebas de extremo a extremo (E2E).

## 3. Especificaciones Tecnicas y Stack
- **Backend:** NestJS, TypeORM, PostgreSQL.
- **Frontend:** React, Axios, CSS personalizado (Estilo Retro/Monocromático).
- **Testing Backend:** Jest (Unitario), fast-check (Property-Based Testing), Stryker (Mutation Testing).
- **Testing Frontend:** Playwright (E2E).
- **Infraestructura:** Render (Web Services, Static Sites y Managed PostgreSQL), GitHub Actions (CI/CD).

## 4. Estructura Obligatoria del Repositorio
El proyecto debe organizarse estrictamente bajo la siguiente estructura de directorios:

```text
proyecto-inventario/
├── backend/ (NestJS)
│   └── src
│       ├── products
│       │   ├── dto
│       │   ├── entities
│       │   ├── products.controller.ts
│       │   └── products.service.ts
│       ├── movements
│       │   ├── dto
│       │   ├── entities
│       │   ├── movements.controller.ts
│       │   └── movements.service.ts
│       ├── inventory
│       │   ├── inventory.controller.ts
│       │   └── inventory.service.ts
│       ├── common
│       │   ├── pipes
│       │   └── guards
│       └── app.module.ts
└── frontend/ (React)
    └── src
        ├── pages
        │   ├── ProductList.tsx
        │   └── MovementForm.tsx
        ├── components
        │   ├── ProductCard.tsx
        │   ├── StockBadge.tsx
        │   └── MovementForm.tsx
        ├── services
        │   └── api.ts
        └── e2e/ (Playwright)
            ├── product-list.spec.ts
            └── movement-form.spec.ts

### Sección 5: Requisitos Funcionales y Reglas de Negocio
```markdown
## 5. Requisitos Funcionales y Reglas de Negocio

### 5.1. Gestión de Productos
- **Registro de Atributos:** El sistema debe capturar el nombre, descripción, unidad de medida (restringida a: unidades, kg, litros), categoría, stock mínimo permitido y estado (activo/inactivo).
- **Regla de Eliminación:** Queda prohibido el borrado físico (`DELETE` de SQL) de un producto si este tiene movimientos históricos asociados en la base de datos. En su lugar, el sistema debe interceptar la petición y realizar una desactivación lógica (`status: false`).

### 5.2. Movimientos de Inventario
- **Estructura del Registro:** Cada transacción debe almacenar de forma inmutable el tipo de movimiento (entrada o salida), la cantidad (entero positivo), el producto afectado, la fecha de creación y la razón específica (compra, venta, ajuste, merma, devolución).
- **Restricción de Stock Negativo:** Una operación de tipo salida (`OUT`) no puede superar el stock disponible actual del producto. La verificación y la inserción deben ocurrir dentro de una transacción aislada de base de datos para mitigar condiciones de carrera.

### 5.3. Consulta de Existencias y Alertas
- **Cálculo Dinámico:** El stock actual disponible por producto no se almacenará de forma estática. Debe ser calculado en tiempo real ejecutando la sumatoria algebraica de los movimientos históricos registrados ($\sum \text{entradas} - \sum \text{salidas}$).
- **Umbral de Alerta:** El sistema debe identificar los productos cuyo stock actual sea igual o menor al stock mínimo configurado. Estos productos deben ser recuperados mediante un servicio especializado para su tratamiento en la interfaz de usuario.

## 6. Especificaciones de la Interfaz (Frontend React)
El diseño visual implementará una estética retro basada en fósforo verde o ámbar sobre fondo oscuro, empleando fuentes monoespaciadas y componentes estructurados de forma atómica.

- **Pantalla de Lista de Productos (`ProductList.tsx`):** Vista principal que consume el catálogo de productos activos. Debe mostrar nombre, categoría, unidad de medida, stock actual calculado y el componente `StockBadge.tsx`. Si el producto está en estado crítico, este badge activará un estilo visual de alerta (ej. parpadeo o video inverso). Permitirá la navegación directa al formulario de movimientos.
- **Pantalla de Registro de Movimiento (`MovementForm.tsx`):** Formulario para procesar entradas o salidas. Al seleccionar un producto y marcar "salida", la interfaz debe invocar al backend para conocer el stock disponible y restringir de forma reactiva que el usuario digite una cantidad superior al límite. El campo de cantidad solo aceptará enteros positivos.

## 7. Matriz de Endpoints de la API

| Módulo | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Products** | POST | `/products` | Crear un nuevo producto |
| | GET | `/products` | Listar todos los productos activos |
| | GET | `/products/:id` | Obtener detalle de un producto |
| | PATCH | `/products/:id` | Actualizar datos de un producto |
| | DELETE | `/products/:id` | Desactivar lógicamente un producto |
| **Movements**| POST | `/movements` | Registrar un movimiento de entrada o salida |
| | GET | `/movements` | Listar movimientos con filtros (producto, tipo, fechas) |
| | GET | `/movements/:id` | Detalle de un movimiento específico |
| **Inventory**| GET | `/inventory` | Ver stock actual de todos los productos |
| | GET | `/inventory/:productId` | Ver stock actual de un producto específico |
| | GET | `/inventory/alerts/low-stock` | Listar productos en o bajo el stock mínimo |

## 8. Requisitos de Calidad y Validacion (Testing)
El proyecto requiere la implementación obligatoria de los siguientes niveles de pruebas, los cuales deben ejecutarse de manera automatizada a través de un pipeline en GitHub Actions antes de permitir el despliegue final en Render:

- **Pruebas Unitarias:** Cobertura de la lógica interna de los servicios de NestJS usando Jest.
- **Property-Based Testing (PBT):** Uso de `fast-check` para estresar los métodos del backend con datos aleatorios y asegurar la resiliencia ante desbordamientos o valores nulos.
- **Mutation Testing:** Implementación de `Stryker` en el backend para validar la efectividad de las pruebas unitarias mediante la introducción de mutantes en el código fuente.
- **Pruebas End-to-End (E2E):** Automatización con Playwright sobre el frontend para certificar el comportamiento de los flujos en `product-list.spec.ts` y las validaciones en tiempo real en `movement-form.spec.ts`.

