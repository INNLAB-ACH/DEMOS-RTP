# Plan de implementación — Nuevos prototipos RTP (GOU Payments / Grupo Aval)

## Contexto

ACH Colombia ya cuenta con 4 demos interactivos de Request to Pay (RTP) para persona
natural (in-bank/ecommerce, suscrito/recurrente, whatsapp/conversacional,
pago-presente/QR dinámico). El siguiente paso, definido en
[`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md),
es extender el catálogo hacia B2B y ampliar B2C, pensando en GOU Payments como
consumidor de esta infraestructura para los bancos de Grupo Aval.

De las 14 experiencias identificadas en el documento de referencia, este plan cubre las
**6 seleccionadas** para pasar a prototipo detallado:

| # | Experiencia | Tipo | Complejidad |
|---|---|---|---|
| C1 | P2P con motivo o plantilla | B2C | Baja |
| B6 | Notificación multicanal a aprobador | B2B | Baja-Media |
| B1 | Factura con RTP embebido | B2B | Media |
| C6 | Solicitud colaborativa (vaquita) | B2C | Media |
| B2 | Recaudo recurrente con mandato | B2B | Alta |
| C2 | Recaudo recurrente doméstico | B2C | Alta |

## Objetivo

Producir, para cada experiencia, un prototipo interactivo navegable (HTML/CSS/JS estático,
siguiendo la convención de carpetas ya usada en el repo) que permita validar la experiencia
de usuario extremo a extremo, sin necesidad de backend real.

## Principio de diseño heredado del análisis de referencia

- **B2 y C2 comparten el mismo gap**: el motor de mandatos/recurrencia no existe hoy en
  Cóbrame. Se diseña **una sola vez** como enabler transversal y se prototipa en un único
  documento de tareas, con una capa visual distinta para cada lado (banca empresarial vs.
  banca personal).
- **B6 y C1 son quick wins**: reutilizan flujos ya construidos (WhatsApp asíncrono y RTP
  asíncrono respectivamente) sin requerir infraestructura nueva. Van primero.
- **B1** se apoya en Cóbrame síncrono ya prototipado (in-bank), sumando metadata de
  factura.
- **C6** requiere lógica de distribución 1-a-muchos con consolidado de estado — nueva en
  el catálogo actual, pero acotada.

## Fases (Olas)

### Ola 1 — Quick wins (sin enablers nuevos)
1. **C1 — P2P con motivo o plantilla**
2. **B6 — Notificación multicanal a aprobador**

Objetivo de la ola: entregar dos prototipos completos reutilizando al máximo el código y
los patrones visuales existentes (whatsapp/, in-bank/), validando que el estilo de demo
se traslada bien al contexto B2B (B6) y a P2P (C1).

### Ola 2 — Extensiones de complejidad media
3. **B1 — Factura con RTP embebido**
4. **C6 — Solicitud colaborativa (vaquita)**

Objetivo de la ola: introducir los primeros conceptos nuevos de UI — metadata de factura
conciliable (B1) y distribución uno-a-muchos con consolidado (C6) — sin todavía requerir
un motor de mandatos.

### Ola 3 — Enabler transversal de mayor apalancamiento
5. **B2 — Recaudo recurrente con mandato** (banca empresarial)
6. **C2 — Recaudo recurrente doméstico** (banca personal)

Objetivo de la ola: prototipar el motor de mandatos/autorización previa una sola vez y
aplicarlo a ambas superficies. Esta es la ola de mayor valor diferencial frente a Bre-B,
según el análisis de referencia, por lo que su diseño de flujo debe quedar sólido antes de
construir las pantallas.

## Enfoque técnico por prototipo

Cada prototipo se construye como una carpeta independiente en la raíz del repo, siguiendo
la convención ya establecida:

```
<nombre-prototipo>/
  index.html
  styles.css
  app.js
```

- Reutilizar `assets/index.css` y los temas de banco (`theme-<bankKey>`) ya definidos en
  los prototipos existentes cuando la pantalla sea banca personal/empresarial.
- Reutilizar patrones de `whatsapp/app.js` (manejo de sheets/overlays, `hideAllSheets`,
  temas de banco) para los flujos conversacionales o de notificación.
- Cada prototipo nuevo se enlaza desde `index.html` (raíz) agregando un `demo-card` en la
  grilla de demos, actualizando el KPI de "Demos disponibles".

## Entregables de este plan

- Este documento (`plan-implementacion.md`).
- Un documento de tareas por prototipo (o par de prototipos cuando comparten enabler):
  - `tareas-c1-p2p-motivo.md`
  - `tareas-b6-notificacion-multicanal.md`
  - `tareas-b1-factura-rtp.md`
  - `tareas-c6-vaquita.md`
  - `tareas-b2-c2-motor-mandatos.md`

## Riesgos y dependencias

| Riesgo | Mitigación |
|---|---|
| El motor de mandatos (B2/C2) no tiene precedente en el repo — mayor riesgo de alcance impreciso | Diseñar primero el flujo de autorización previa y ciclo de cobro en el documento de tareas antes de tocar código |
| B1 requiere estandarizar metadata factura-RTP que no existe hoy | Definir un esquema mínimo de metadata (concepto, número de factura, ERP de origen) como parte del prototipo, sin pretender integración real |
| C6 comparte lógica con B3 (cobro masivo, fuera de alcance actual) | Diseñar el consolidado de estado de forma genérica para que sea reutilizable si B3 se prioriza después |
| Duplicar esfuerzo entre B2 y C2 | Un solo documento de tareas cubre el enabler compartido; las pantallas se prototipan por separado |

## Próximos pasos posteriores a este plan

- Priorizar entre las 8 experiencias restantes del documento de referencia (B3, B4, B5, B7,
  C3, C4, C5, C7) para una siguiente ronda.
- Evaluar si el prototipo del motor de mandatos (Ola 3) debe convertirse en un enabler de
  plataforma documentado aparte, dado que sirve a más de una experiencia futura (B3, B4).
