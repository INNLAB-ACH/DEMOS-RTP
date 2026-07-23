# Tareas — B7: Checkout B2B en marketplace

> Ola 4 · B2B · Complejidad media
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección B7.

## Resumen del flujo

Un comprador empresarial elige "pagar con banco" en una plataforma agregadora
(marketplace B2B). La plataforma dispara un RTP, valida que quien paga tiene rol
empresarial habilitado, un aprobador interno confirma, y el pago se acredita a la
plataforma.

**Flujo de referencia:** Comprador elige "pagar con banco" → plataforma dispara RTP →
valida rol empresarial → aprobador interno confirma → se acredita a la plataforma.

## Actores

- **Comprador empresarial**: navega el marketplace y elige pagar con RTP.
- **Plataforma agregadora**: dispara el cobro (rol pasivo, contexto).
- **Aprobador interno**: confirma el pago en nombre de la empresa compradora.

## Enabler / gap identificado

Es similar al síncrono ecommerce ya prototipado (`in-bank/`) más una validación de rol
empresarial que hoy no existe como enabler real — se simula con un mock.

## Pantallas a construir

Partiendo de `in-bank/` (checkout con "Cóbrame con ACH" junto a tarjeta/PSE, selección de
banco, selección de cuenta, biometría, confirmación):

1. **Checkout de marketplace B2B** (adaptar la vista de checkout de `in-bank/`) — debe
   mostrar el ítem/orden de compra en contexto B2B (ej. "Orden de compra #12345 — 500
   unidades de insumo X") en vez de un carrito de mascotas.
2. **Selector de rol empresarial** (nueva, mock): antes de seguir al banco, una pantalla
   simple donde el comprador confirma "Comprando en nombre de: [Empresa X]" con un rol
   visible (ej. "Comprador autorizado"). No es una validación real, solo un paso visual
   que dejar explícito el gap documentado.
3. **Selección de banco y cuenta empresarial** (reusar el flujo de `in-bank/`).
4. **Confirmación del aprobador interno** — pantalla adicional (puede reusar el patrón de
   `sheetApproverConfirm` construido en `aprobacion-whatsapp/` para B6: checkbox "Confirmo
   como aprobador en nombre de la empresa") antes de cerrar el flujo.
5. **Confirmación de pago acreditado a la plataforma** — pantalla final que deje claro que
   el dinero se acredita a la plataforma agregadora, no directamente al proveedor final.

## Tareas técnicas

- [ ] Crear carpeta `marketplace-b2b/` con `index.html`, `styles.css`, `app.js`,
      partiendo de `in-bank/` como base.
- [ ] Cambiar el contexto de checkout de "tienda de mascotas" a "marketplace B2B" con una
      orden de compra mock (número de orden, ítem, cantidad, proveedor, monto).
- [ ] Agregar la pantalla de selector/confirmación de rol empresarial antes de continuar
      al banco.
- [ ] Reusar la selección de banco/cuenta y biometría de `in-bank/app.js` tal cual.
- [ ] Reusar el componente de confirmación de aprobador construido en
      `aprobacion-whatsapp/app.js` (`sheetApproverConfirm` + checkbox), adaptado a
      contexto de marketplace.
- [ ] Construir la pantalla final aclarando que el pago se acredita a la plataforma
      agregadora (mostrar el nombre de la plataforma + referencia de la orden).
- [ ] Etiquetar visualmente (badge) el checkout como "B2B" para diferenciarlo del checkout
      de persona natural de `in-bank/`.

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · B2B / Marketplace` y
      enlace a `./marketplace-b2b/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- El checkout deja explícito que el comprador actúa en nombre de una empresa (rol
  visible), no como persona natural.
- Existe un paso de confirmación de aprobador separado de la autorización bancaria
  (biometría), igual que en B6.
- La pantalla final distingue claramente "pago acreditado a la plataforma" de "pago
  acreditado al proveedor final" (evitar confusión con B5/factoring).

## Fuera de alcance

- Integración real con un marketplace o validación real de roles empresariales.
- Liquidación de la plataforma hacia el proveedor final (fuera del alcance del checkout).
