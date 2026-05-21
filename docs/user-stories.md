# User stories — Formato Gherkin

Historias alineadas con el sistema implementado (Expo Router + NestJS).

---

## US01 — Gestión de productos (Backend)

**Historia:** Como encargado de bodega, quiero registrar y administrar productos para mantener el catálogo base del inventario.

```gherkin
Feature: Gestion de productos
  Como encargado de bodega
  Quiero crear y administrar productos
  Para mantener el catalogo del inventario

  Scenario: Crear producto valido
    Given la API esta disponible
    When envio POST /products con nombre "Tornillo M6", unitMeasure "unidades", category "Ferreteria" y minStock 10
    Then recibo codigo 201 o 200
    And el producto queda activo

  Scenario: Rechazar nombre vacio
    Given la API esta disponible
    When envio POST /products con name vacio
    Then recibo codigo 400

  Scenario: Desactivar producto con movimientos
    Given un producto con al menos un movimiento registrado
    When envio DELETE /products/:id
    Then el producto queda con active false
    And no se elimina fisicamente de la base de datos
```

**Estado:** [x] Implementado

---

## US02 — Registro de movimientos (Backend)

**Historia:** Como operador logístico, quiero registrar entradas y salidas auditables.

```gherkin
Feature: Movimientos de stock
  Como operador logistico
  Quiero registrar entradas y salidas
  Para actualizar el inventario de forma auditable

  Scenario: Registrar entrada
    Given un producto activo existente
    When envio POST /movements con type "IN", quantity 50 y reason "compra"
    Then el movimiento se persiste
    And el stock calculado aumenta en 50

  Scenario: Rechazar salida que supera stock
    Given un producto con stock actual 5
    When envio POST /movements con type "OUT" y quantity 10
    Then recibo codigo 400
    And el mensaje indica stock insuficiente

  Scenario: Salida valida en transaccion
    Given un producto con stock actual 20
    When envio POST /movements con type "OUT" y quantity 5
    Then el movimiento se registra
    And el stock calculado queda en 15
```

**Estado:** [x] Implementado

---

## US03 — Inventario y alertas (Backend)

**Historia:** Como administrador, quiero consultar stock en tiempo real y alertas de mínimo.

```gherkin
Feature: Consulta de inventario
  Como administrador de inventario
  Quiero ver stock actual y alertas
  Para reabastecer a tiempo

  Scenario: Stock calculado por agregacion
    Given movimientos IN por 30 y OUT por 10 para un producto
    When consulto GET /inventory/:productId
    Then el stock actual es 20

  Scenario: Listar alertas de stock bajo
    Given un producto con currentStock 3 y minStock 5
    When consulto GET /inventory/alerts/low-stock
    Then el producto aparece en la lista de alertas
```

**Estado:** [x] Implementado

---

## US04 — Historial de movimientos (Backend)

**Historia:** Como auditor, quiero filtrar movimientos por producto, tipo y fechas.

```gherkin
Feature: Historial de movimientos
  Como auditor del sistema
  Quiero filtrar movimientos
  Para rastrear discrepancias

  Scenario: Listado completo ordenado
    When consulto GET /movements sin filtros
    Then recibo movimientos ordenados por fecha descendente

  Scenario: Filtrar por producto y tipo
    Given movimientos de varios productos
    When consulto GET /movements con productId y type "OUT"
    Then solo recibo salidas de ese producto

  Scenario: Filtrar por rango de fechas
    When consulto GET /movements con startDate y endDate
    Then excluyo movimientos fuera del rango
```

**Estado:** [x] Implementado

---

## US-F01 — Lista de productos (Frontend)

**Historia:** Como usuario, quiero ver productos con stock e indicador de alerta en la pantalla principal.

```gherkin
Feature: Lista de productos en web
  Como usuario de bodega
  Quiero ver el listado con stock actual
  Para identificar faltantes rapidamente

  Scenario: Mostrar stock y badge OK
    Given un producto con stock 12 y minStock 5
    When abro la pantalla principal "/"
    Then veo el nombre del producto
    And veo un indicador de stock sin alerta critica

  Scenario: Mostrar badge de bajo stock
    Given un producto con stock 2 y minStock 5 en unidades
    When abro la pantalla principal "/"
    Then veo el texto de alerta de bajo stock
    And el badge resalta visualmente la condicion critica
```

**Estado:** [x] Implementado — [`frontend/app/index.tsx`](../frontend/app/index.tsx), [`StockBadge.tsx`](../frontend/components/atoms/StockBadge.tsx)

---

## US-F02 — Formulario de movimientos (Frontend)

**Historia:** Como usuario, quiero registrar movimientos con validación en tiempo real.

```gherkin
Feature: Formulario de movimientos
  Como operador
  Quiero registrar entradas y salidas en la web
  Para no enviar datos invalidos al servidor

  Scenario: Mostrar stock disponible en salida
    Given un producto con stock 10
    When selecciono el producto y tipo "Salida" en "/movement"
    Then veo el stock disponible en pantalla

  Scenario: Bloquear salida por stock insuficiente
    Given stock disponible 5
    When ingreso cantidad 10 en una salida
    Then el boton Registrar permanece deshabilitado
    Or veo mensaje de error de maximo permitido

  Scenario: Registrar entrada exitosa
    Given un producto activo seleccionado
    When ingreso cantidad valida en entrada y envio el formulario
    Then veo confirmacion de movimiento registrado
```

**Estado:** [x] Implementado — [`frontend/app/movement.tsx`](../frontend/app/movement.tsx)
