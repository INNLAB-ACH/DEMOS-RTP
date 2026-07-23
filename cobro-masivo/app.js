(function () {
  // ===================== Estado de la cartera (cobro masivo, B3) =====================
  // { nombreCartera, fechaLimite, organizacion, deudores: [{ nombre, monto, estado, montoPagado }] }
  // estado ahora puede ser 'pagado' | 'pendiente' | 'vencido' (vaquita/ solo maneja pagado/pendiente
  // porque no tiene vencimiento).
  const cartera = {
    nombreCartera: 'Cartera comercial · Julio 2026',
    fechaLimite: '31/07/2026',
    organizacion: 'Distribuidora Ánfora S.A.S.',
    deudores: [
      { nombre: 'Comercial La Esquina S.A.S.', monto: 3200000, estado: 'pagado', montoPagado: 3200000 },
      { nombre: 'Ana Torres (tú)', monto: 850000, estado: 'pendiente', montoPagado: 0 },
      { nombre: 'Ferretería El Tornillo Ltda.', monto: 1450000, estado: 'pendiente', montoPagado: 0 },
      { nombre: 'Distribuciones Cañaveral S.A.S.', monto: 2100000, estado: 'vencido', montoPagado: 0 },
      { nombre: 'Panadería Trigo Dorado', monto: 620000, estado: 'pagado', montoPagado: 620000 }
    ]
  };

  // Índice del deudor que representa a "ti" en la vista de deudor.
  const YOU_INDEX = 1;

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  // ===================== Lógica de consolidado, reutilizada tal cual de vaquita/app.js =====================
  // toConsolidadoItems y computeRecaudado están comentadas en vaquita/app.js como diseñadas
  // explícitamente para reutilizarse en B3: solo cambia el dominio (deudores de cartera en vez
  // de participantes de vaquita), el shape { label, status, amount } y la suma no cambian.
  function toConsolidadoItems(deudores) {
    return deudores.map(function (d) {
      return { label: d.nombre, status: d.estado, amount: d.montoPagado };
    });
  }

  function computeRecaudado(items) {
    return items.reduce(function (sum, item) {
      return sum + (item.amount || 0);
    }, 0);
  }

  // Total de la cartera cargada (suma de lo adeudado por todos los deudores, pagado o no).
  function computeTotalCartera() {
    return cartera.deudores.reduce(function (sum, d) {
      return sum + d.monto;
    }, 0);
  }

  // Total vencido: lo adeudado por deudores en estado 'vencido' (no cubierto por vaquita/,
  // que no tiene noción de vencimiento).
  function computeTotalVencido() {
    return cartera.deudores
      .filter(function (d) { return d.estado === 'vencido'; })
      .reduce(function (sum, d) { return sum + d.monto; }, 0);
  }

  function isYouPaid() {
    return cartera.deudores[YOU_INDEX].estado === 'pagado';
  }

  // ===================== Referencias a elementos =====================
  const tabDeudor = document.getElementById('tabDeudor');
  const tabTesoreria = document.getElementById('tabTesoreria');
  const viewDeudor = document.getElementById('viewDeudor');
  const viewTesoreria = document.getElementById('viewTesoreria');

  const chatBody = document.getElementById('chatBody');
  const invitePartAmount = document.getElementById('invitePartAmount');
  const inviteVencimiento = document.getElementById('inviteVencimiento');
  const inviteEstadoText = document.getElementById('inviteEstadoText');
  const btnViewFacturaDetail = document.getElementById('btnViewFacturaDetail');
  const receiptBubble = document.getElementById('receiptBubble');

  const overlayBackdrop = document.getElementById('overlayBackdrop');

  const sheetDetail = document.getElementById('sheetDetail');
  const facturaDetailNombre = document.getElementById('facturaDetailNombre');
  const facturaDetailMonto = document.getElementById('facturaDetailMonto');
  const facturaDetailVencimiento = document.getElementById('facturaDetailVencimiento');
  const facturaDetailEstado = document.getElementById('facturaDetailEstado');
  const btnAuthorize = document.getElementById('btnAuthorize');

  const sheetReceipt = document.getElementById('sheetReceipt');
  const screenBiometric = document.getElementById('screenBiometric');
  const sheetBankPicker = document.getElementById('sheetBankPicker');
  const btnBackToDetail = document.getElementById('btnBackToDetail');

  const fingerprintTap = document.getElementById('fingerprintTap');
  const btnViewReceipt = document.getElementById('btnViewReceipt');
  const btnCloseReceipt = document.getElementById('btnCloseReceipt');

  const bankFavorites = document.getElementById('bankFavorites');

  const sheetEmailInput = document.getElementById('sheetEmailInput');
  const btnBackToBankPicker = document.getElementById('btnBackToBankPicker');
  const emailScreenBankName = document.getElementById('emailScreenBankName');
  const authMethodList = document.getElementById('authMethodList');
  const authFieldEmail = document.getElementById('authFieldEmail');
  const authFieldPhone = document.getElementById('authFieldPhone');
  const authFieldId = document.getElementById('authFieldId');
  const emailInput = document.getElementById('emailInput');
  const phoneInput = document.getElementById('phoneInput');
  const idTypeSelect = document.getElementById('idTypeSelect');
  const idNumberInput = document.getElementById('idNumberInput');
  const btnStartPayment = document.getElementById('btnStartPayment');

  const screenPushNotification = document.getElementById('screenPushNotification');
  const pushNotificationCard = document.getElementById('pushNotificationCard');
  const pushNotificationIcon = document.getElementById('pushNotificationIcon');
  const pushNotificationTitle = document.getElementById('pushNotificationTitle');

  const screenBankSummary = document.getElementById('screenBankSummary');
  const summaryScreenHeader = document.getElementById('summaryScreenHeader');
  const summaryScreenBankName = document.getElementById('summaryScreenBankName');
  const summaryFacturaNombre = document.getElementById('summaryFacturaNombre');
  const summaryAmount = document.getElementById('summaryAmount');
  const bankSummaryAccountList = document.getElementById('bankSummaryAccountList');
  const btnAuthorizeBankPayment = document.getElementById('btnAuthorizeBankPayment');

  const sheetAlreadyPaid = document.getElementById('sheetAlreadyPaid');
  const alreadyPaidAmount = document.getElementById('alreadyPaidAmount');
  const btnCloseAlreadyPaid = document.getElementById('btnCloseAlreadyPaid');

  const receiptAmountText = document.getElementById('receiptAmountText');
  const receiptTime = document.getElementById('receiptTime');
  const receiptBankName = document.getElementById('receiptBankName');
  const receiptDate = document.getElementById('receiptDate');
  const receiptDetailAmount = document.getElementById('receiptDetailAmount');

  const screenBatchLoad = document.getElementById('screenBatchLoad');
  const batchDeudorCount = document.getElementById('batchDeudorCount');
  const batchMontoTotal = document.getElementById('batchMontoTotal');
  const batchPreviewList = document.getElementById('batchPreviewList');
  const btnCargarBatch = document.getElementById('btnCargarBatch');

  const screenDashboard = document.getElementById('screenDashboard');
  const btnBackToBatch = document.getElementById('btnBackToBatch');
  const consolidadoMetaNombre = document.getElementById('consolidadoMetaNombre');
  const consolidadoRecaudado = document.getElementById('consolidadoRecaudado');
  const consolidadoProgressFill = document.getElementById('consolidadoProgressFill');
  const consolidadoPorcentaje = document.getElementById('consolidadoPorcentaje');
  const consolidadoMeta = document.getElementById('consolidadoMeta');
  const consolidadoGoalBanner = document.getElementById('consolidadoGoalBanner');
  const consolidadoList = document.getElementById('consolidadoList');
  const btnSimulateOtherPayment = document.getElementById('btnSimulateOtherPayment');
  const btnCerrarCiclo = document.getElementById('btnCerrarCiclo');

  const screenConciliacionFinal = document.getElementById('screenConciliacionFinal');
  const reconTotalCartera = document.getElementById('reconTotalCartera');
  const reconTotalRecaudado = document.getElementById('reconTotalRecaudado');
  const reconTotalVencido = document.getElementById('reconTotalVencido');
  const btnVolverDashboard = document.getElementById('btnVolverDashboard');

  let selectedBank = null;
  let selectedBankKey = null;
  let selectedBankName = null;
  let selectedBankInitials = null;
  let selectedAccount = null;
  let authMethod = 'email';

  function showOverlay() {
    overlayBackdrop.hidden = false;
  }

  function hideOverlay() {
    overlayBackdrop.hidden = true;
  }

  // Patrón de sheets/overlays reutilizado de whatsapp/app.js (igual que hizo vaquita/).
  function hideAllSheets() {
    sheetDetail.hidden = true;
    sheetReceipt.hidden = true;
    screenBiometric.hidden = true;
    sheetBankPicker.hidden = true;
    sheetEmailInput.hidden = true;
    screenPushNotification.hidden = true;
    screenBankSummary.hidden = true;
    sheetAlreadyPaid.hidden = true;
  }

  function applyBankTheme(headerEl, bankKey) {
    headerEl.className = 'bank-app-header theme-' + bankKey;
  }

  function currentTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  function estadoLabel(estado) {
    if (estado === 'pagado') return 'Pagada';
    if (estado === 'vencido') return 'Vencida';
    return 'Pendiente';
  }

  // ===================== Role tabs: alternar entre vista deudor y tesorería =====================
  function selectRole(role) {
    tabDeudor.classList.toggle('selected', role === 'deudor');
    tabTesoreria.classList.toggle('selected', role === 'tesoreria');
    viewDeudor.hidden = role !== 'deudor';
    viewTesoreria.hidden = role !== 'tesoreria';

    if (role === 'deudor') {
      updateInviteCard();
    } else if (!screenDashboard.hidden) {
      renderDashboard();
    }
  }

  tabDeudor.addEventListener('click', function () {
    selectRole('deudor');
  });

  tabTesoreria.addEventListener('click', function () {
    selectRole('tesoreria');
  });

  // ===================== Vista deudor: tarjeta de invitación (RTP individual) =====================
  function updateInviteCard() {
    const you = cartera.deudores[YOU_INDEX];
    invitePartAmount.textContent = formatCOP(you.monto);
    inviteVencimiento.textContent = cartera.fechaLimite;
    inviteEstadoText.textContent = estadoLabel(you.estado);
    receiptBubble.hidden = !isYouPaid();
  }

  updateInviteCard();

  // Paso 1 -> 2: abrir detalle de la factura individual
  btnViewFacturaDetail.addEventListener('click', function () {
    const you = cartera.deudores[YOU_INDEX];

    if (isYouPaid()) {
      alreadyPaidAmount.textContent = formatCOP(you.monto);
      showOverlay();
      sheetAlreadyPaid.hidden = false;
      return;
    }

    facturaDetailNombre.textContent = cartera.organizacion;
    facturaDetailMonto.textContent = formatCOP(you.monto);
    facturaDetailVencimiento.textContent = cartera.fechaLimite;
    facturaDetailEstado.textContent = estadoLabel(you.estado);

    showOverlay();
    sheetDetail.hidden = false;
  });

  // Paso 2 -> 3: pagar con RTP, ir al selector de banco
  btnAuthorize.addEventListener('click', function () {
    sheetDetail.hidden = true;
    sheetBankPicker.hidden = false;
  });

  btnBackToDetail.addEventListener('click', function () {
    sheetBankPicker.hidden = true;
    sheetDetail.hidden = false;
  });

  // Paso 3: elegir banco favorito abre la verificación de identidad
  bankFavorites.addEventListener('click', function (e) {
    const favorite = e.target.closest('.bank-favorite');
    if (!favorite) return;

    const bankKey = favorite.getAttribute('data-bank');
    const bankName = favorite.getAttribute('data-name');

    selectedBankKey = bankKey;
    selectedBankName = bankName;
    selectedBankInitials = favorite.querySelector('.bank-logo').textContent;
    selectedBank = null;

    emailScreenBankName.textContent = selectedBankName;
    emailInput.value = '';
    phoneInput.value = '';
    idTypeSelect.value = '';
    idNumberInput.value = '';
    selectAuthMethod('email');

    sheetBankPicker.hidden = true;
    sheetEmailInput.hidden = false;
  });

  btnBackToBankPicker.addEventListener('click', function () {
    sheetEmailInput.hidden = true;
    sheetBankPicker.hidden = false;
  });

  function selectAuthMethod(method) {
    authMethod = method;

    authMethodList.querySelectorAll('.bank-favorite').forEach(function (el) {
      el.classList.toggle('selected', el.getAttribute('data-method') === method);
    });

    authFieldEmail.hidden = method !== 'email';
    authFieldPhone.hidden = method !== 'phone';
    authFieldId.hidden = method !== 'id';

    updateStartPaymentState();
  }

  authMethodList.addEventListener('click', function (e) {
    const method = e.target.closest('.bank-favorite');
    if (!method) return;
    selectAuthMethod(method.getAttribute('data-method'));
  });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function updateStartPaymentState() {
    let valid = false;
    if (authMethod === 'email') {
      valid = emailPattern.test(emailInput.value.trim());
    } else if (authMethod === 'phone') {
      valid = phoneInput.value.replace(/\D/g, '').length === 10;
    } else if (authMethod === 'id') {
      valid = idTypeSelect.value !== '' && idNumberInput.value.trim().length >= 5;
    }
    btnStartPayment.disabled = !valid;
  }

  emailInput.addEventListener('input', updateStartPaymentState);
  phoneInput.addEventListener('input', updateStartPaymentState);
  idTypeSelect.addEventListener('change', updateStartPaymentState);
  idNumberInput.addEventListener('input', updateStartPaymentState);

  btnStartPayment.addEventListener('click', function () {
    sheetEmailInput.hidden = true;
    hideOverlay();

    pushNotificationIcon.className = 'push-notification-icon dot-' + selectedBankKey;
    pushNotificationIcon.textContent = selectedBankInitials;
    pushNotificationTitle.textContent = selectedBankName;

    screenPushNotification.hidden = false;
  });

  pushNotificationCard.addEventListener('click', function () {
    screenPushNotification.hidden = true;
    screenBiometric.hidden = false;
  });

  function finishBankBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    const you = cartera.deudores[YOU_INDEX];

    applyBankTheme(summaryScreenHeader, selectedBankKey);
    summaryScreenBankName.textContent = selectedBankName;
    summaryFacturaNombre.textContent = cartera.organizacion;
    summaryAmount.textContent = formatCOP(you.monto);

    bankSummaryAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnAuthorizeBankPayment.disabled = true;
    selectedBank = null;

    screenBankSummary.hidden = false;
  }

  bankSummaryAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;

    bankSummaryAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    selectedBank = {
      name: selectedBankName + ' - ' + item.querySelector('.account-name').textContent,
      balance: item.getAttribute('data-balance')
    };

    btnAuthorizeBankPayment.disabled = false;
  });

  fingerprintTap.addEventListener('click', finishBankBiometric);

  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(finishBankBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  // Resumen del banco -> autorizar el pago, marcar a "ti" (Ana) como pagada
  btnAuthorizeBankPayment.addEventListener('click', function () {
    screenBankSummary.hidden = true;
    hideAllSheets();

    const you = cartera.deudores[YOU_INDEX];
    you.estado = 'pagado';
    you.montoPagado = you.monto;

    receiptBubble.hidden = false;
    receiptAmountText.textContent = formatCOP(you.monto);
    receiptDetailAmount.textContent = formatCOP(you.monto);
    receiptTime.textContent = currentTime();
    receiptBankName.textContent = selectedBank ? selectedBank.name : '—';
    receiptDate.textContent = new Date().toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    chatBody.scrollTop = chatBody.scrollHeight;

    // Si tesorería ya está viendo el dashboard, refléjalo de inmediato.
    if (!viewTesoreria.hidden && !screenDashboard.hidden) {
      renderDashboard();
    }
  });

  btnViewReceipt.addEventListener('click', function () {
    showOverlay();
    sheetReceipt.hidden = false;
  });

  btnCloseReceipt.addEventListener('click', function () {
    sheetReceipt.hidden = true;
    hideOverlay();
  });

  btnCloseAlreadyPaid.addEventListener('click', function () {
    sheetAlreadyPaid.hidden = true;
    hideOverlay();
  });

  overlayBackdrop.addEventListener('click', function () {
    hideAllSheets();
    hideOverlay();
  });

  // ===================== Vista tesorería: carga de batch (mock) =====================
  function renderBatchPreview() {
    batchDeudorCount.value = cartera.deudores.length;
    batchMontoTotal.value = formatCOP(computeTotalCartera());

    batchPreviewList.innerHTML = '';
    cartera.deudores.forEach(function (d) {
      const row = document.createElement('div');
      row.className = 'form-participant-item';
      row.innerHTML = '<span>' + d.nombre + '</span><span class="form-participant-amount">' +
        formatCOP(d.monto) + '</span>';
      batchPreviewList.appendChild(row);
    });
  }

  renderBatchPreview();

  btnCargarBatch.addEventListener('click', function () {
    screenBatchLoad.hidden = true;
    screenDashboard.hidden = false;
    renderDashboard();
  });

  btnBackToBatch.addEventListener('click', function () {
    screenDashboard.hidden = true;
    screenBatchLoad.hidden = false;
  });

  // ===================== Vista tesorería: dashboard de estados (pantalla distintiva) =====================
  // Genérico: opera sobre { label, status, amount }[] + total cartera, igual que el consolidado
  // de vaquita/ — se agrega el estado 'vencido' con estilo visual propio (rojo).
  function renderDashboard() {
    const items = toConsolidadoItems(cartera.deudores);
    const recaudado = computeRecaudado(items);
    const totalCartera = computeTotalCartera();
    const porcentaje = Math.min(100, Math.round((recaudado / totalCartera) * 100));
    const metaAlcanzada = recaudado >= totalCartera;

    consolidadoMetaNombre.textContent = cartera.nombreCartera;
    consolidadoRecaudado.textContent = formatCOP(recaudado);
    consolidadoProgressFill.style.width = porcentaje + '%';
    consolidadoPorcentaje.textContent = porcentaje + '% de la cartera';
    consolidadoMeta.textContent = 'Meta: ' + formatCOP(totalCartera);
    consolidadoGoalBanner.hidden = !metaAlcanzada;

    consolidadoList.innerHTML = '';
    items.forEach(function (item, index) {
      const row = document.createElement('div');
      row.className = 'consolidado-item';

      const paid = item.status === 'pagado';
      const vencido = item.status === 'vencido';
      const initials = item.label.trim().charAt(0).toUpperCase();
      const montoAdeudado = cartera.deudores[index].monto;

      let statusClass = 'consolidado-item-status-pendiente';
      let statusText = 'Pendiente';
      let amountText = formatCOP(montoAdeudado) + ' pendiente';

      if (paid) {
        statusClass = 'consolidado-item-status-pagado';
        statusText = 'Pagó';
        amountText = formatCOP(item.amount) + ' pagado';
      } else if (vencido) {
        statusClass = 'consolidado-item-status-vencido';
        statusText = 'Vencido';
        amountText = formatCOP(montoAdeudado) + ' vencido';
      }

      row.innerHTML =
        '<span class="consolidado-item-avatar">' + initials + '</span>' +
        '<span class="consolidado-item-info">' +
          '<span class="consolidado-item-name">' + item.label + '</span>' +
          '<span class="consolidado-item-amount">' + amountText + '</span>' +
        '</span>' +
        '<span class="consolidado-item-status ' + statusClass + '">' + statusText + '</span>';

      consolidadoList.appendChild(row);
    });

    btnSimulateOtherPayment.disabled = metaAlcanzada;
  }

  // Botón para simular el pago de otro deudor pendiente, sin necesitar múltiples sesiones
  // (igual que en vaquita/). Los deudores 'vencido' no se ven afectados: fuera de alcance
  // según tareas-b3, no se modela gestión de cobranza sobre vencidos.
  btnSimulateOtherPayment.addEventListener('click', function () {
    const nextPending = cartera.deudores.find(function (d) {
      return d.estado === 'pendiente';
    });

    if (!nextPending) return;

    nextPending.estado = 'pagado';
    nextPending.montoPagado = nextPending.monto;

    renderDashboard();

    // Mantiene sincronizada la vista de deudor si corresponde a "ti".
    if (!viewDeudor.hidden) {
      updateInviteCard();
    }
  });

  // ===================== Vista tesorería: conciliación consolidada final =====================
  // Adicional al consolidado de vaquita/: cierre de ciclo con los tres totales de cartera.
  btnCerrarCiclo.addEventListener('click', function () {
    const items = toConsolidadoItems(cartera.deudores);
    const recaudado = computeRecaudado(items);
    const totalCartera = computeTotalCartera();
    const totalVencido = computeTotalVencido();

    reconTotalCartera.textContent = formatCOP(totalCartera);
    reconTotalRecaudado.textContent = formatCOP(recaudado);
    reconTotalVencido.textContent = formatCOP(totalVencido);

    screenDashboard.hidden = true;
    screenConciliacionFinal.hidden = false;
  });

  btnVolverDashboard.addEventListener('click', function () {
    screenConciliacionFinal.hidden = true;
    screenDashboard.hidden = false;
    renderDashboard();
  });
})();
