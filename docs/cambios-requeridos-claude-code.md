# Cambios requeridos — DEMOS-RTP (sesión de equipo, previo a demo GoPayments)

## Contexto para Claude Code

Repo de referencia: `innlab-ach/DEMOS-RTP` (sitio en vivo:
https://innlab-ach.github.io/DEMOS-RTP/index.html)

Este documento recoge los cambios acordados en una sesión de equipo (transcripción
`RTP___Aval_Cobros_b2b_y_b2p.vtt`) sobre los 11 prototipos ya construidos, más una
experiencia nueva a construir (split payment) y una decisión sobre las 3 experiencias
pendientes. El objetivo es tener todo ajustado antes de la demo con GoPayments el jueves.

Ver documento de contexto completo del catálogo de 14+1 experiencias:
`referencias/gou-payments-rtp-experiencias.md`.

Convención de carpeta ya establecida en el repo (mantener):
```
<nombre-prototipo>/
  index.html
  styles.css
  app.js
```
Reutilizar `assets/index.css` y los temas de banco (`theme-<bankKey>`) ya definidos.

---

## 1. Cambios transversales (aplican a varios prototipos de banca empresarial/personal)

- [ ] **Eliminar selección de banco/correo/celular** cuando el contexto ya lo resuelve
  (ej. usuario ya está dentro de la app de un banco Aval). Dejar solo campo de
  identificación (cédula) precargado, sin pedir selección.
- [ ] **Cuenta de pago por defecto**: en el flujo normal, nunca forzar selección de
  cuenta — mostrar la predeterminada con opción de "cambiar cuenta" secundaria y menos
  visible.
- [ ] **Cuentas favoritas por centro de costo** (solo prototipos de banca empresarial):
  agregar la posibilidad simulada de marcar una cuenta como favorita para
  dispersiones/centros de costo específicos.
- [ ] **Mensajes de aprobador "conscientes de identidad"**: en los flujos de
  notificación/aprobación (`aprobacion-whatsapp/`), el mensaje debe presuponer que ya sabe
  quién es el aprobador (nombre, banco, cuenta) y saltar los pasos de verificación
  redundantes — mostrar solo revisión + aprobación.
- [ ] **Versión "banco Aval" además de TESO**: para los prototipos de banca empresarial que
  hoy solo tienen versión TESO, construir una segunda versión con el look & feel de un
  banco Aval real (ej. Banco de Bogotá) reutilizando los `theme-<bankKey>` existentes.
  Aplica prioritariamente a `factura-rtp/` y `mandato-empresarial/`.

---

## 2. Cambios por prototipo existente

### `factura-rtp/` (B1 — Factura con RTP embebido)
- [ ] Agregar selección de cuáles facturas pagar (checkboxes), no solo pagar todo o nada.
- [ ] Agregar alertas visuales de vencimiento (semáforo: rojo = próxima a vencer, ámbar =
  próxima, verde = con margen).
- [ ] Agregar rangos de pago configurables por proveedor (ej. "pago a 30/60/90 días").
- [ ] Agregar vista de flujo de caja proyectado (cuánto dinero acumulado por pagar, por
  fecha) — pensada para exponerse en TESO.
- [ ] Construir segunda versión embebida en portal de banco Aval (ver punto transversal).

### `mandato-empresarial/` (B2 — Recaudo recurrente con mandato, empresarial)
- [ ] Mantener el prototipo conceptual actual sin cambios de fondo por ahora.
- [ ] **Nuevo work item aparte** (no en este prototipo): documentar en
  `docs/prototipos/tareas-mvp-debito-automatico.md` un análisis de MVP real que aproveche
  la capacidad de débito automático ya existente en ACH Transferencias. Pendiente de
  insumos de sesión con Luis y Walter — no bloquea este documento, se agrega cuando esté
  disponible.
- [ ] Construir segunda versión embebida en portal de banco Aval (ver punto transversal).

### `aprobacion-whatsapp/` (B6 — Notificación multicanal a aprobador)
- [ ] Aplicar el cambio transversal de "mensaje consciente de identidad": quitar pasos de
  selección de banco/cuenta/verificación cuando el aprobador ya está identificado.

### `factoring/` (B5 — Cobro a proveedores vía factoring)
- [ ] Evaluar ampliar el alcance a un marketplace de facturas (empresa sube factura →
  inversionistas de factoring la compran) — **no iniciar aún**, pendiente de sesión con
  empresas de factoring para entender el flujo operativo real. Dejar como backlog explícito
  en el documento de tareas del prototipo.

### `marketplace-b2b/` (B7 — Checkout B2B en marketplace)
- [ ] Sin cambios funcionales solicitados en esta sesión.

### `vaquita/`, `cobro-masivo/`, `p2p-motivo/`, `proximidad-sin-qr/`, `tramite-vida/`,
`mandato-domestico/`
- [ ] Sin cambios funcionales solicitados en esta sesión. Aplican los cambios transversales
  de identificación/cuenta por defecto donde corresponda según el tipo de flujo (personal
  vs. empresarial).

---

## 3. Nuevo prototipo a construir

### `split-payment/` (B8 — Split payment, nueva)
Caso de uso sugerido en la sesión: pago de una factura o cobro combinando múltiples
fuentes/cuentas, cuando una sola cuenta no cubre el monto total. Equivalente al caso de
uso ya existente en PSE (pago desde múltiples fuentes con múltiples facturas), trasladado
al contexto RTP para empresas.

Alcance sugerido del prototipo:
- Empresa recibe un cobro (factura o RTP directo) que supera el saldo disponible en una
  sola cuenta.
- El flujo permite seleccionar dos o más cuentas/entidades de origen y definir cuánto
  aporta cada una.
- Confirmación única que dispara los débitos combinados.
- Confirmación al beneficiario de que el pago se completó (sin exponer el detalle del
  split, solo el monto total recibido).

Crear documento de tareas: `docs/prototipos/tareas-b8-split-payment.md` antes de construir
las pantallas, siguiendo la convención ya usada para los demás prototipos.

Actualizar `index.html` raíz: agregar `demo-card` en la sección correspondiente (B2B) y
actualizar el contador de "Demos disponibles" (pasaría de 15 a 16).

---

## 4. Decisión sobre experiencias pendientes (no construir aún)

Quedan sin prototipar: **B4** (workflow de aprobación multiusuario), **C4** (notificación
"pagar después"), **C7** (confirmación biométrica en WhatsApp).

- [ ] No iniciar construcción de estos tres en este ciclo.
- [ ] Documentar en `plan-implementacion-ronda2.md` (sección "próximos pasos") la
  aclaración obtenida en la sesión sobre B4: la cadena/reglas de aprobación las define el
  esquema de administración de cada banco, no ACH; el prototipo solo necesita mostrar el
  componente visual de qué pasos de la solicitud ya se cumplieron, con dos patrones
  (aprobación simultánea vs. secuencial).
- [ ] Evaluar en la reunión del martes si amerita abrir una "ronda 3" con estos tres casos.

---

## 5. Documentación a actualizar en el repo

- [ ] `referencias/gou-payments-rtp-experiencias.md`: reemplazar por la versión adjunta a
  este cambio (ya incluye estado de prototipos, refinamientos por caso, B8, y próximos
  pasos).
- [ ] `docs/prototipos/plan-implementacion-ronda2.md`: agregar nota en "próximos pasos"
  sobre la aclaración de B4 (ver punto 4).
- [ ] Crear `docs/prototipos/tareas-b8-split-payment.md` (ver punto 3).
- [ ] Crear `docs/prototipos/tareas-mvp-debito-automatico.md` cuando estén los insumos de
  la sesión con Luis y Walter (ver punto 2, `mandato-empresarial/`).

---

## Prioridad sugerida (antes de la demo del jueves)

1. Cambios transversales de identificación/cuenta por defecto (impacto visual inmediato en
   la demo).
2. Versión "banco Aval" de `factura-rtp/` y `mandato-empresarial/` (pedido explícito de
   Valeria para el jueves).
3. Refinamientos específicos de `factura-rtp/` (selección de facturas, alertas, rangos).
4. Ajuste de `aprobacion-whatsapp/`.
5. `split-payment/` y ampliación de `factoring/` — no bloquean la demo del jueves, pueden
   ir después.
