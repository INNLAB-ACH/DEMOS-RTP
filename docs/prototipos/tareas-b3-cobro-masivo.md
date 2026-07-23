# Tareas — B3: Cobro masivo de cartera (batch)

> Ola 6 · B2B · Complejidad media-alta
> Referencia: [`referencias/gou-payments-rtp-experiencias.md`](../../referencias/gou-payments-rtp-experiencias.md), sección B3.

## Resumen del flujo

Una tesorería o distribuidor carga un lote de deudores (CSV/API), se genera un RTP
individual por cada uno, un dashboard muestra el estado de cada cobro, y al final se
obtiene una conciliación consolidada de la cartera.

**Flujo de referencia:** Carga batch (CSV/API) → RTP individual por deudor → dashboard de
estados → deudor paga o vence → conciliación consolidada.

## Actores

- **Tesorería/distribuidor**: carga el batch y monitorea el dashboard de estados.
- **Deudor**: recibe su RTP individual y paga (o no) antes del vencimiento.

## Enabler / gap identificado — reutilización directa de `vaquita/`

El documento de referencia y el plan de ronda 1 ya señalaron que B3 comparte lógica de
distribución 1-a-muchos con consolidado de estado con C6 (vaquita). El prototipo
`vaquita/` (`vaquita/app.js`) ya implementa esa lógica de forma explícitamente genérica:

- `toConsolidadoItems(participantes)` — mapea una lista de entidades a
  `{ label, status, amount }[]`.
- `computeRecaudado(items)` — suma lo recaudado sobre esa forma genérica.
- La pantalla de consolidado (barra de progreso + lista con estado pagado/pendiente) está
  comentada explícitamente en el código como "para poder reutilizarse en B3".

Este prototipo **debe reutilizar esas dos funciones y el componente visual de
consolidado tal cual**, cambiando solo el dominio de datos: en vez de "participantes de
una vaquita" son "deudores de una cartera", y en vez de "aportar su parte" cada uno
"paga su factura/cuota".

## Pantallas a construir

1. **Carga de batch** (lado tesorería, mock) — pantalla simple mostrando que se cargó un
   archivo con N deudores (no requiere parseo real de CSV, puede ser una lista fija
   mock).
2. **Dashboard de estados** (equivalente directo a la pantalla de consolidado de
   `vaquita/`) — lista de deudores con: nombre/razón social, monto adeudado, estado
   (pagado/pendiente/vencido), y barra de progreso de recaudo total de la cartera vs.
   meta de cartera cargada.
3. **RTP individual recibido por un deudor** (reusar el patrón de notificación +
   `sheetDetail` + `sheetBankPicker` + `screenBiometric` + `sheetReceipt` de
   `whatsapp/app.js`, igual que hizo `vaquita/` para el aporte individual).
4. **Botón "Simular pago de otro deudor"** (igual que en `vaquita/`) para poder ver el
   dashboard actualizarse sin requerir múltiples sesiones.
5. **Conciliación consolidada final** — vista adicional a la de `vaquita/`: además del
   progreso, debe mostrar un resumen de cierre (total cartera, total recaudado, total
   vencido/pendiente) cuando se considere cerrado el ciclo de cobro.

## Diferencias respecto a `vaquita/` a implementar

- Agregar un tercer estado además de pagado/pendiente: **vencido** (deudor que no pagó
  antes de la fecha límite) — `vaquita/` solo maneja pagado/pendiente porque no tiene
  vencimiento.
- El resumen de cierre (paso 5) es nuevo; `vaquita/` no lo tiene porque su meta es
  simplemente "alcanzada o no", sin corte de vencimiento.

## Tareas técnicas

- [ ] Crear carpeta `cobro-masivo/` con `index.html`, `styles.css`, `app.js`, partiendo de
      `vaquita/` como base (copiar `toConsolidadoItems`, `computeRecaudado`, el patrón de
      dashboard y el flujo de sheets de `whatsapp/`).
- [ ] Renombrar el dominio de datos: `vaquita.participantes` → `cartera.deudores`, cada
      uno con `{ nombre, monto, estado }` donde `estado` ahora puede ser
      `'pagado' | 'pendiente' | 'vencido'`.
- [ ] Extender `toConsolidadoItems` (o su equivalente renombrado) para mapear también el
      estado `vencido` con un estilo visual distinto (ej. rojo) al de `pendiente`.
- [ ] Construir la pantalla de carga de batch como contexto inicial (mock).
- [ ] Construir el resumen de conciliación consolidada final (total cartera, recaudado,
      vencido).
- [ ] Mantener el botón "Simular pago de otro deudor" como en `vaquita/`.
- [ ] Reusar `formatCOP` para todos los montos.

## Integración con el índice general

- [ ] Agregar `demo-card` en `index.html` (raíz) con tag `Canal · B2B / Cobro masivo` y
      enlace a `./cobro-masivo/index.html`.
- [ ] Actualizar KPI `Demos disponibles` en `index.html`.

## Criterios de aceptación

- El dashboard reutiliza visualmente el mismo componente de consolidado que `vaquita/`
  (misma lógica de progreso/lista), evidenciando el enabler compartido documentado desde
  la ronda 1.
- Existe un estado "vencido" distinguible visualmente de "pendiente".
- La pantalla de conciliación consolidada final resume correctamente los tres totales
  (cartera, recaudado, vencido).

## Fuera de alcance

- Carga real de archivos CSV o integración con una API de tesorería.
- Reglas de mora, intereses o gestión de cobranza más allá del estado "vencido".
