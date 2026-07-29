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

  const screenScenarioSelector = document.getElementById('screenScenarioSelector');
  const btnScenarioOnboarding = document.getElementById('btnScenarioOnboarding');
  const btnScenarioSkip = document.getElementById('btnScenarioSkip');

  const screenOnboardingIntro = document.getElementById('screenOnboardingIntro');
  const btnOnboardingContinue = document.getElementById('btnOnboardingContinue');

  const screenOnboardingAccount = document.getElementById('screenOnboardingAccount');
  const onboardingAccountList = document.getElementById('onboardingAccountList');
  const btnSaveDefaultAccount = document.getElementById('btnSaveDefaultAccount');

  const accountSelectedCard = document.getElementById('accountSelectedCard');
  const accountSelectedDot = document.getElementById('accountSelectedDot');
  const accountSelectedName = document.getElementById('accountSelectedName');
  const accountSelectedBalance = document.getElementById('accountSelectedBalance');
  const btnChangeAccount = document.getElementById('btnChangeAccount');

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

  // Banco y cuenta configurados por defecto para pagos con RTP embebido (vía onboarding en la app del banco).
  // Se preconfiguran con Banco Amarillo / Cuenta Corriente Principal para que el escenario "ir directo al pago" funcione sin pasar por el onboarding.
  let selectedBank = { key: 'amarillo', name: 'Banco Amarillo', initials: 'BA' };
  let defaultAccountName = 'Cuenta Corriente Principal';
  let defaultAccountBalance = '$18.400.000';
  let selectedAccount = null;
  let onboardingChoice = null;

  // ===================== Selector de escenario + onboarding de cuenta por defecto =====================
  btnScenarioOnboarding.addEventListener('click', function () {
    screenScenarioSelector.hidden = true;
    screenOnboardingIntro.hidden = false;
  });

  btnScenarioSkip.addEventListener('click', function () {
    screenScenarioSelector.hidden = true;
  });

  btnOnboardingContinue.addEventListener('click', function () {
    screenOnboardingIntro.hidden = true;
    screenOnboardingAccount.hidden = false;
  });

  onboardingAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;

    onboardingAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');
    onboardingChoice = item;
  });

  btnSaveDefaultAccount.addEventListener('click', function () {
    const chosen = onboardingChoice || onboardingAccountList.querySelector('.account-item.selected');
    if (!chosen) return;

    selectedBank = {
      key: chosen.getAttribute('data-bank'),
      name: chosen.getAttribute('data-bank-name'),
      initials: chosen.getAttribute('data-bank-initials')
    };
    defaultAccountName = chosen.querySelector('.account-name').textContent;
    defaultAccountBalance = chosen.getAttribute('data-balance');

    screenOnboardingAccount.hidden = true;
  });

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

  // ===================== Paso 2 -> 3: pagar con RTP. El banco y la cuenta ya están preconfigurados
  // (onboarding), así que se salta directo a la notificación push, sin elegir banco ni verificar
  // identidad de nuevo. =====================
  btnPayInvoice.addEventListener('click', function () {
    screenInvoiceDetail.hidden = true;

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

    // La cuenta configurada como predeterminada en el onboarding queda preseleccionada.
    const accountItems = bankAppAccountList.querySelectorAll('.account-item');
    let matched = null;
    accountItems.forEach(function (el) {
      if (el.querySelector('.account-name').textContent === defaultAccountName) matched = el;
    });
    selectAccountForBankApp(matched || accountItems[0]);

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
  // Muestra la cuenta por defecto en la tarjeta preseleccionada y colapsa el listado completo.
  function selectAccountForBankApp(item) {
    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    accountSelectedDot.className = item.querySelector('.account-dot').className;
    accountSelectedName.textContent = item.querySelector('.account-name').textContent;
    accountSelectedBalance.textContent = item.querySelector('.account-balance').textContent;

    selectedAccount = {
      name: item.querySelector('.account-name').textContent,
      balance: item.getAttribute('data-balance')
    };

    btnAuthorizePayment.disabled = false;
    bankAppAccountList.hidden = true;
  }

  bankAppAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;
    selectAccountForBankApp(item);
  });

  btnChangeAccount.addEventListener('click', function () {
    bankAppAccountList.hidden = !bankAppAccountList.hidden;
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

    // selectedBank NO se resetea: es la cuenta por defecto configurada en el onboarding y persiste entre pagos.
    selectedAccount = null;
    currentInvoice = null;

    screenInvoices.hidden = false;
  });

  // ===================== Marketplace de facturas (vista proveedor) — piloto =====================
  // Ampliación de backlog evaluada en sesión de equipo (ver tareas-b5-factoring.md), construida
  // aquí sin validar aún el flujo operativo real con empresas de factoring.
  const supplierInvoice = { numeroFactura: 'FE-2026-00940', monto: 9200000 };
  const offers = {
    rapida: { nombre: 'Inversión Rápida S.A.S.', descuento: '4.5%', neto: 8786000, plazo: '24 horas' },
    agil: { nombre: 'Capital Ágil Fondos', descuento: '3.8%', neto: 8850400, plazo: '48 horas' },
    factorplus: { nombre: 'FactorPlus Inversiones', descuento: '5.2%', neto: 8721600, plazo: '12 horas' }
  };
  let selectedOffer = null;

  const btnOpenMarketplace = document.getElementById('btnOpenMarketplace');
  const screenSupplierEntry = document.getElementById('screenSupplierEntry');
  const btnBackFromSupplierEntry = document.getElementById('btnBackFromSupplierEntry');
  const btnPublishInvoice = document.getElementById('btnPublishInvoice');

  const screenMarketplaceOffers = document.getElementById('screenMarketplaceOffers');
  const btnBackFromOffers = document.getElementById('btnBackFromOffers');
  const offerList = document.getElementById('offerList');

  const screenOfferConfirm = document.getElementById('screenOfferConfirm');
  const btnBackFromOfferConfirm = document.getElementById('btnBackFromOfferConfirm');
  const offerConfirmName = document.getElementById('offerConfirmName');
  const offerConfirmDescuento = document.getElementById('offerConfirmDescuento');
  const offerConfirmPlazo = document.getElementById('offerConfirmPlazo');
  const offerConfirmNeto = document.getElementById('offerConfirmNeto');
  const offerConfirmCheckbox = document.getElementById('offerConfirmCheckbox');
  const btnConfirmOffer = document.getElementById('btnConfirmOffer');

  const screenMarketplaceDone = document.getElementById('screenMarketplaceDone');
  const marketplaceDoneSub = document.getElementById('marketplaceDoneSub');
  const btnCloseMarketplaceDone = document.getElementById('btnCloseMarketplaceDone');

  btnOpenMarketplace.addEventListener('click', function () {
    screenInvoices.hidden = true;
    screenSupplierEntry.hidden = false;
  });

  btnBackFromSupplierEntry.addEventListener('click', function () {
    screenSupplierEntry.hidden = true;
    screenInvoices.hidden = false;
  });

  btnPublishInvoice.addEventListener('click', function () {
    screenSupplierEntry.hidden = true;
    screenMarketplaceOffers.hidden = false;
  });

  btnBackFromOffers.addEventListener('click', function () {
    screenMarketplaceOffers.hidden = true;
    screenSupplierEntry.hidden = false;
  });

  offerList.addEventListener('click', function (e) {
    const card = e.target.closest('.offer-card');
    if (!card) return;

    selectedOffer = offers[card.getAttribute('data-offer')];

    offerConfirmName.textContent = selectedOffer.nombre;
    offerConfirmDescuento.textContent = '-' + selectedOffer.descuento;
    offerConfirmPlazo.textContent = selectedOffer.plazo;
    offerConfirmNeto.textContent = formatCOP(selectedOffer.neto);
    offerConfirmCheckbox.checked = false;
    btnConfirmOffer.disabled = true;

    screenMarketplaceOffers.hidden = true;
    screenOfferConfirm.hidden = false;
  });

  btnBackFromOfferConfirm.addEventListener('click', function () {
    screenOfferConfirm.hidden = true;
    screenMarketplaceOffers.hidden = false;
  });

  offerConfirmCheckbox.addEventListener('change', function () {
    btnConfirmOffer.disabled = !offerConfirmCheckbox.checked;
  });

  btnConfirmOffer.addEventListener('click', function () {
    screenOfferConfirm.hidden = true;

    marketplaceDoneSub.textContent = 'Factura ' + supplierInvoice.numeroFactura + ' cedida a ' +
      selectedOffer.nombre + '. Recibes ' + formatCOP(selectedOffer.neto) + ' en ' + selectedOffer.plazo + '.';

    screenMarketplaceDone.hidden = false;
  });

  btnCloseMarketplaceDone.addEventListener('click', function () {
    screenMarketplaceDone.hidden = true;
    selectedOffer = null;
    screenInvoices.hidden = false;
  });
})();
