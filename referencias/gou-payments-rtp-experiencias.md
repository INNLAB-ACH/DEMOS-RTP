# GOU Payments / Grupo Aval — Experiencias RTP (Request to Pay)

## Contexto

GOU Payments es la pasarela de pagos vinculada a Grupo Aval. ACH Colombia busca ofrecerle
una experiencia de Request to Pay (RTP) para los bancos del grupo, bajo el marco de
Cóbrame/RTP. Ya existen prototipos para persona natural en:

- Venta presente con QR (POS, síncrono)
- Pago vía WhatsApp (asíncrono)
- Ecommerce síncrono

El siguiente paso es extender el pensamiento hacia **B2B** (facturación, recaudo, cobro
empresarial) expuesto a través de las apps de Grupo Aval, y también ampliar el catálogo
**B2C** más allá de lo ya prototipado.

Distinción de rol clave en el diseño:

- **B2B**: ACH actúa como **oferente de infraestructura hacia GOU/Aval**, quienes exponen
  las capacidades a sus clientes empresariales.
- **B2C**: ACH actúa como **proveedor del riel**, y el consumidor final es la persona
  natural dentro de las apps de los bancos Aval.

---

## Experiencias B2B — ACH como oferente hacia GOU

| # | Experiencia | Actor principal | Complejidad | Enabler / gap |
|---|---|---|---|---|
| B1 | Factura con RTP embebido | Empresa emisora + pagadora | Media | Se apoya en CU06 + Cóbrame síncrono. Falta estandarizar metadata factura-RTP |
| B2 | Recaudo recurrente con mandato | Proveedor + cliente corporativo | Alta | Requiere enabler nuevo: motor de mandatos/autorización previa. No existe hoy en Cóbrame |
| B3 | Cobro masivo de cartera (batch) | Tesorería / distribuidor | Media-Alta | Se apoya en CU19 (RTP-based collections); falta orquestación batch + dashboard de estados |
| B4 | Workflow de aprobación multiusuario | Tesorero / aprobador corporativo | Alta | Gap total. No hay enabler de roles/umbrales; depende de que la banca empresarial de Aval lo exponga |
| B5 | Cobro a proveedores vía factoring | Entidad de factoring | Alta | Depende de B1 + capacidad de redirección de beneficiario, no documentada |
| B6 | Notificación multicanal a aprobador | Aprobador fuera de la app | Baja-Media | Reutiliza directamente el flujo asíncrono de WhatsApp ya prototipado |
| B7 | Checkout B2B en marketplace | Plataforma agregadora | Media | Similar al síncrono ecommerce actual + validación de rol empresarial |
| B8 | Split payment (pago dividido entre cuentas) | Empresa pagadora con múltiples cuentas/entidades de origen | Media | Equivalente al caso multi-fuente ya existente en PSE, trasladado al contexto RTP empresarial. Sin gap de enabler nuevo — reutiliza selección de cuenta ya prototipada |

### Detalle de flujos B2B

**B1 — Factura con RTP embebido**
Emisor genera factura → RTP con metadata de factura → pagador recibe en banca empresarial → paga con un gesto → concilia contra ERP.

**B2 — Recaudo recurrente con mandato**
Proveedor configura mandato → cliente autoriza una vez → RTP se envía cada ciclo → cliente confirma rápido → pago se ejecuta.

**B3 — Cobro masivo de cartera**
Carga batch (CSV/API) → RTP individual por deudor → dashboard de estados → deudor paga o vence → conciliación consolidada.

**B4 — Workflow de aprobación multiusuario**
RTP entra a cola → analista solicita → tesorero aprueba → gerente autoriza si supera umbral → pago se ejecuta.

**B5 — Cobro a proveedores vía factoring**
Proveedor factoriza factura → factor recibe derecho de cobro → RTP se redirige al factor → comprador paga al factor → factor liquida al proveedor.

**B6 — Notificación multicanal a aprobador**
RTP entra a banca empresarial → alerta se replica en WhatsApp/correo → aprobador revisa fuera de oficina → confirma → pago se ejecuta.

**B7 — Checkout B2B en marketplace**
Comprador elige "pagar con banco" → plataforma dispara RTP → valida rol empresarial → aprobador interno confirma → se acredita a la plataforma.

**B8 — Split payment (pago dividido entre cuentas)**
Empresa recibe un cobro (factura o RTP directo) que supera el saldo disponible en una sola
cuenta → selecciona dos o más cuentas/entidades de origen y define cuánto aporta cada una →
confirmación única dispara los débitos combinados → beneficiario recibe confirmación del
monto total, sin exponer el detalle del split.

---

## Experiencias B2C — ACH como proveedor del riel

| # | Experiencia | Actor principal | Complejidad | Enabler / gap |
|---|---|---|---|---|
| C1 | P2P con motivo o plantilla | Persona a persona | Baja | Extensión directa del RTP asíncrono; solo agrega campo de metadata |
| C2 | Recaudo recurrente doméstico | Comercio/servicio + usuario | Alta | Mismo gap que B2 — motor de mandatos transversal, conviene diseñarlo una sola vez |
| C3 | RTP por proximidad (sin QR) | Comercio físico informal | Baja-Media | Variante del POS-QR ya prototipado; cambia el método de identificación del pagador |
| C4 | Notificación "pagar después" | Usuario + banco emisor | Alta | ACH orquesta el compromiso; el crédito lo resuelve el banco. Gap de producto |
| C5 | Cobro por evento de vida (trámites) | Entidad pública/EPS + ciudadano | Media | Se parece a CU01 trasladado a RTP; reutiliza precarga de datos que ya usa PSE |
| C6 | Solicitud colaborativa (vaquita) | Grupo de personas | Media | Distribución 1-a-muchos con consolidado; comparte lógica con B3 (batch) |
| C7 | Confirmación biométrica en WhatsApp | Usuario en canal asíncrono | Media | Depende de capacidades de autenticación del banco emisor |

### Detalle de flujos B2C

**C1 — P2P con motivo o plantilla**
Elige plantilla (arriendo, cuenta) → RTP con motivo estructurado → contacto recibe notificación → paga con un tap → confirmación a ambos.

**C2 — Recaudo recurrente doméstico**
Comercio configura cobro periódico → usuario autoriza una vez → RTP se envía cada ciclo → usuario confirma rápido → pago se ejecuta.

**C3 — RTP por proximidad, sin QR**
Comercio ingresa celular o alias → sistema dispara RTP → cliente recibe solicitud → confirma en su app → pago se acredita.

**C4 — Notificación "pagar después"**
RTP llega → usuario acepta compromiso → banco ofrece diferir en cuotas → usuario elige plan → banco resuelve el crédito.

**C5 — Cobro por evento de vida**
Entidad genera trámite → RTP con datos precargados → ciudadano recibe en su banco → paga sin digitar referencia → entidad recibe trazabilidad.

**C6 — Solicitud colaborativa (vaquita)**
Organizador crea solicitud → se distribuye a contactos → cada uno paga su parte → organizador ve consolidado → meta alcanzada.

**C7 — Confirmación biométrica en WhatsApp**
RTP llega por WhatsApp → abre enlace seguro → autenticación biométrica → confirma el pago → comprobante en el chat.

---

## Lecturas del cruce B2B / B2C

- **Enabler compartido de mayor apalancamiento**: el motor de recurrencia/mandato (B2 y C2)
  es el gap de mayor complejidad en ambos lados. Construirlo una sola vez sirve para los dos
  mundos.
- **Mayor diferenciación frente a Bre-B**: B4 (aprobación multiusuario) y C2 (recurrencia)
  son casos donde Bre-B, por diseño P2P simple, no puede competir. Ahí conviene invertir
  primero en enablers nuevos.
- **Lógica compartida entre C6 y B3**: ambos requieren distribución uno-a-muchos con
  consolidado de estado — se pueden diseñar como una sola capacidad reutilizable.

## Quick wins (Ola 0-1)

Experiencias que son variaciones de superficie sobre flujos ya validados — no requieren
enablers nuevos de backend:

- **B6 — Notificación multicanal a aprobador**: extensión casi literal del flujo asíncrono
  de WhatsApp ya construido; solo cambia el contexto (aprobador corporativo vs. persona
  natural).
- **C1 — P2P con motivo o plantilla**: extiende el RTP asíncrono actual agregando un campo
  de metadata (motivo). No requiere infraestructura nueva.
- **C3 — RTP por proximidad, sin QR**: variante del POS con QR ya prototipado, cambiando
  solo el método de identificación del pagador (celular/alias en vez de escaneo).

## Estado de prototipos (previo a demo GoPayments)

De las 14 experiencias originales + B8 (split payment, nueva), están construidas como
prototipo interactivo: B1 (`factura-rtp/`, + versión banco Aval en `factura-rtp-aval/`),
B2 (`mandato-empresarial/`, + versión banco Aval en `mandato-empresarial-aval/`), B3
(`cobro-masivo/`), B5 (`factoring/`), B6 (`aprobacion-whatsapp/`), B7 (`marketplace-b2b/`),
B8 (`split-payment/`), C1 (`p2p-motivo/`), C2 (`mandato-domestico/`), C3
(`proximidad-sin-qr/`), C5 (`tramite-vida/`), C6 (`vaquita/`).

`factoring/` (B5) además incluye un piloto de marketplace de facturas (vista proveedor,
selección entre ofertas de varios inversionistas) construido por fuera del acuerdo original
de la sesión de equipo, que había definido no iniciarlo hasta tener insumos de una sesión
con empresas de factoring — el flujo operativo real (cómo pujan los inversionistas, cómo se
selecciona el ganador) sigue sin validar y el piloto está marcado como tal en la propia UI.

Quedan sin prototipar **B4** (workflow de aprobación multiusuario), **C4** (notificación
"pagar después") y **C7** (confirmación biométrica en WhatsApp). En la sesión de equipo
recogida en `docs/cambios-requeridos-claude-code.md` se acordó no iniciar su construcción
en este ciclo, y se aclaró para B4 que la cadena/reglas de aprobación las define el esquema
de administración de cada banco, no ACH — el prototipo, cuando se construya, solo necesita
mostrar el componente visual de qué pasos de la solicitud ya se cumplieron, con dos
patrones (aprobación simultánea vs. secuencial). Ver
`docs/prototipos/plan-implementacion-ronda2.md` para el detalle completo de esa aclaración.
Queda pendiente de la reunión del martes evaluar si amerita abrir una "ronda 3" con estos
tres casos.

## Próximos pasos

- Validar el piloto de marketplace de facturas de `factoring/` con empresas de factoring
  reales, y ajustar o retirar el flujo según lo que se aprenda de esa sesión.
- Evaluar en la reunión del martes si B4, C4 y C7 ameritan una "ronda 3".
- Definir si el esquema visual (`esquema-experiencias-rtp.jsx`) se usa como base para
  wireframes o prototipos interactivos en Claude Code / Figma.

## Referencias relacionadas

- Esquema visual de las 14 experiencias: `esquema-experiencias-rtp.jsx`
- Trabajo previo de referencia: 23 fichas de casos de uso PSE (CU01–CU23), roadmap Ola 0-4,
  32 enablers de plataforma, arquitectura Cóbrame/RTP con tres flujos (síncrono ecommerce,
  síncrono POS con QR dinámico, asíncrono WhatsApp).
