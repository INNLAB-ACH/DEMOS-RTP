# Tareas — B6: Notificación multicanal a aprobador

> Ola 1 · Quick win · B2B · Complejidad baja-media
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección B6.

## Resumen del flujo

Un RTP entra a la banca empresarial de una compañía, y en paralelo se replica como alerta
en un canal externo (WhatsApp o correo) hacia un aprobador que está fuera de la oficina.
El aprobador revisa el cobro desde ese canal, confirma, y el pago se ejecuta.

**Flujo de referencia:** RTP entra a banca empresarial → alerta se replica en
WhatsApp/correo → aprobador revisa fuera de oficina → confirma → pago se ejecuta.

## Actores

- **Empresa pagadora**: recibe el RTP en su banca empresarial (contexto interno, se puede
  simular con una pantalla simple de "bandeja de cobros").
- **Aprobador**: persona con poder de aprobación que no está frente al computador de la
  empresa; recibe y actúa desde WhatsApp.

## Por qué es quick win

Es una extensión casi literal del flujo asíncrono de WhatsApp ya construido (`whatsapp/`).
Lo único que cambia es el **contexto del mensaje** (aprobador corporativo revisando un
cobro de la empresa, no una persona pagando su propia compra) y el **remitente** (banca
empresarial en vez de un comercio).

## Pantallas a construir

1. **Bandeja de cobros pendientes (banca empresarial)** — pantalla simple, no
   necesariamente interactiva a fondo, que muestra el RTP entrante con su estado
   "esperando aprobación". Sirve de contexto, no es el foco de la demo.
2. **Alerta replicada en WhatsApp** — mensaje entrante estilo notificación con: nombre de
   la empresa pagadora, monto, proveedor/beneficiario, y CTA "Revisar y aprobar".
3. **Detalle del cobro para el aprobador** (adaptar `sheetDetail`) — debe mostrar
   claramente que se trata de una aprobación corporativa: nombre de la empresa, centro de
   costo o área, monto, beneficiario.
4. **Selección de banco/cuenta corporativa** (reusar `sheetBankPicker`, renombrando a
   cuentas empresariales si aplica).
5. **Autorización** (reusar `screenBiometric` o, si se quiere diferenciar de B2C, usar una
   confirmación con doble check "Confirmo como aprobador").
6. **Recibo/confirmación** (`sheetReceipt`) — debe indicar que la aprobación quedó
   registrada, no solo que el pago se hizo.

## Tareas técnicas

- [ ] Crear carpeta `aprobacion-whatsapp/` con `index.html`, `styles.css`, `app.js`,
      partiendo de `whatsapp/` como base.
- [ ] Adaptar el objeto de estado del cobro para incluir campos corporativos:
      `{ amount, empresaPagadora, beneficiario, centroCosto, aprobador, paid }`.
- [ ] Construir la pantalla de "bandeja de cobros" como contexto inicial (puede ser
      estática, un solo estado "pendiente de aprobación").
- [ ] Adaptar los copys del mensaje de WhatsApp para reflejar una alerta corporativa
      ("Tienes un cobro pendiente de aprobar por $X de [empresa]") en vez de un cobro
      directo a la persona.
- [ ] Reusar `hideAllSheets`, `applyBankTheme` y el manejo de overlays de
      `whatsapp/app.js`.
- [ ] Diferenciar visualmente (badge o etiqueta) que se trata de una aprobación
      empresarial, no un pago personal.
- [ ] Ajustar el recibo final para reflejar "Aprobación registrada" + detalle de la
      transacción.

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · B2B / Aprobación` y
      enlace a `./aprobacion-whatsapp/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- Queda claro para quien ve la demo que el aprobador no es el dueño final del gasto, sino
  alguien aprobando en nombre de la empresa.
- El flujo reutiliza al menos el 80% del código de `whatsapp/app.js` sin duplicar lógica
  de sheets/overlays.
- La confirmación final distingue explícitamente "aprobación" de "pago directo".

## Fuera de alcance

- Workflow de aprobación multiusuario con umbrales (eso es B4, fuera de este prototipo).
- Integración real con banca empresarial — la "bandeja de cobros" es solo contexto visual.
