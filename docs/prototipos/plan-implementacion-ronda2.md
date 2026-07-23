# Plan de implementación — Ronda 2 (GOU Payments / Grupo Aval)

## Contexto

Continuación de [`plan-implementacion.md`](./plan-implementacion.md), que cubrió las
primeras 6 experiencias priorizadas (C1, B6, B1, C6, B2, C2 — ya construidas como
prototipos: `p2p-motivo/`, `aprobacion-whatsapp/`, `factura-rtp/`, `vaquita/`,
`mandato-empresarial/`, `mandato-domestico/`).

Esta ronda cubre las **5 experiencias adicionales** seleccionadas de las 8 restantes en
[`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md):

| # | Experiencia | Tipo | Complejidad |
|---|---|---|---|
| C3 | RTP por proximidad, sin QR | B2C | Baja-Media |
| B7 | Checkout B2B en marketplace | B2B | Media |
| C5 | Cobro por evento de vida (trámites) | B2C | Media |
| B3 | Cobro masivo de cartera (batch) | B2B | Media-Alta |
| B5 | Cobro a proveedores vía factoring | B2B | Alta |

Quedan fuera de esta ronda: **B4** (workflow de aprobación multiusuario) y **C4/C7**
(notificación "pagar después" y confirmación biométrica en WhatsApp) — no fueron
seleccionadas.

## Principio de diseño: reutilizar lo ya construido

A diferencia de la ronda 1, en esta ronda **cuatro de las cinco experiencias dependen
directamente de un prototipo ya existente**, no solo de un flujo genérico:

- **C3** es una variante directa de `pago-presente/` (QR dinámico) — cambia únicamente el
  método de identificación del pagador.
- **B7** es una variante de `in-bank/` (checkout síncrono ecommerce) con una capa de
  validación de rol empresarial.
- **B5** depende explícitamente de `factura-rtp/` (B1) — reutiliza su esquema de metadata
  de factura y agrega la redirección de beneficiario hacia el factor.
- **B3** comparte lógica de distribución y consolidado de estado con `vaquita/` (C6) — el
  documento de tareas de C6 ya dejó el consolidado diseñado de forma genérica pensando en
  este caso.
- **C5** es la única sin dependencia directa de un prototipo existente, aunque se apoya en
  el mismo patrón de "detalle con metadata precargada" usado en `factura-rtp/`.

## Fases (Olas)

### Ola 4 — Quick win + variante de flujo ya validado
1. **C3 — RTP por proximidad, sin QR** (variante de `pago-presente/`)
2. **B7 — Checkout B2B en marketplace** (variante de `in-bank/`)

Ambas requieren cambios acotados sobre prototipos existentes: identificación sin QR en un
caso, validación de rol empresarial en el otro. Van primero por su bajo riesgo de alcance.

### Ola 5 — Extensión de metadata y precarga
3. **C5 — Cobro por evento de vida (trámites)**

Introduce el patrón de "entidad genera trámite con datos precargados, ciudadano paga sin
digitar referencia" — similar en espíritu a `factura-rtp/` pero con actor público/EPS en
vez de empresa privada.

### Ola 6 — Reutilización de enablers construidos en ronda 1
4. **B3 — Cobro masivo de cartera (batch)** (reutiliza el consolidado de `vaquita/`)
5. **B5 — Cobro a proveedores vía factoring** (reutiliza la metadata de `factura-rtp/`)

Estas dos cierran el círculo de la ronda 1: convierten los enablers genéricos ya
construidos (consolidado 1-a-muchos, metadata factura-RTP) en las capacidades para las
que originalmente se diseñaron con esa reutilización en mente.

## Enfoque técnico

Se mantiene la convención ya establecida: cada prototipo en su propia carpeta
(`index.html` + `styles.css` + `app.js`, estático, sin build step), enlazado desde el
`index.html` raíz con un `demo-card` nuevo en la sección "Nuevas experiencias RTP".

## Entregables de este plan

- Este documento (`plan-implementacion-ronda2.md`).
- Un documento de tareas por prototipo:
  - `tareas-c3-proximidad.md`
  - `tareas-b7-marketplace.md`
  - `tareas-c5-tramites.md`
  - `tareas-b3-cobro-masivo.md`
  - `tareas-b5-factoring.md`

## Riesgos y dependencias

| Riesgo | Mitigación |
|---|---|
| B5 y B3 dependen de prototipos de la ronda 1 (`factura-rtp/`, `vaquita/`) — cualquier cambio futuro en esos prototipos puede desalinear estas extensiones | Documentar explícitamente en cada tarea qué partes de `factura-rtp/`/`vaquita/` se reutilizan, para poder revalidar si esos prototipos cambian |
| C3 elimina el QR como método de identificación — riesgo de ambigüedad de a quién se le está cobrando si el alias/celular no es único | El prototipo debe simular una pantalla de confirmación de identidad ("¿Eres tú, [nombre enmascarado]?") antes de proceder al pago |
| B7 requiere "validación de rol empresarial" sin que exista hoy un enabler real de roles | Simular con un mock simple (selector de rol en el checkout), documentado como no-funcional real |

## Próximos pasos posteriores a esta ronda

- De las 14 experiencias originales, solo quedarían sin prototipar B4 (aprobación
  multiusuario), C4 (pagar después) y C7 (biometría en WhatsApp) — evaluar si ameritan una
  ronda 3.
- Revisar si conviene consolidar el patrón de consolidado 1-a-muchos (`vaquita/` + `B3`) en
  un solo módulo de referencia, dado que ya se usa en dos prototipos.
