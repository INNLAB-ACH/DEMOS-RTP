(function () {
  // ===================== Estado de facturas (mock) =====================
  // Esquema reutilizado tal cual de factura-rtp/app.js:
  // { numeroFactura, concepto, emisor, nit, fechaEmision, fechaVencimiento, monto,
  //   referenciaERP, paid }
  // Extendido para B5 (factoring) con los campos que factura-rtp/ (B1) no tiene:
  // beneficiarioOriginal, beneficiarioPago, factorNombre, estadoFactoring.
  const invoices = {
    factorizada: {
      numeroFactura: 'FE-2026-00902',
      concepto: 'Suministro de materia prima textil',
      emisor: 'Distribuidora ABC S.A.S.',
      nit: '900.123.456-7',
      fechaEmision: '15/07/2026',
      fechaVencimiento: '05/08/2026',
      monto: 12400000,
      referenciaERP: 'OC-33210',
      paid: false,
      beneficiarioOriginal: 'Distribuidora ABC S.A.S.',
      beneficiarioPago: 'Factoring Andino S.A.',
      factorNombre: 'Factoring Andino S.A.',
      estadoFactoring: 'factorizada'
    },
    sinFactorizar: {
      numeroFactura: 'FE-2026-00915',
      concepto: 'Servicio de transporte de carga',
      emisor: 'Transportes Cordillera S.A.S.',
      nit: '901.222.333-9',
      fechaEmision: '20/07/2026',
      fechaVencimiento: '12/08/2026',
      monto: 3150000,
      referenciaERP: 'OC-33244',
      paid: false,
      beneficiarioOriginal: 'Transportes Cordillera S.A.S.',
      beneficiarioPago: 'Transportes Cordillera S.A.S.',
      factorNombre: null,
      estadoFactoring: 'sin_factorizar'
    }
  };

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  // Reutilizada tal cual de factura-rtp/app.js.
  function conciliacionId(numeroFactura) {
    // Referencia de conciliación simulada, cruzada con el número de factura.
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return 'CONC-' + numeroFactura.replace('FE-', '') + '-' + suffix;
  }

  // ===================== Referencias a elementos =====================
  const screenInvoices = document.getElementById('screenInvoices');
  const invoiceCardFactorizada = document.getElementById('invoiceCardFactorizada');
  const invoiceCardSinFactorizar = document.getElementById('invoiceCardSinFactorizar');
  const invoiceCardBadgeFactorizada = document.getElementById('invoiceCardBadgeFactorizada');
  const invoiceCardBadgeSinFactorizar = document.getElementById('invoiceCardBadgeSinFactorizar');

  const screenInvoiceDetail = document.getElementById('screenInvoiceDetail');
  const btnBackToInvoices = document.getElementById('btnBackToInvoices');
  const invoiceDetailStatusBadge = document.getElementById('invoiceDetailStatusBadge');
  const factoringBanner = document.getElementById('factoringBanner');
  const factoringBannerFactor = document.getElementById('factoringBannerFactor');
  const factoringBannerEmisor = document.getElementById('factoringBannerEmisor');
  const detailNumeroFactura = document.getElementById('detailNumeroFactura');
  const detailConcepto = document.getElementById('detailConcepto');
  const detailNit = document.getElementById('detailNit');
  const detailFechaEmision = document.getElementById('detailFechaEmision');
  const detailFechaVencimiento = document.getElementById('detailFechaVencimiento');
  const detailReferenciaERP = document.getElementById('detailReferenciaERP');
  const detailBeneficiarioOriginal = document.getElementById('detailBeneficiarioOriginal');
  const detailBeneficiarioPago = document.getElementById('detailBeneficiarioPago');
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
  const bankAppConfirmBeneficiario = document.getElementById('bankAppConfirmBeneficiario');
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
  const liquidacionBanner = document.getElementById('liquidacionBanner');
  const liquidacionBannerText = document.getElementById('liquidacionBannerText');
  const btnCloseReconciliation = document.getElementById('btnCloseReconciliation');

  let currentInvoice = null;
  let selectedBank = null;
  let selectedAccount = null;
  let authMethod = 'email';

  // ===================== Paso 1: lista de facturas =====================
  function renderInvoiceList() {
    invoiceCardBadgeFactorizada.textContent = invoices.factorizada.estadoFactoring === 'factorizada' ? 'Factorizada' : 'Sin factorizar';
    invoiceCardBadgeFactorizada.className = invoices.factorizada.estadoFactoring === 'factorizada'
      ? 'invoice-card-badge invoice-card-badge-factoring'
      : 'invoice-card-badge invoice-card-badge-pending';

    invoiceCardBadgeSinFactorizar.textContent = invoices.sinFactorizar.estadoFactoring === 'factorizada' ? 'Factorizada' : 'Sin factorizar';
    invoiceCardBadgeSinFactorizar.className = invoices.sinFactorizar.estadoFactoring === 'factorizada'
      ? 'invoice-card-badge invoice-card-badge-factoring'
      : 'invoice-card-badge invoice-card-badge-pending';
  }

  renderInvoiceList();

  invoiceCardFactorizada.addEventListener('click', function () {
    openInvoiceDetail(invoices.factorizada);
  });

  invoiceCardSinFactorizar.addEventListener('click', function () {
    openInvoiceDetail(invoices.sinFactorizar);
  });

  // ===================== Paso 2: detalle de factura, con aviso de redirección =====================
  // El aviso de redirección de beneficiario se muestra AQUÍ, antes de que el comprador
  // autorice el pago (criterio de aceptación de tareas-b5) — no solo en la confirmación final.
  function openInvoiceDetail(invoice) {
    currentInvoice = invoice;

    detailNumeroFactura.textContent = invoice.numeroFactura;
    detailConcepto.textContent = invoice.concepto;
    detailNit.textContent = invoice.nit;
    detailFechaEmision.textContent = invoice.fechaEmision;
    detailFechaVencimiento.textContent = invoice.fechaVencimiento;
    detailReferenciaERP.textContent = invoice.referenciaERP;
    detailBeneficiarioOriginal.textContent = invoice.beneficiarioOriginal;
    detailBeneficiarioPago.textContent = invoice.beneficiarioPago;
    detailMonto.textContent = formatCOP(invoice.monto);

    const factorizada = invoice.estadoFactoring === 'factorizada';

    if (invoice.paid) {
      invoiceDetailStatusBadge.textContent = 'Factura conciliada';
      btnPayInvoice.hidden = true;
    } else {
      invoiceDetailStatusBadge.textContent = 'RTP embebido';
      btnPayInvoice.hidden = false;
    }

    factoringBanner.hidden = !factorizada;
    if (factorizada) {
      factoringBannerFactor.textContent = invoice.factorNombre;
      factoringBannerEmisor.textContent = invoice.beneficiarioOriginal;
    }

    screenInvoices.hidden = true;
    screenInvoiceDetail.hidden = false;
  }

  btnBackToInvoices.addEventListener('click', function () {
    screenInvoiceDetail.hidden = true;
    screenInvoices.hidden = false;
  });

  // ===================== Paso 2 -> 3: pagar con RTP (reusado tal cual de factura-rtp/) =====================
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

  // ===================== Paso 3: elegir banco (reusado tal cual de factura-rtp/) =====================
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

  // ===================== Verificación de identidad (reusada tal cual de factura-rtp/) =====================
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
  // El resumen del banco muestra el beneficiario real (beneficiarioPago = factor cuando la
  // factura está factorizada), reforzando el aviso ya visto en el detalle.
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    bankAppHeader.className = 'bank-app-header theme-' + selectedBank.key;
    bankAppName.textContent = selectedBank.name;

    bankAppInvoiceNumber.textContent = 'Factura ' + currentInvoice.numeroFactura;
    bankAppAmount.textContent = formatCOP(currentInvoice.monto);
    bankAppConcept.textContent = currentInvoice.concepto;
    bankAppInvoiceMeta.textContent = 'Se acredita a: ' + currentInvoice.beneficiarioPago + ' · Vence: ' + currentInvoice.fechaVencimiento;

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

  // ===================== Selección de cuenta a debitar (reusada tal cual de factura-rtp/) =====================
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
    bankAppConfirmBeneficiario.textContent = 'Acreditado a: ' + currentInvoice.beneficiarioPago;
    bankAppConfirmAccount.textContent = selectedBank && selectedAccount
      ? selectedBank.name + ' - ' + selectedAccount.name + ' · Saldo: ' + selectedAccount.balance
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

    // Confirmación final: si la factura fue factorizada, aclara que el factor liquidará al
    // proveedor por separado — nunca da a entender que el proveedor recibió el pago directo.
    const factorizada = currentInvoice.estadoFactoring === 'factorizada';
    liquidacionBanner.hidden = !factorizada;
    if (factorizada) {
      liquidacionBannerText.textContent =
        currentInvoice.factorNombre + ' liquidará a ' + currentInvoice.beneficiarioOriginal + ' según sus términos.';
    }

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
