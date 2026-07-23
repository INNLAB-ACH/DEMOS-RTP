# Tareas — C6: Solicitud colaborativa (vaquita)

> Ola 2 · B2C · Complejidad media
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección C6.

## Resumen del flujo

Un organizador crea una solicitud de cobro colectiva, que se distribuye a un grupo de
contactos. Cada contacto paga su parte de forma independiente, y el organizador ve un
consolidado del estado (quién pagó, quién falta) hasta alcanzar la meta.

**Flujo de referencia:** Organizador crea solicitud → se distribuye a contactos → cada
uno paga su parte → organizador ve consolidado → meta alcanzada.

## Actores

- **Organizador**: crea la vaquita y define monto total/por persona y lista de
  participantes.
- **Participante**: recibe su porción del cobro y paga individualmente.

## Enabler / gap identificado

Distribución **1-a-muchos con consolidado de estado** — no existe hoy en el catálogo
prototipado. Comparte lógica con B3 (cobro masivo de cartera), por lo que el diseño del
consolidado debe hacerse de forma genérica, pensando en que podría reutilizarse si B3 se
prioriza en una ronda futura.

## Pantallas a construir

1. **Creación de la vaquita** (lado organizador) — nombre de la meta, monto total o por
   persona, lista de participantes. Puede simularse con un formulario simple, no
   necesita persistencia real.
2. **Notificación individual a un participante** (reusar patrón de mensaje/push de
   `whatsapp/` o `suscrito/`) — debe mostrar el contexto de grupo: "X te invitó a aportar
   a [meta]", monto de la parte individual, cuánto se ha recaudado hasta el momento.
3. **Detalle del aporte individual** — monto de la parte, meta total, progreso actual.
4. **Selección de banco/cuenta y autorización** (reusar `sheetBankPicker` +
   `screenBiometric`).
5. **Confirmación del aporte individual** (`sheetReceipt` adaptado).
6. **Vista de consolidado (lado organizador)** — lista de participantes con su estado
   (pagó / pendiente), barra de progreso hacia la meta. Esta es la pantalla distintiva de
   esta experiencia y debe tener foco especial en la demo.

## Tareas técnicas

- [ ] Crear carpeta `vaquita/` con `index.html`, `styles.css`, `app.js`.
- [ ] Definir estado de la solicitud colectiva:
      `{ metaNombre, montoTotal, montoPorPersona, participantes: [{ nombre, estado,
      montoAportado }], organizador }`.
- [ ] Construir la pantalla de consolidado con barra de progreso (meta alcanzada vs.
      recaudado), reutilizando el estilo de `kpi-bar`/`kpi-item` de `assets/index.css`
      como inspiración para el resumen visual.
- [ ] Construir el flujo individual de aporte reusando `sheetBankPicker`,
      `screenBiometric` y `sheetReceipt` de `whatsapp/app.js`.
- [ ] Simular la actualización del consolidado: al completar el pago de un participante
      mock, actualizar dinámicamente su estado en la vista de consolidado (puede ser con
      un botón "Simular pago de otro participante" para no requerir múltiples sesiones).
- [ ] Reusar `formatCOP` para todos los montos (total, por persona, recaudado).
- [ ] Diseñar el consolidado de forma genérica en el código (lista de items con estado +
      total), para facilitar su reuso si se prioriza B3 después.

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · Colaborativo` y enlace a
      `./vaquita/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- La vista de consolidado comunica claramente el progreso grupal (recaudado / meta) y el
  estado individual de cada participante.
- El flujo de aporte individual (banco → cuenta → autorización → recibo) es igual de
  fluido que en los prototipos existentes.
- El código de manejo del consolidado está aislado lo suficiente como para poder
  reutilizarse en un futuro prototipo de B3.

## Fuera de alcance

- Persistencia real o backend de agregación de pagos.
- Notificaciones automáticas de recordatorio a participantes pendientes.
- Reparto desigual configurable dinámicamente entre participantes (se puede simular un
  caso fijo con montos distintos si aporta valor a la demo, pero no es requerido).
