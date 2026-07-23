# Tareas — B2 + C2: Motor de mandatos/recurrencia (enabler compartido)

> Ola 3 · B2B (B2) + B2C (C2) · Complejidad alta
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), secciones B2, C2 y "Lecturas del cruce B2B/B2C".

## Por qué van juntas en un solo documento

El documento de referencia identifica que **B2 (recaudo recurrente con mandato,
empresarial) y C2 (recaudo recurrente doméstico, persona natural) comparten exactamente el
mismo gap**: hoy no existe en Cóbrame un motor de mandatos/autorización previa. Es el
enabler de mayor apalancamiento del catálogo — se diseña **una sola vez** y se expone en
dos superficies. También es, según el análisis de referencia, el terreno donde ACH puede
diferenciarse más claramente de Bre-B (que por diseño P2P simple no soporta recurrencia
con mandato).

Este documento cubre el diseño del enabler y las tareas de **dos prototipos**
(`mandato-empresarial/` y `mandato-domestico/`) que comparten la misma lógica de ciclo de
vida del mandato pero con actores y copys distintos.

## Resumen de los flujos de referencia

**B2 — Recaudo recurrente con mandato (empresarial):**
Proveedor configura mandato → cliente corporativo autoriza una vez → RTP se envía cada
ciclo → cliente confirma rápido → pago se ejecuta.

**C2 — Recaudo recurrente doméstico:**
Comercio/servicio configura cobro periódico → usuario autoriza una vez → RTP se envía
cada ciclo → usuario confirma rápido → pago se ejecuta.

Ambos flujos son estructuralmente idénticos: **autorización previa (mandato) + cobros
periódicos con confirmación ligera**.

## Diseño del enabler: ciclo de vida del mandato

Antes de tocar pantallas, dejar claro el modelo de estados que ambos prototipos
comparten:

1. **Propuesta de mandato** — el cobrador (proveedor/comercio) define: beneficiario,
   monto (fijo o variable con tope), frecuencia (mensual, quincenal, etc.), vigencia
   (fecha fin u "hasta cancelar").
2. **Autorización única** — el pagador revisa las condiciones del mandato completo (no
   solo un monto) y autoriza una sola vez con biometría.
3. **Mandato activo** — queda registrado; se simulan ciclos de cobro sucesivos.
4. **Cobro por ciclo** — cada ciclo genera un RTP ligero referenciando el mandato ya
   autorizado; el pagador solo confirma (no vuelve a autorizar desde cero, a menos que el
   monto exceda el tope pactado).
5. **Cancelación** — el pagador puede revocar el mandato en cualquier momento (pantalla de
   gestión de mandatos activos).

Este modelo de 5 estados debe quedar representado en el código de forma explícita (ej. un
enum o campo `estadoMandato`) para que sea reconocible como el enabler transversal, no
solo un flujo de pago más.

## Prototipo 1 — `mandato-empresarial/` (B2)

### Actores
- **Proveedor**: configura el mandato de recaudo.
- **Cliente corporativo**: autoriza el mandato y confirma los cobros periódicos desde su
  banca empresarial.

### Pantallas
1. Configuración del mandato (lado proveedor) — puede ser un mock estático de contexto.
2. Solicitud de autorización de mandato (banca empresarial) — debe mostrar condiciones
   completas: monto, frecuencia, vigencia, tope.
3. Autorización única (biometría o firma corporativa simulada).
4. Pantalla de "mandato activo" — confirmación de que quedó registrado.
5. Notificación de cobro de ciclo — versión ligera, solo "confirmar" (reusar patrón de B6
   para notificación fuera de la banca si aplica).
6. Gestión de mandatos activos — vista con opción de cancelar.

## Prototipo 2 — `mandato-domestico/` (C2)

### Actores
- **Comercio/servicio**: configura el cobro periódico (ej. gimnasio, colegio, plan de
  telefonía).
- **Usuario**: autoriza el mandato y confirma los cobros periódicos desde su app bancaria
  personal.

### Pantallas
Mismas 6 pantallas que el prototipo empresarial, adaptadas a contexto de persona natural
y reusando directamente los patrones de `suscrito/` (que ya simula un cobro recurrente de
suscripción, aunque sin el paso explícito de mandato/autorización previa).

## Tareas técnicas (aplican a ambos prototipos)

- [ ] Definir un módulo de estado de mandato compartido en el diseño (puede vivir
      duplicado en cada `app.js` dado que son prototipos estáticos independientes, pero
      con la misma forma de datos):
      `{ mandatoId, beneficiario, montoPactado, frecuencia, vigencia, tope, estadoMandato,
      ciclos: [{ fecha, monto, estado }] }`.
- [ ] Crear carpeta `mandato-empresarial/` con `index.html`, `styles.css`, `app.js`,
      partiendo de `in-bank/` (checkout síncrono) para la parte de autorización.
- [ ] Crear carpeta `mandato-domestico/` con `index.html`, `styles.css`, `app.js`,
      partiendo de `suscrito/` como base, extendiéndolo con el paso explícito de
      autorización de mandato que hoy no tiene.
- [ ] Construir la pantalla de "condiciones del mandato" en ambos prototipos, mostrando
      monto, frecuencia, vigencia y tope de forma clara antes de la autorización.
- [ ] Construir la pantalla de "mandato activo" post-autorización.
- [ ] Simular al menos 2 ciclos de cobro sucesivos para demostrar que la segunda
      confirmación es más ligera que la primera (sin repetir biometría completa, o con una
      versión simplificada).
- [ ] Construir la pantalla de gestión/cancelación de mandato.
- [ ] Reusar `formatCOP`, `currentTime`, `applyBankTheme` y el patrón de sheets/overlays
      ya existentes.
- [ ] Mantener las pantallas de ambos prototipos visualmente consistentes entre sí (mismo
      componente de "condiciones del mandato"), variando solo copys y contexto de actor.

## Integración con el índice general

- [ ] Agregar dos `demo-card` en `index.html` (raíz): `Canal · B2B / Mandato` →
      `./mandato-empresarial/index.html`, y `Canal · Recurrencia doméstica` →
      `./mandato-domestico/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html` (+2).

## Criterios de aceptación

- El ciclo de vida del mandato (propuesta → autorización única → activo → cobro por
  ciclo → cancelación) es reconocible en ambos prototipos con la misma estructura.
- La autorización del primer ciclo es visiblemente más completa que la confirmación de
  ciclos posteriores — esto es lo que valida la propuesta de valor del mandato.
- Existe una pantalla de cancelación funcional en ambos prototipos.

## Fuera de alcance

- Persistencia real de mandatos o integración con un motor de recurrencia real.
- Lógica de reintentos por fondos insuficientes.
- Extensión a B3 (cobro masivo) o B4 (aprobación multiusuario) — quedan para una ronda
  futura, aunque el modelo de estados aquí definido debería ser reutilizable para ellas.
