# Tareas — C5: Cobro por evento de vida (trámites)

> Ola 5 · B2C · Complejidad media
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección C5.

## Resumen del flujo

Una entidad pública o EPS genera un trámite (ej. duplicado de documento, copago médico,
certificado) con los datos del ciudadano precargados. El ciudadano recibe el cobro en su
banco y paga sin necesidad de digitar ninguna referencia manualmente.

**Flujo de referencia:** Entidad genera trámite → RTP con datos precargados → ciudadano
recibe en su banco → paga sin digitar referencia → entidad recibe trazabilidad.

## Actores

- **Entidad pública/EPS**: genera el trámite y el cobro asociado (rol de contexto, no
  interactivo a fondo).
- **Ciudadano**: recibe el cobro con los datos ya precargados y paga.

## Enabler / gap identificado

Se parece a CU01 trasladado a RTP; reutiliza la idea de precarga de datos que ya usa PSE.
Es la única experiencia de esta ronda sin dependencia directa de un prototipo existente,
aunque comparte el espíritu de "detalle con metadata precargada" que ya se prototipó en
`factura-rtp/` (B1) — la diferencia es el actor (entidad pública/EPS vs. empresa) y que
aquí no hay conciliación contra ERP sino trazabilidad del trámite.

## Esquema mínimo de metadata a simular

- Tipo de trámite (ej. "Copago consulta médica", "Duplicado de cédula", "Certificado de
  tradición").
- Entidad emisora (ej. EPS Sanitas, Registraduría, Curaduría Urbana).
- Número de radicado del trámite.
- Nombre del ciudadano (precargado, no editable).
- Fecha límite de pago.

## Pantallas a construir

1. **Notificación del trámite** (push o mensaje) — debe mostrar tipo de trámite, entidad
   emisora y monto, sin pedir ningún dato al ciudadano todavía.
2. **Detalle del trámite con datos precargados** (adaptar el patrón de `sheetDetail` /
   detalle de factura de `factura-rtp/`) — mostrar radicado, nombre del ciudadano
   (precargado), entidad, fecha límite. Ningún campo debe ser editable ni requerir
   digitación.
3. **Selección de cuenta a debitar** (reusar patrón de selección de cuenta de `in-bank/`
   o `factura-rtp/`).
4. **Autorización** (reusar patrón de biometría existente).
5. **Confirmación con trazabilidad** — pantalla final mostrando el número de radicado y un
   estado de "Trámite pagado — trazabilidad enviada a [entidad]" (simulado, análogo al
   `conciliacionId` de `factura-rtp/` pero con foco en trazabilidad del trámite, no
   conciliación contable).

## Tareas técnicas

- [ ] Crear carpeta `tramite-vida/` con `index.html`, `styles.css`, `app.js`.
- [ ] Definir objeto de estado del trámite:
      `{ tipoTramite, entidadEmisora, numeroRadicado, nombreCiudadano, fechaLimite,
      monto, paid }`.
- [ ] Construir la pantalla de detalle con los datos precargados, dejando explícito en el
      copy que "no necesitas ingresar ninguna referencia" (mensaje diferenciador del
      flujo tradicional PSE).
- [ ] Reusar `formatCOP`, selección de cuenta y biometría de `in-bank/app.js` o
      `factura-rtp/app.js`.
- [ ] Construir la pantalla final de confirmación con trazabilidad (radicado + mensaje de
      envío a la entidad), inspirada en el patrón `conciliacionId` de `factura-rtp/app.js`
      pero renombrada al contexto de trámite (ej. `trazabilidadId`).
- [ ] Usar una paleta o iconografía que remita a sector público/salud (distinta de la
      paleta azul-acero usada en `factura-rtp/` para B2B privado), para diferenciar el
      contexto.

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · Trámites / Sector público` y
      enlace a `./tramite-vida/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- El ciudadano nunca tiene que digitar una referencia, radicado o dato propio en ningún
  punto del flujo — todo llega precargado.
- La pantalla final comunica trazabilidad hacia la entidad, no solo confirmación de pago.
- El flujo de pago (cuenta → autorización → confirmación) es igual de fluido que en los
  prototipos existentes.

## Fuera de alcance

- Integración real con sistemas de entidades públicas o EPS.
- Múltiples trámites simultáneos o historial de trámites pagados (se simula uno solo).
