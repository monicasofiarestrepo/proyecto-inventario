# Historias de Usuario - Sistema de Inventario

Este documento define los requisitos funcionales del sistema mediante historias de usuario, incluyendo el análisis de lógica de negocio y criterios de aceptación técnicos.

---

## US01: Gestion de Productos (Catalogo)
**Como** Encargado de Bodega,  
**Quiero** registrar y administrar productos con sus metadatos básicos, unidad de medida y estado,  
**Para** mantener un catálogo unificado que sirva de base para los movimientos de stock.

### Analisis Tecnico:
1. **Atributos de Entidad:** Cada producto mapeado en TypeORM requiere id (UUID), nombre, descripción, unidad de medida (unidades, kg, litros), categoría, stock mínimo permitido y estado (activo/inactivo).
2. **Restriccion de Borrado:** Para mantener la integridad referencial en PostgreSQL, el método `DELETE /products/:id` debe verificar si el producto tiene registros en la tabla de movimientos. Si existen, la eliminación física se aborta y el sistema cambia el estado del producto a inactivo (`status: false`).
3. **Estilo Interfaz:** La lista presentará los datos estructurados en filas compactas emulando una terminal monocromática.

### Criterios de Aceptacion:
- [ ] El endpoint `POST /products` rechaza la solicitud si el nombre está vacío o si el stock mínimo es menor a cero.
- [ ] La unidad de medida se valida contra un tipo ENUM estricto (unidades, kg, litros).
- [ ] El endpoint `DELETE /products/:id` desactiva el producto en lugar de borrarlo si cuenta con historial de movimientos asociado.
- [ ] La pantalla de lista de productos solo renderiza por defecto los elementos cuyo estado sea activo.

---

## US02: Registro de Movimientos de Stock
**Como** Operador Logístico,  
**Quiero** registrar flujos de entrada y salida asociados a un producto indicando la razón del movimiento,  
**Para** modificar el balance disponible de inventario de forma auditable.

### Analisis Tecnico:
1. **Transaccionalidad:** Un movimiento es un registro histórico inmutable. Almacena tipo (entrada/salida), cantidad (entero positivo), producto afectado, fecha y razón (compra, venta, ajuste, merma, devolución).
2. **Control de Stock Negativo:** Si el tipo es salida (`OUT`), el servicio de NestJS debe consultar el stock acumulado antes de insertar. Si la cantidad solicitada es mayor al stock calculado, la base de datos no debe registrar la operación.
3. **Validacion Frontend:** El formulario web en React valida en tiempo real mediante controladores locales que la cantidad ingresada sea un entero positivo. Si es una salida, deshabilita el envío si supera el límite recuperado de la API.

### Criterios de Aceptacion:
- [ ] El selector de razones restringe las opciones a: compra, venta, ajuste, merma, devolución.
- [ ] El formulario muestra dinámicamente el stock disponible actual cuando el usuario selecciona la opción de salida.
- [ ] El sistema devuelve un código de error 400 (Bad Request) si una salida deja el stock general en números negativos.
- [ ] Tras un envío exitoso, la interfaz limpia los campos y regresa un mensaje de confirmación en la consola visual.

---

## US03: Consulta de Inventario y Alertas de Stock Minimo
**Como** Administrador de Inventario,  
**Quiero** ver el saldo de existencias calculado y recibir advertencias visuales cuando las unidades caigan por debajo del umbral mínimo,  
**Para** gestionar el reabastecimiento de productos antes de perder disponibilidad.

### Analisis Tecnico:
1. **Calculo de Saldos:** El stock actual no se almacena como un valor estático en la tabla de productos. Se calcula dinámicamente mediante queries de agregación SQL: $\sum \text{entradas} - \sum \text{salidas}$.
2. **Endpoint de Alertas:** El controlador de inventario expone el endpoint `GET /inventory/alerts/low-stock` que filtra únicamente los registros donde $\text{stock\_actual} \le \text{min\_stock}$.
3. **Renderizado de Interfaz Retro:** El componente `StockBadge.tsx` evalúa el stock actual contra el mínimo configurado. Si se cumple la condición de alerta, aplica estilos CSS específicos (por ejemplo, texto parpadeante o resaltado invertido de terminal clásica).

### Criterios de Aceptacion:
- [ ] La pantalla principal muestra las columnas obligatorias: nombre, categoría, unidad de medida, stock actual e indicador de alerta.
- [ ] El indicador visual de alerta se activa inmediatamente si el stock actual es menor o igual al stock mínimo.
- [ ] El endpoint de consulta de stock individual (`GET /inventory/:productId`) devuelve el valor numérico exacto basado en el historial de transacciones.

---

## US04: Historial de Auditoria de Movimientos
**Como** Auditor del Sistema,  
**Quiero** consultar los movimientos filtrando por variables de rango, tipo y producto,  
**Para** rastrear el origen de cualquier discrepancia en el inventario físico.

### Analisis Tecnico:
1. **Filtros por Query Params:** El endpoint `GET /movements` debe aceptar parámetros opcionales en la URL para estructurar cláusulas `WHERE` dinámicas en TypeORM (`productId`, `type`, `startDate`, `endDate`).

### Criterios de Aceptacion:
- [ ] La consulta sin parámetros devuelve el listado histórico completo ordenado por fecha de forma descendente.
- [ ] Al aplicar el filtro de rango de fechas, el sistema excluye correctamente los movimientos fuera del límite establecido.

---

## US05: Pruebas del Sistema e Integracion Continua
**Como** Desarrollador,  
**Quiero** que el sistema cuente con un set de pruebas automatizadas en diferentes niveles,  
**Para** asegurar que los cambios en el código no rompan las reglas de negocio básicas.

### Analisis Tecnico:
1. **Estrategia de Testing:**
   - **Pruebas Unitarias (Jest):** Validación aislada de servicios de NestJS.
   - **Property-Based Testing (fast-check):** Pruebas en el backend enviando grandes volúmenes de datos aleatorios para encontrar fallos de desbordamiento en enteros o strings vacíos.
   - **Mutation Testing (Stryker):** Inserción de mutantes en el código del backend para verificar que los tests unitarios realmente detecten cambios de lógica lógica errónea.
   - **Pruebas E2E (Playwright):** Automatización de flujos en el frontend React (`product-list.spec.ts` y `movement-form.spec.ts`) para verificar el comportamiento de las validaciones en tiempo real y la navegación.

### Criterios de Aceptacion:
- [ ] Todas las pruebas corren localmente mediante scripts dedicados en sus respectivas carpetas.
- [ ] El pipeline de GitHub Actions configurado en el repositorio compila el código y ejecuta la suite completa de pruebas de manera exitosa en cada push.