(function () {
  // ===================== Estado de la solicitud colectiva (vaquita) =====================
  // { metaNombre, montoTotal, montoPorPersona, participantes: [{ nombre, estado, montoAportado }], organizador }
  const vaquita = {
    metaNombre: 'Despedida de soltera de Laura',
    montoTotal: 500000,
    montoPorPersona: 100000,
    organizador: 'Sofía Martínez',
    participantes: [
      { nombre: 'Sofía Martínez (organizadora)', estado: 'pagado', montoAportado: 100000 },
      { nombre: 'Camila Ruiz', estado: 'pagado', montoAportado: 100000 },
      { nombre: 'Ana Torres (tú)', estado: 'pendiente', montoAportado: 0 },
      { nombre: 'Julián Gómez', estado: 'pendiente', montoAportado: 0 },
      { nombre: 'Mateo Londoño', estado: 'pendiente', montoAportado: 0 }
    ]
  };

  // Índice del participante que representa a "ti" en la vista de participante.
  const YOU_INDEX = 2;

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  // ===================== Lógica de consolidado, escrita de forma genérica =====================
  // Diseñada para poder reutilizarse en un futuro prototipo de B3 (cobro masivo de cartera):
  // opera sobre una lista genérica de items { label, status, amount } + un total objetivo.
  function toConsolidadoItems(participantes) {
    return participantes.map(function (p) {
      return { label: p.nombre, status: p.estado, amount: p.montoAportado };
    });
  }

  function computeRecaudado(items) {
    return items.reduce(function (sum, item) {
      return sum + (item.amount || 0);
    }, 0);
  }

  function isYouPaid() {
    return vaquita.participantes[YOU_INDEX].estado === 'pagado';
  }

  // ===================== Referencias a elementos =====================
  const tabParticipant = document.getElementById('tabParticipant');
  const tabOrganizer = document.getElementById('tabOrganizer');
  const viewParticipant = document.getElementById('viewParticipant');
  const viewOrganizer = document.getElementById('viewOrganizer');

  const chatBody = document.getElementById('chatBody');
  const invitePartAmount = document.getElementById('invitePartAmount');
  const inviteRaisedAmount = document.getElementById('inviteRaisedAmount');
  const btnViewAporteDetail = document.getElementById('btnViewAporteDetail');
  const receiptBubble = document.getElementById('receiptBubble');

  const overlayBackdrop = document.getElementById('overlayBackdrop');

  const sheetDetail = document.getElementById('sheetDetail');
  const aporteMetaNombre = document.getElementById('aporteMetaNombre');
  const aportePartAmount = document.getElementById('aportePartAmount');
  const aporteMetaTotal = document.getElementById('aporteMetaTotal');
  const aporteProgresoActual = document.getElementById('aporteProgresoActual');
  const aporteProgressFill = document.getElementById('aporteProgressFill');
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
  const summaryVaquitaNombre = document.getElementById('summaryVaquitaNombre');
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

  const screenVaquitaForm = document.getElementById('screenVaquitaForm');
  const formParticipantList = document.getElementById('formParticipantList');
  const btnCreateVaquita = document.getElementById('btnCreateVaquita');

  const screenConsolidado = document.getElementById('screenConsolidado');
  const btnBackToForm = document.getElementById('btnBackToForm');
  const consolidadoMetaNombre = document.getElementById('consolidadoMetaNombre');
  const consolidadoRecaudado = document.getElementById('consolidadoRecaudado');
  const consolidadoProgressFill = document.getElementById('consolidadoProgressFill');
  const consolidadoPorcentaje = document.getElementById('consolidadoPorcentaje');
  const consolidadoMeta = document.getElementById('consolidadoMeta');
  const consolidadoGoalBanner = document.getElementById('consolidadoGoalBanner');
  const consolidadoList = document.getElementById('consolidadoList');
  const btnSimulateOtherPayment = document.getElementById('btnSimulateOtherPayment');

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

  // ===================== Role tabs: alternar entre vista participante y organizador =====================
  function selectRole(role) {
    tabParticipant.classList.toggle('selected', role === 'participant');
    tabOrganizer.classList.toggle('selected', role === 'organizer');
    viewParticipant.hidden = role !== 'participant';
    viewOrganizer.hidden = role !== 'organizer';

    if (role === 'participant') {
      updateInviteCard();
    } else {
      renderConsolidado();
    }
  }

  tabParticipant.addEventListener('click', function () {
    selectRole('participant');
  });

  tabOrganizer.addEventListener('click', function () {
    selectRole('organizer');
  });

  // ===================== Vista participante: tarjeta de invitación =====================
  function updateInviteCard() {
    const items = toConsolidadoItems(vaquita.participantes);
    const recaudado = computeRecaudado(items);
    invitePartAmount.textContent = formatCOP(vaquita.montoPorPersona);
    inviteRaisedAmount.textContent = formatCOP(recaudado) + ' de ' + formatCOP(vaquita.montoTotal);
    receiptBubble.hidden = !isYouPaid();
  }

  updateInviteCard();

  // Paso 1 -> 2: abrir detalle del aporte individual
  btnViewAporteDetail.addEventListener('click', function () {
    if (isYouPaid()) {
      alreadyPaidAmount.textContent = formatCOP(vaquita.montoPorPersona);
      showOverlay();
      sheetAlreadyPaid.hidden = false;
      return;
    }

    const items = toConsolidadoItems(vaquita.participantes);
    const recaudado = computeRecaudado(items);

    aporteMetaNombre.textContent = vaquita.metaNombre;
    aportePartAmount.textContent = formatCOP(vaquita.montoPorPersona);
    aporteMetaTotal.textContent = formatCOP(vaquita.montoTotal);
    aporteProgresoActual.textContent = formatCOP(recaudado) + ' de ' + formatCOP(vaquita.montoTotal);
    aporteProgressFill.style.width = Math.min(100, Math.round((recaudado / vaquita.montoTotal) * 100)) + '%';

    showOverlay();
    sheetDetail.hidden = false;
  });

  // Paso 2 -> 3: aportar con RTP, ir al selector de banco
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

    applyBankTheme(summaryScreenHeader, selectedBankKey);
    summaryScreenBankName.textContent = selectedBankName;
    summaryVaquitaNombre.textContent = vaquita.metaNombre;
    summaryAmount.textContent = formatCOP(vaquita.montoPorPersona);

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

  // Resumen del banco -> autorizar el aporte, marcar a "ti" (Ana) como pagada
  btnAuthorizeBankPayment.addEventListener('click', function () {
    screenBankSummary.hidden = true;
    hideAllSheets();

    vaquita.participantes[YOU_INDEX].estado = 'pagado';
    vaquita.participantes[YOU_INDEX].montoAportado = vaquita.montoPorPersona;

    receiptBubble.hidden = false;
    receiptAmountText.textContent = formatCOP(vaquita.montoPorPersona);
    receiptDetailAmount.textContent = formatCOP(vaquita.montoPorPersona);
    receiptTime.textContent = currentTime();
    receiptBankName.textContent = selectedBank ? selectedBank.name : '—';
    receiptDate.textContent = new Date().toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    chatBody.scrollTop = chatBody.scrollHeight;

    // Si el organizador ya está viendo el consolidado, refléjalo de inmediato.
    if (!viewOrganizer.hidden && !screenConsolidado.hidden) {
      renderConsolidado();
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

  // ===================== Vista organizador: creación de la vaquita =====================
  function renderVaquitaForm() {
    formParticipantList.innerHTML = '';
    vaquita.participantes.forEach(function (p) {
      const row = document.createElement('div');
      row.className = 'form-participant-item';
      row.innerHTML = '<span>' + p.nombre + '</span><span class="form-participant-amount">' +
        formatCOP(vaquita.montoPorPersona) + '</span>';
      formParticipantList.appendChild(row);
    });
  }

  renderVaquitaForm();

  btnCreateVaquita.addEventListener('click', function () {
    screenVaquitaForm.hidden = true;
    screenConsolidado.hidden = false;
    renderConsolidado();
  });

  btnBackToForm.addEventListener('click', function () {
    screenConsolidado.hidden = true;
    screenVaquitaForm.hidden = false;
  });

  // ===================== Vista organizador: consolidado (pantalla distintiva) =====================
  // Genérico: opera sobre { label, status, amount }[] + montoTotal, para poder reutilizarse en B3.
  function renderConsolidado() {
    const items = toConsolidadoItems(vaquita.participantes);
    const recaudado = computeRecaudado(items);
    const porcentaje = Math.min(100, Math.round((recaudado / vaquita.montoTotal) * 100));
    const metaAlcanzada = recaudado >= vaquita.montoTotal;

    consolidadoMetaNombre.textContent = vaquita.metaNombre;
    consolidadoRecaudado.textContent = formatCOP(recaudado);
    consolidadoProgressFill.style.width = porcentaje + '%';
    consolidadoPorcentaje.textContent = porcentaje + '% de la meta';
    consolidadoMeta.textContent = 'Meta: ' + formatCOP(vaquita.montoTotal);
    consolidadoGoalBanner.hidden = !metaAlcanzada;

    consolidadoList.innerHTML = '';
    items.forEach(function (item) {
      const row = document.createElement('div');
      row.className = 'consolidado-item';

      const paid = item.status === 'pagado';
      const initials = item.label.trim().charAt(0).toUpperCase();

      row.innerHTML =
        '<span class="consolidado-item-avatar">' + initials + '</span>' +
        '<span class="consolidado-item-info">' +
          '<span class="consolidado-item-name">' + item.label + '</span>' +
          '<span class="consolidado-item-amount">' +
            (paid ? formatCOP(item.amount) + ' aportado' : formatCOP(vaquita.montoPorPersona) + ' pendiente') +
          '</span>' +
        '</span>' +
        '<span class="consolidado-item-status ' +
          (paid ? 'consolidado-item-status-pagado' : 'consolidado-item-status-pendiente') + '">' +
          (paid ? 'Pagó' : 'Pendiente') +
        '</span>';

      consolidadoList.appendChild(row);
    });

    btnSimulateOtherPayment.disabled = metaAlcanzada;
  }

  // Botón para simular el pago de otro participante, sin necesitar múltiples sesiones.
  btnSimulateOtherPayment.addEventListener('click', function () {
    const nextPending = vaquita.participantes.find(function (p) {
      return p.estado === 'pendiente';
    });

    if (!nextPending) return;

    nextPending.estado = 'pagado';
    nextPending.montoAportado = vaquita.montoPorPersona;

    renderConsolidado();

    // Mantiene sincronizada la vista de participante si corresponde a "ti".
    if (!viewParticipant.hidden) {
      updateInviteCard();
    }
  });
})();
