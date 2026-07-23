# Tareas — C3: RTP por proximidad, sin QR

> Ola 4 · Quick win · B2C · Complejidad baja-media
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección C3.

## Resumen del flujo

Un comercio físico informal (sin capacidad de imprimir/mostrar QR, ej. un vendedor
ambulante) ingresa el celular o alias del cliente en vez de generar un código. El sistema
dispara un RTP directo al cliente, quien lo recibe y confirma desde su app bancaria.

**Flujo de referencia:** Comercio ingresa celular o alias → sistema dispara RTP → cliente
recibe solicitud → confirma en su app → pago se acredita.

## Actores

- **Comercio/tendero**: ingresa el monto y el identificador del cliente (celular/alias),
  sin necesidad de mostrar nada en pantalla al cliente.
- **Cliente/pagador**: recibe el RTP directamente en su app bancaria y confirma.

## Por qué es quick win

Es una variante directa de `pago-presente/`, que ya prototipó el lado del tendero
(`tScreenLogin` → `tScreenHome` → `tScreenAmount` → generación de cobro) y el lado del
pagador vía QR. Aquí se **reemplaza únicamente el paso de generación/escaneo de QR** por
un paso de identificación por celular/alias, y el cliente recibe el cobro como push
directo en vez de tener que escanear nada.

## Pantallas a construir

Reutilizando la estructura de `pago-presente/` (`index.html` con layout tendero + cliente
lado a lado, `app.js` con `charge = { amount, concept, paid, payerAccountLabel,
payerTime }`, `tScreenLogin/tScreenHome/tScreenAmount/tScreenQR/tScreenPaid`):

1. **Lado tendero — pantalla de monto + identificador** (reemplaza `tScreenAmount` →
   `tScreenQR`): en vez de solo capturar monto y concepto, agrega un campo de
   celular/alias del cliente. El botón ya no dice "Generar QR" sino "Enviar cobro".
2. **Lado tendero — pantalla de "cobro enviado"** (reemplaza `tScreenQR`): en vez de
   mostrar un código QR (`renderQR`, `tQrCanvas`), muestra un estado de "esperando
   confirmación del cliente" con el celular/alias ingresado, monto y concepto.
3. **Lado cliente — pantalla de confirmación de identidad**: **nueva**, no existe en
   `pago-presente/`. Antes de mostrar el cobro, debe aparecer un paso tipo "¿Eres tú,
   [nombre enmascarado, ej. Juan P.]?" para mitigar la ambigüedad de un alias/celular no
   único (riesgo señalado en el plan de ronda 2).
4. **Lado cliente — detalle del cobro y selección de cuenta** (reusar
   `sScreenBankApp`/selección de cuenta de `pago-presente/`, sin el paso de escaneo de
   cámara — se accede directo porque no hay QR que escanear).
5. **Autorización y pantalla de pago exitoso** (reusar el patrón de biometría y
   `tScreenPaid`/pantalla de éxito del cliente ya existente en `pago-presente/`).

## Tareas técnicas

- [ ] Crear carpeta `proximidad-sin-qr/` con `index.html`, `styles.css`, `app.js`,
      partiendo de `pago-presente/` como base (copiar y adaptar, no reescribir desde
      cero).
- [ ] Eliminar `renderQR`, `tQrCanvas`, `qrRefreshIntervalId` y el flujo de cámara
      (`summaryFlow === 'camera'`) — no aplican cuando no hay QR.
- [ ] Agregar campo `payerIdentifier` (celular o alias) al objeto `charge`.
- [ ] Construir el paso de confirmación de identidad del lado cliente antes del detalle
      del cobro, con nombre enmascarado (ej. derivado de un dato mock fijo).
- [ ] Simplificar el flujo del cliente a una sola ruta (ya no hay elección entre "cámara"
      o "app del banco" como en `pago-presente/`, porque no hay QR que escanear — el
      cliente entra directo a confirmar identidad y pagar).
- [ ] Mantener `formatCOP`, `currentTime`, `showT`/equivalente para el lado tendero.

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · Presencial sin QR` y
      enlace a `./proximidad-sin-qr/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- El tendero nunca genera ni muestra un código QR en ningún punto del flujo.
- El cliente pasa por un paso explícito de confirmación de identidad antes de ver el
  monto a pagar.
- El resto del flujo de pago (cuenta → autorización → confirmación) es igual de fluido
  que en `pago-presente/`.

## Fuera de alcance

- Validación real de que el celular/alias corresponde a un cliente registrado.
- Manejo de alias ambiguos o no encontrados (se asume que siempre existe un match único
  en el prototipo).
