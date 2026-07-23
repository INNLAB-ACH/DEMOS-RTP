# Tareas — C1: P2P con motivo o plantilla

> Ola 1 · Quick win · B2C · Complejidad baja
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección C1.

## Resumen del flujo

Una persona elige una plantilla de cobro (arriendo, cuenta compartida, préstamo entre
amigos, etc.) o escribe un motivo libre, genera un RTP dirigido a un contacto, y ese
contacto recibe la solicitud, la revisa con el motivo visible y paga con un tap.

**Flujo de referencia:** Elige plantilla → RTP con motivo estructurado → contacto recibe
notificación → paga con un tap → confirmación a ambos.

## Actores

- **Cobrador**: persona que inicia la solicitud (dueño del cobro).
- **Pagador**: contacto que recibe el RTP y decide pagar.

## Por qué es quick win

Es una extensión directa del RTP asíncrono ya prototipado en `whatsapp/`. Solo se agrega
un campo de metadata (motivo/plantilla) al mensaje de cobro; no requiere infraestructura
ni pantallas de autenticación nuevas — reutiliza `screenBiometric`, `sheetBankPicker` y el
patrón de recibo (`sheetReceipt`) del prototipo de WhatsApp.

## Pantallas a construir

1. **Selección de plantilla** (lado cobrador, opcional simular con un mock estático o
   captura, no interactivo — el foco del prototipo es la experiencia del pagador):
   arriendo, servicios, préstamo, otro (texto libre).
2. **Mensaje de cobro con motivo visible** — burbuja de chat o notificación push mostrando
   monto + motivo + nombre del cobrador.
3. **Detalle del cobro** (`sheetDetail` adaptado) — debe mostrar el motivo de forma
   destacada, no solo el monto.
4. **Selección de banco/cuenta** (reusar `sheetBankPicker` de `whatsapp/`).
5. **Autorización biométrica** (reusar `screenBiometric`).
6. **Recibo final** (`sheetReceipt`) — debe incluir el motivo en el comprobante.

## Tareas técnicas

- [ ] Crear carpeta `p2p-motivo/` con `index.html`, `styles.css`, `app.js`.
- [ ] Partir de `whatsapp/index.html` y `whatsapp/app.js` como base; eliminar las rutas de
      comercio (login de negocio, catálogo) que no aplican a P2P.
- [ ] Definir el objeto de estado del cobro con campo de motivo, ej.:
      `{ amount, template, motivo, payerName, requesterName, paid }`.
- [ ] Añadir selector de plantilla como parte del contexto inicial (mock, no requiere
      lógica de negocio real — puede ser un valor fijo pasado al cargar la página, ej. vía
      un pequeño menú de "escenarios" como hace `pago-presente` con sus dos flujos).
- [ ] Mostrar el motivo en: mensaje/notificación inicial, `sheetDetail`, y `sheetReceipt`.
- [ ] Reusar `formatCOP` y `currentTime` (patrón de `suscrito/app.js` /
      `pago-presente/app.js`).
- [ ] Reusar temas de banco (`theme-<bankKey>`) y `applyBankTheme` del prototipo whatsapp.
- [ ] Ajustar copys a contexto P2P (persona a persona, no comercio a persona).

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · P2P` y enlace a
      `./p2p-motivo/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- El motivo/plantilla es visible en las tres pantallas clave (notificación, detalle,
  recibo).
- El flujo de pago (banco → cuenta → biometría → recibo) funciona igual de fluido que en
  el prototipo whatsapp existente.
- No se introduce ninguna pantalla de infraestructura nueva (login, mandato, aprobación).

## Fuera de alcance

- Selección real de contactos o libreta de direcciones.
- Lógica de plantillas configurables por el usuario (se simula con datos fijos).
