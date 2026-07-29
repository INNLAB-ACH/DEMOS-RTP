# Tareas — B8: Split payment (pago dividido entre cuentas)

> Nueva · B2B · Complejidad media
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección B8.
> Origen: acordado en sesión de equipo previo a demo GoPayments — ver
> [`docs/cambios-requeridos-claude-code.md`](../cambios-requeridos-claude-code.md), sección 3.

## Resumen del flujo

Una empresa recibe un cobro (factura o RTP directo) que supera el saldo disponible en una
sola cuenta. El flujo permite seleccionar dos o más cuentas/entidades de origen y definir
cuánto aporta cada una, disparar los débitos combinados con una sola confirmación, y
notificar al beneficiario únicamente el monto total recibido, sin exponer el detalle del
split.

**Flujo de referencia:** Empresa recibe un cobro que supera el saldo de una sola cuenta →
selecciona dos o más cuentas/entidades de origen → define cuánto aporta cada una →
confirmación única dispara los débitos combinados → beneficiario recibe confirmación del
monto total, sin ver el detalle del split.

Equivalente al caso de uso ya existente en PSE (pago desde múltiples fuentes con múltiples
facturas), trasladado al contexto RTP para empresas.

## Actores

- **Empresa pagadora**: recibe el cobro y no tiene saldo suficiente en una sola cuenta;
  divide el pago entre varias cuentas propias.
- **Beneficiario**: recibe el cobro (factura o RTP directo) y solo ve una confirmación de
  pago único por el monto total, sin visibilidad del split.

## Enabler / gap identificado

No depende de un enabler nuevo de backend: reutiliza el patrón de selección de cuenta ya
prototipado en `factura-rtp/` y `aprobacion-whatsapp/` (cuenta por defecto + cambiar
cuenta), extendido a permitir más de una cuenta activa a la vez con un monto asignado a
cada una. El gap real es de UX: no existe hoy en ningún prototipo un selector de "varias
cuentas + monto por cuenta que sume el total".

## Esquema mínimo de metadata a simular

- Monto total del cobro (factura o RTP directo).
- Cuentas/entidades de origen disponibles (nombre, saldo).
- Aportes por cuenta: `{ cuentaId, monto }[]` — la suma debe igualar el monto total antes de
  poder confirmar.
- Beneficiario y concepto del cobro (reutilizar el mismo esquema de metadata de factura de
  `factura-rtp/` si el cobro se origina en una factura).
- Estado de la confirmación: `pendiente` → `pagado`.

## Pantallas a construir

1. **Detalle del cobro** (adaptar el detalle de factura de `factura-rtp/`) — muestra el
   monto total y, si el saldo de la cuenta por defecto no alcanza, ofrece la opción
   "Dividir entre varias cuentas" en vez de forzar la selección de una sola cuenta.
2. **Selección de cuentas + distribución de montos** — lista de cuentas con checkbox para
   activarlas y un campo de monto por cuenta activa; un indicador de "Falta $X por asignar"
   / "Total cubierto ✔" habilita la confirmación solo cuando la suma iguala el total.
3. **Confirmación única** (reusar patrón de biometría/autorización ya prototipado) — dispara
   los débitos combinados de todas las cuentas seleccionadas en un solo paso.
4. **Confirmación al beneficiario** — pantalla de éxito que muestra el monto total recibido
   y el cobro asociado, sin mencionar cuántas cuentas ni cuáles aportaron.

## Tareas técnicas

- [x] Crear carpeta `split-payment/` con `index.html`, `styles.css`, `app.js`, partiendo de
      `factura-rtp/` como base (mismo patrón de detalle de cobro + cuenta a debitar).
- [x] Definir el estado de distribución: `{ id, name, balance, asignado, activa }[]` y una
      función que valide que la suma de `asignado` sea igual al monto total del cobro.
- [x] Construir la pantalla de distribución de montos, con validación en vivo (deshabilitar
      "Continuar" mientras la suma no cuadre) y un botón de "Asignar automáticamente".
- [x] Reusar `formatCOP` y el patrón de biometría/autorización ya existente para la
      confirmación única.
- [x] Construir la pantalla de confirmación al beneficiario mostrando solo el monto total,
      sin el detalle del split.

## Integración con el índice general

- [x] Agregar `demo-card` en `index.html` (raíz), sección B2B, con tag
      `Canal · B2B / Split payment` y enlace a `./split-payment/index.html`.
- [x] Actualizar KPI `Demos disponibles` en `index.html` (pasó de 17 a 18).

## Criterios de aceptación

- El flujo nunca permite confirmar el pago si la suma de los montos por cuenta no iguala el
  monto total del cobro.
- La confirmación al beneficiario no expone en ningún punto el detalle de cuántas cuentas
  aportaron ni sus montos individuales — solo el monto total y el cobro asociado.
- La selección de cuentas para split es una extensión visible del patrón de "cuenta por
  defecto + cambiar cuenta" ya usado en `factura-rtp/`, no un flujo completamente distinto.

## Fuera de alcance

- Integración real con múltiples entidades bancarias — las "cuentas/entidades de origen" son
  mock dentro de una misma banca empresarial simulada, igual que en los demás prototipos.
- Validación de fondos insuficientes por cuenta individual (se asume que el monto asignado
  a cada cuenta está dentro de su saldo disponible).
