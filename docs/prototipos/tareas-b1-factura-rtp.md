# Tareas — B1: Factura con RTP embebido

> Ola 2 · B2B · Complejidad media
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección B1.

## Resumen del flujo

Un emisor genera una factura con un RTP embebido (metadata de factura adjunta al cobro).
El pagador la recibe en su banca empresarial, paga con un gesto, y el pago queda
conciliado contra el ERP del emisor.

**Flujo de referencia:** Emisor genera factura → RTP con metadata de factura → pagador
recibe en banca empresarial → paga con un gesto → concilia contra ERP.

## Actores

- **Empresa emisora**: genera la factura y el RTP asociado.
- **Empresa pagadora**: recibe el cobro en su banca empresarial y autoriza el pago.

## Enabler / gap identificado

Se apoya en CU06 y en el flujo Cóbrame síncrono ya prototipado (`in-bank/`). El gap
principal es que **no existe hoy un estándar de metadata factura-RTP** — este prototipo
debe proponer un esquema mínimo (no una integración real con ERPs).

## Esquema mínimo de metadata a simular

- Número de factura.
- Concepto / descripción.
- Fecha de emisión y fecha de vencimiento.
- Empresa emisora (NIT simulado).
- Referencia ERP (campo libre, solo para mostrar que existe trazabilidad).

## Pantallas a construir

1. **Vista de factura entrante** (banca empresarial del pagador) — lista o detalle de
   factura con botón "Pagar con RTP", mostrando la metadata anterior.
2. **Detalle del cobro con metadata de factura** (adaptar `sheetDetail` /
   pantalla de resumen de `in-bank/`) — debe mostrarse como una factura, no como un cobro
   genérico: número, concepto, vencimiento, emisor.
3. **Selección de cuenta a debitar** (reusar patrón de `in-bank/` — selección de banco ya
   resuelta si el pagador usa la misma app, o selección de cuenta si es directo).
4. **Autorización** (reusar `screenBiometric` / patrón de huella de `in-bank/`).
5. **Confirmación con conciliación** — pantalla de éxito que muestre explícitamente
   "Factura conciliada" con el número de factura y una referencia de conciliación
   simulada (ej. ID de transacción cruzado con el número de factura).

## Tareas técnicas

- [ ] Crear carpeta `factura-rtp/` con `index.html`, `styles.css`, `app.js`, partiendo de
      `in-bank/` como base (mismo patrón de checkout síncrono, pero de empresa a empresa).
- [ ] Definir objeto de estado de factura:
      `{ numeroFactura, concepto, emisor, fechaEmision, fechaVencimiento, monto,
      referenciaERP, paid }`.
- [ ] Construir la vista de "factura entrante" como pantalla inicial (lista con 1-2
      facturas mock, una de ellas la que se paga en el flujo).
- [ ] Adaptar la pantalla de detalle/resumen para mostrar los campos de factura de forma
      prominente (no solo el monto).
- [ ] Reusar `formatCOP`, selección de cuenta y biometría de `in-bank/app.js`.
- [ ] Construir la pantalla de confirmación con el mensaje de conciliación (simulado, sin
      integración real).
- [ ] Ajustar `styles.css` para diferenciar visualmente esta demo como B2B (paleta o
      iconografía distinta a los prototipos de persona natural, manteniendo la identidad
      visual de `assets/index.css`).

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · B2B / Facturación` y
      enlace a `./factura-rtp/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- La metadata de factura (número, concepto, vencimiento, emisor) es visible en todas las
  pantallas relevantes del flujo, no solo en la primera.
- La pantalla final comunica visualmente la idea de conciliación automática contra ERP,
  aunque sea simulada.
- El flujo de pago (cuenta → autorización → confirmación) es tan fluido como el de
  `in-bank/`.

## Fuera de alcance

- Integración real con algún ERP.
- Workflow de aprobación multiusuario (B4) — aquí se asume que quien ve la factura tiene
  autoridad para pagarla directamente.
- Redirección de beneficiario (B5, factoring).
