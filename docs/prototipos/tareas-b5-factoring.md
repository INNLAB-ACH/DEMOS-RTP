# Tareas — B5: Cobro a proveedores vía factoring

> Ola 6 · B2B · Complejidad alta
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección B5.

## Resumen del flujo

Un proveedor factoriza una factura (la vende a un factor para obtener liquidez
inmediata). El derecho de cobro pasa al factor, el RTP originalmente dirigido al
proveedor se redirige a este, el comprador paga al factor, y el factor liquida al
proveedor.

**Flujo de referencia:** Proveedor factoriza factura → factor recibe derecho de cobro →
RTP se redirige al factor → comprador paga al factor → factor liquida al proveedor.

## Actores

- **Proveedor**: emitió la factura original y la factoriza.
- **Factor**: entidad de factoring que compra el derecho de cobro.
- **Comprador**: paga la factura, ahora redirigida al factor.

## Enabler / gap identificado — depende de `factura-rtp/` (B1)

El documento de referencia señala que B5 depende de B1 más una capacidad de redirección
de beneficiario, no documentada. B1 ya está construido en `factura-rtp/app.js`, con el
esquema de metadata de factura:
`{ numeroFactura, concepto, emisor, nit, fechaEmision, fechaVencimiento, monto,
referenciaERP, paid }` y la pantalla de confirmación con `conciliacionId`.

Este prototipo debe **reutilizar ese esquema de metadata tal cual** y agregar el campo
nuevo que no existe en B1: el beneficiario del pago (quién recibe el dinero), que en B1
siempre es el emisor y aquí puede ser distinto (el factor).

## Esquema de metadata extendido (sobre el de `factura-rtp/`)

Agregar a la factura:
- `beneficiarioOriginal` (el proveedor/emisor — igual a `emisor` de B1).
- `beneficiarioPago` (a quién se acredita realmente: el factor).
- `factorNombre` (razón social del factor, ej. "Factoring Andino S.A.").
- `estadoFactoring`: `'sin_factorizar' | 'factorizada'`.

## Pantallas a construir

1. **Vista de la factura antes de factorizar** (contexto, mock) — mostrar la factura con
   `beneficiarioOriginal` = proveedor, `estadoFactoring = 'sin_factorizar'`.
2. **Notificación de redirección de beneficiario** — pantalla o banner explícito, visible
   para el comprador antes de pagar, que indique "Esta factura fue factorizada. El pago se
   acreditará a [factorNombre], no al proveedor original [beneficiarioOriginal]". Este
   aviso es crítico: sin él, el comprador podría creer que está pagándole directamente al
   proveedor.
3. **Detalle de la factura con beneficiario redirigido** (adaptar el detalle de
   `factura-rtp/`, agregando las filas `beneficiarioOriginal` y `beneficiarioPago`
   claramente diferenciadas).
4. **Selección de cuenta y autorización** (reusar tal cual de `factura-rtp/app.js`).
5. **Confirmación con liquidación al factor** — adaptar la pantalla de conciliación de
   `factura-rtp/` (`conciliacionId`) agregando que el pago se acreditó al factor y que el
   factor liquidará al proveedor por separado (mostrar un mensaje simulado, ej. "Factor
   Andino S.A. liquidará a Distribuidora ABC S.A.S. según sus términos").

## Tareas técnicas

- [ ] Crear carpeta `factoring/` con `index.html`, `styles.css`, `app.js`, partiendo de
      `factura-rtp/` como base (copiar estructura de `invoices`, `invoicesBody`,
      `invoiceCardPending`, detalle, selección de cuenta y `conciliacionId`).
- [ ] Extender el objeto de factura mock con `beneficiarioOriginal`, `beneficiarioPago`,
      `factorNombre`, `estadoFactoring`, dejando al menos una factura ya factorizada en
      los datos mock.
- [ ] Construir el banner/aviso de redirección de beneficiario, visible antes de que el
      comprador confirme el pago (no solo en la confirmación final — debe poder verse
      *antes* de pagar, para que sea una decisión informada).
- [ ] Adaptar la pantalla de detalle para mostrar ambos beneficiarios (original vs. pago)
      de forma visualmente diferenciada (ej. uno tachado/atenuado, el otro destacado).
- [ ] Adaptar la pantalla de confirmación final para mencionar la liquidación posterior
      del factor al proveedor.
- [ ] Reusar `formatCOP` y el flujo de selección de cuenta/biometría de
      `factura-rtp/app.js` sin modificar su lógica interna.

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · B2B / Factoring` y
      enlace a `./factoring/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- El comprador ve el aviso de redirección de beneficiario **antes** de autorizar el pago,
  no solo en el recibo final.
- La factura mock ya factorizada muestra claramente proveedor original y factor como
  entidades distintas.
- La pantalla final comunica que el factor liquidará al proveedor por separado —no da a
  entender que el proveedor recibió el pago directamente.

## Fuera de alcance

- Modelado del contrato de factoring o de la liquidación real factor→proveedor.
- Flujo de "factorización" en sí (el proveedor vendiendo la factura al factor) — se asume
  ya ocurrido antes de que el comprador vea el cobro.
