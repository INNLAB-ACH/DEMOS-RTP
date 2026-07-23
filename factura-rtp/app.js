(function () {
  // ===================== Estado de facturas (mock) =====================
  // Esquema mínimo de metadata factura-RTP propuesto por este prototipo:
  // { numeroFactura, concepto, emisor, nit, fechaEmision, fechaVencimiento,
  //   monto, referenciaERP, paid }
  const invoices = {
    pending: {
      numeroFactura: 'FE-2026-00871',
      concepto: 'Suministro de insumos de oficina',
      emisor: 'Distribuidora ABC S.A.S.',
      nit: '900.123.456-7',
      fechaEmision: '10/07/2026',
      fechaVencimiento: '25/07/2026',
      monto: 4850000,
      referenciaERP: 'OC-33021',
      paid: false
    },
    paid: {
      numeroFactura: 'FE-2026-00845',
      concepto: 'Servicio de mantenimiento de equipos',
      emisor: 'TechServ Ltda.',
      nit: '901.987.654-3',
      fechaEmision: '28/06/2026',
      fechaVencimiento: '05/07/2026',
      monto: 1230000,
      referenciaERP: 'OC-32950',
      paid: true
    }
  };

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  function conciliacionId(numeroFactura) {
    // Referencia de conciliación simulada, cruzada con el número de factura.
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return 'CONC-' + numeroFactura.replace('FE-', '') + '-' + suffix;
  }

  // ===================== Referencias a elementos =====================
  const screenInvoices = document.getElementById('screenInvoices');
  const invoicesBody = document.getElementById('invoicesBody');
  const invoiceCardPending = document.getElementById('invoiceCardPending');
  const invoiceCardPaid = document.getElementById('invoiceCardPaid');
  const invoiceCardBadgePending = document.getElementById('invoiceCardBadgePending');

  const screenInvoiceDetail = document.getElementById('screenInvoiceDetail');
  const btnBackToInvoices = document.getElementById('btnBackToInvoices');
  const invoiceDetailStatusBadge = document.getElementById('invoiceDetailStatusBadge');
  const detailNumeroFactura = document.getElementById('detailNumeroFactura');
  const detailConcepto = document.getElementById('detailConcepto');
  const detailEmisor = document.getElementById('detailEmisor');
  const detailNit = document.getElementById('detailNit');
  const detailFechaEmision = document.getElementById('detailFechaEmision');
  const detailFechaVencimiento = document.getElementById('detailFechaVencimiento');
  const detailReferenciaERP = document.getElementById('detailReferenciaERP');
  const detailMonto = document.getElementById('detailMonto');
  const btnPayInvoice = document.getElementById('btnPayInvoice');

  const screenBankPicker = document.getElementById('screenBankPicker');
  const btnBackToInvoiceDetail = document.getElementById('btnBackToInvoiceDetail');
  const bankFavorites = document.getElementById('bankFavorites');

  const screenIdentityVerification = document.getElementById('screenIdentityVerification');
  const btnBackToBankPicker = document.getElementById('btnBackToBankPicker');
  const identityBankName = document.getElementById('identityBankName');
  const authMethodList = document.getElementById('authMethodList');
  const authFieldEmail = document.getElementById('authFieldEmail');
  const authFieldPhone = document.getElementById('authFieldPhone');
  const authFieldId = document.getElementById('authFieldId');
  const identityEmailInput = document.getElementById('identityEmailInput');
  const identityPhoneInput = document.getElementById('identityPhoneInput');
  const identityIdTypeSelect = document.getElementById('identityIdTypeSelect');
  const identityIdNumberInput = document.getElementById('identityIdNumberInput');
  const btnStartPayment = document.getElementById('btnStartPayment');

  const screenPushNotification = document.getElementById('screenPushNotification');
  const pushNotificationCard = document.getElementById('pushNotificationCard');
  const pushNotificationIcon = document.getElementById('pushNotificationIcon');
  const pushNotificationTitle = document.getElementById('pushNotificationTitle');

  const screenBankApp = document.getElementById('screenBankApp');
  const bankAppHeader = document.getElementById('bankAppHeader');
  const bankAppName = document.getElementById('bankAppName');
  const btnCloseBankApp = document.getElementById('btnCloseBankApp');
  const bankAppPaymentView = document.getElementById('bankAppPaymentView');
  const bankAppInvoiceNumber = document.getElementById('bankAppInvoiceNumber');
  const bankAppAmount = document.getElementById('bankAppAmount');
  const bankAppConcept = document.getElementById('bankAppConcept');
  const bankAppInvoiceMeta = document.getElementById('bankAppInvoiceMeta');
  const bankAppAccountList = document.getElementById('bankAppAccountList');
  const btnAuthorizePayment = document.getElementById('btnAuthorizePayment');
  const bankAppConfirmView = document.getElementById('bankAppConfirmView');
  const bankAppConfirmAmount = document.getElementById('bankAppConfirmAmount');
  const bankAppConfirmConcept = document.getElementById('bankAppConfirmConcept');
  const bankAppConfirmAccount = document.getElementById('bankAppConfirmAccount');
  const btnReturnToMerchant = document.getElementById('btnReturnToMerchant');

  const screenBiometric = document.getElementById('screenBiometric');
  const fingerprintTap = document.getElementById('fingerprintTap');

  const screenReconciliation = document.getElementById('screenReconciliation');
  const reconInvoiceNumber = document.getElementById('reconInvoiceNumber');
  const reconAmount = document.getElementById('reconAmount');
  const reconAccount = document.getElementById('reconAccount');
  const reconReferenciaERP = document.getElementById('reconReferenciaERP');
  const reconConciliacionId = document.getElementById('reconConciliacionId');
  const btnCloseReconciliation = document.getElementById('btnCloseReconciliation');

  let currentInvoice = null;
  let selectedBank = null;
  let selectedAccount = null;
  let authMethod = 'email';

  // ===================== Paso 1: lista de facturas =====================
  function renderInvoiceList() {
    invoiceCardBadgePending.textContent = invoices.pending.paid ? 'Conciliada' : 'Pendiente';
    invoiceCardBadgePending.className = invoices.pending.paid
      ? 'invoice-card-badge invoice-card-badge-paid'
      : 'invoice-card-badge invoice-card-badge-pending';
  }

  renderInvoiceList();

  invoiceCardPending.addEventListener('click', function () {
    openInvoiceDetail(invoices.pending);
  });

  invoiceCardPaid.addEventListener('click', function () {
    openInvoiceDetail(invoices.paid);
  });

  // ===================== Paso 2: detalle de factura con metadata =====================
  function openInvoiceDetail(invoice) {
    currentInvoice = invoice;

    detailNumeroFactura.textContent = invoice.numeroFactura;
    detailConcepto.textContent = invoice.concepto;
    detailEmisor.textContent = invoice.emisor;
    detailNit.textContent = invoice.nit;
    detailFechaEmision.textContent = invoice.fechaEmision;
    detailFechaVencimiento.textContent = invoice.fechaVencimiento;
    detailReferenciaERP.textContent = invoice.referenciaERP;
    detailMonto.textContent = formatCOP(invoice.monto);

    if (invoice.paid) {
      invoiceDetailStatusBadge.textContent = 'Factura conciliada';
      btnPayInvoice.hidden = true;
    } else {
      invoiceDetailStatusBadge.textContent = 'RTP embebido';
      btnPayInvoice.hidden = false;
    }

    screenInvoices.hidden = true;
    screenInvoiceDetail.hidden = false;
  }

  btnBackToInvoices.addEventListener('click', function () {
    screenInvoiceDetail.hidden = true;
    screenInvoices.hidden = false;
  });

  // ===================== Paso 2 -> 3: pagar con RTP =====================
  btnPayInvoice.addEventListener('click', function () {
    bankFavorites.querySelectorAll('.bank-favorite').forEach(function (el) {
      el.classList.remove('selected');
    });
    selectedBank = null;

    screenInvoiceDetail.hidden = true;
    screenBankPicker.hidden = false;
  });

  btnBackToInvoiceDetail.addEventListener('click', function () {
    screenBankPicker.hidden = true;
    screenInvoiceDetail.hidden = false;
  });

  // ===================== Paso 3: elegir banco =====================
  bankFavorites.addEventListener('click', function (e) {
    const favorite = e.target.closest('.bank-favorite');
    if (!favorite) return;

    const bankKey = favorite.getAttribute('data-bank');
    const bankName = favorite.getAttribute('data-name');

    selectedBank = {
      key: bankKey,
      name: bankName,
      initials: favorite.querySelector('.bank-logo').textContent
    };

    identityBankName.textContent = selectedBank.name;
    identityEmailInput.value = '';
    identityPhoneInput.value = '';
    identityIdTypeSelect.value = '';
    identityIdNumberInput.value = '';
    selectAuthMethod('email');

    screenBankPicker.hidden = true;
    screenIdentityVerification.hidden = false;
  });

  btnBackToBankPicker.addEventListener('click', function () {
    screenIdentityVerification.hidden = true;
    screenBankPicker.hidden = false;
  });

  // ===================== Verificación de identidad =====================
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
      valid = emailPattern.test(identityEmailInput.value.trim());
    } else if (authMethod === 'phone') {
      valid = identityPhoneInput.value.replace(/\D/g, '').length === 10;
    } else if (authMethod === 'id') {
      valid = identityIdTypeSelect.value !== '' && identityIdNumberInput.value.trim().length >= 5;
    }
    btnStartPayment.disabled = !valid;
  }

  identityEmailInput.addEventListener('input', updateStartPaymentState);
  identityPhoneInput.addEventListener('input', updateStartPaymentState);
  identityIdTypeSelect.addEventListener('change', updateStartPaymentState);
  identityIdNumberInput.addEventListener('input', updateStartPaymentState);

  btnStartPayment.addEventListener('click', function () {
    screenIdentityVerification.hidden = true;

    pushNotificationIcon.className = 'push-notification-icon dot-' + selectedBank.key;
    pushNotificationIcon.textContent = selectedBank.initials;
    pushNotificationTitle.textContent = selectedBank.name;

    screenPushNotification.hidden = false;
  });

  pushNotificationCard.addEventListener('click', function () {
    screenPushNotification.hidden = true;
    screenBiometric.hidden = false;
  });

  // ===================== Biometría -> app del banco con metadata de factura =====================
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    bankAppHeader.className = 'bank-app-header theme-' + selectedBank.key;
    bankAppName.textContent = selectedBank.name;

    bankAppInvoiceNumber.textContent = 'Factura ' + currentInvoice.numeroFactura;
    bankAppAmount.textContent = formatCOP(currentInvoice.monto);
    bankAppConcept.textContent = currentInvoice.concepto;
    bankAppInvoiceMeta.textContent = 'Emisor: ' + currentInvoice.emisor + ' · Vence: ' + currentInvoice.fechaVencimiento;

    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnAuthorizePayment.disabled = true;
    selectedAccount = null;

    bankAppPaymentView.hidden = false;
    btnAuthorizePayment.hidden = false;
    bankAppConfirmView.hidden = true;
    btnReturnToMerchant.hidden = true;

    screenBankApp.hidden = false;
  }

  fingerprintTap.addEventListener('click', completeBiometric);

  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(completeBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  btnCloseBankApp.addEventListener('click', function () {
    screenBankApp.hidden = true;
  });

  // ===================== Selección de cuenta a debitar =====================
  bankAppAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;

    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    selectedAccount = {
      name: item.querySelector('.account-name').textContent,
      balance: item.getAttribute('data-balance')
    };

    btnAuthorizePayment.disabled = false;
  });

  // ===================== Autorización desde el banco =====================
  btnAuthorizePayment.addEventListener('click', function () {
    bankAppPaymentView.hidden = true;
    btnAuthorizePayment.hidden = true;

    bankAppConfirmAmount.textContent = formatCOP(currentInvoice.monto);
    bankAppConfirmConcept.textContent = 'Factura ' + currentInvoice.numeroFactura;
    bankAppConfirmAccount.textContent = selectedAccount
      ? selectedAccount.name + ' · Saldo: ' + selectedAccount.balance
      : '—';
    bankAppConfirmView.hidden = false;
    btnReturnToMerchant.hidden = false;
  });

  // ===================== Regresar a Banca Empresarial -> conciliación =====================
  btnReturnToMerchant.addEventListener('click', function () {
    screenBankApp.hidden = true;

    // Marca la factura como pagada/conciliada en el estado.
    currentInvoice.paid = true;

    reconInvoiceNumber.textContent = currentInvoice.numeroFactura;
    reconAmount.textContent = formatCOP(currentInvoice.monto);
    reconAccount.textContent = selectedBank && selectedAccount
      ? selectedBank.name + ' · ' + selectedAccount.name
      : '—';
    reconReferenciaERP.textContent = currentInvoice.referenciaERP;
    reconConciliacionId.textContent = conciliacionId(currentInvoice.numeroFactura);

    screenReconciliation.hidden = false;
  });

  // ===================== Cerrar confirmación -> volver a la lista actualizada =====================
  btnCloseReconciliation.addEventListener('click', function () {
    screenReconciliation.hidden = true;
    screenInvoiceDetail.hidden = true;

    renderInvoiceList();

    selectedBank = null;
    selectedAccount = null;
    currentInvoice = null;

    screenInvoices.hidden = false;
  });
})();
