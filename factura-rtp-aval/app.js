(function () {
  // ===================== Estado de facturas (mock) =====================
  // Esquema mínimo de metadata factura-RTP propuesto por este prototipo:
  // { numeroFactura, concepto, emisor, nit, fechaEmision, fechaVencimiento,
  //   fechaVencimientoISO, monto, referenciaERP, rangoPago, paid }
  const invoices = [
    {
      id: 'inv1',
      numeroFactura: 'FE-2026-00871',
      concepto: 'Suministro de insumos de oficina',
      emisor: 'Distribuidora ABC S.A.S.',
      nit: '900.123.456-7',
      fechaEmision: '10/07/2026',
      fechaVencimiento: '25/07/2026',
      fechaVencimientoISO: '2026-07-25',
      monto: 4850000,
      referenciaERP: 'OC-33021',
      rangoPago: '30',
      paid: false
    },
    {
      id: 'inv2',
      numeroFactura: 'FE-2026-00889',
      concepto: 'Arrendamiento de bodega — julio',
      emisor: 'Inversiones Logísticas del Norte S.A.S.',
      nit: '900.556.789-2',
      fechaEmision: '02/07/2026',
      fechaVencimiento: '05/08/2026',
      fechaVencimientoISO: '2026-08-05',
      monto: 7200000,
      referenciaERP: 'OC-33040',
      rangoPago: '60',
      paid: false
    },
    {
      id: 'inv3',
      numeroFactura: 'FE-2026-00901',
      concepto: 'Licencias de software anual',
      emisor: 'SoftCol Ltda.',
      nit: '900.741.852-9',
      fechaEmision: '15/07/2026',
      fechaVencimiento: '20/09/2026',
      fechaVencimientoISO: '2026-09-20',
      monto: 3100000,
      referenciaERP: 'OC-33055',
      rangoPago: '90',
      paid: false
    },
    {
      id: 'inv4',
      numeroFactura: 'FE-2026-00845',
      concepto: 'Servicio de mantenimiento de equipos',
      emisor: 'TechServ Ltda.',
      nit: '901.987.654-3',
      fechaEmision: '28/06/2026',
      fechaVencimiento: '05/07/2026',
      fechaVencimientoISO: '2026-07-05',
      monto: 1230000,
      referenciaERP: 'OC-32950',
      rangoPago: '30',
      paid: true
    }
  ];

  // Fecha de referencia fija (no `new Date()`) para que el semáforo de vencimiento
  // sea determinístico en la demo en vez de ir cambiando con el tiempo real.
  const TODAY = new Date(2026, 6, 23);

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  function conciliacionId(numeroFactura) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return 'CONC-' + numeroFactura.replace('FE-', '') + '-' + suffix;
  }

  function diasParaVencer(invoice) {
    const due = new Date(invoice.fechaVencimientoISO + 'T00:00:00');
    return Math.round((due - TODAY) / 86400000);
  }

  function semaforo(invoice) {
    const dias = diasParaVencer(invoice);
    if (dias <= 7) return { nivel: 'rojo', texto: dias < 0 ? 'Vencida' : ('Vence en ' + dias + ' días') };
    if (dias <= 20) return { nivel: 'ambar', texto: 'Vence en ' + dias + ' días' };
    return { nivel: 'verde', texto: 'Vence en ' + dias + ' días' };
  }

  // ===================== Referencias a elementos =====================
  const screenInvoices = document.getElementById('screenInvoices');
  const invoicesBody = document.getElementById('invoicesBody');
  const selectionBar = document.getElementById('selectionBar');
  const selectionCount = document.getElementById('selectionCount');
  const selectionTotal = document.getElementById('selectionTotal');
  const btnPaySelected = document.getElementById('btnPaySelected');
  const btnOpenCashflow = document.getElementById('btnOpenCashflow');

  const desktopApp = document.getElementById('desktopApp');
  const desktopAppLogoImg = document.getElementById('desktopAppLogoImg');
  const desktopAppLogoEmoji = document.getElementById('desktopAppLogoEmoji');
  const desktopAppName = document.getElementById('desktopAppName');
  const desktopAppSubtitle = document.getElementById('desktopAppSubtitle');
  const desktopBrowserAddress = document.getElementById('desktopBrowserAddress');
  const btnSwitchDesktopApp = document.getElementById('btnSwitchDesktopApp');

  const desktopViewInvoices = document.getElementById('desktopViewInvoices');
  const desktopInvoiceTable = document.getElementById('desktopInvoiceTable');
  const desktopAppSummary = document.getElementById('desktopAppSummary');
  const desktopSelectionBar = document.getElementById('desktopSelectionBar');
  const desktopSelectionCount = document.getElementById('desktopSelectionCount');
  const desktopSelectionTotal = document.getElementById('desktopSelectionTotal');
  const btnDesktopPaySelected = document.getElementById('btnDesktopPaySelected');
  const btnDesktopOpenCashflow = document.getElementById('btnDesktopOpenCashflow');

  const desktopViewCashflow = document.getElementById('desktopViewCashflow');
  const btnDesktopBackFromCashflow = document.getElementById('btnDesktopBackFromCashflow');
  const desktopCashflowList = document.getElementById('desktopCashflowList');
  const desktopCashflowTotal = document.getElementById('desktopCashflowTotal');

  const desktopViewAuthorize = document.getElementById('desktopViewAuthorize');
  const btnDesktopBackToInvoices = document.getElementById('btnDesktopBackToInvoices');
  const desktopAuthorizeInvoiceList = document.getElementById('desktopAuthorizeInvoiceList');
  const desktopAuthorizeAmount = document.getElementById('desktopAuthorizeAmount');
  const desktopAccountList = document.getElementById('desktopAccountList');
  const btnDesktopAuthorize = document.getElementById('btnDesktopAuthorize');

  const desktopViewConfirm = document.getElementById('desktopViewConfirm');
  const desktopConfirmAmount = document.getElementById('desktopConfirmAmount');
  const desktopConfirmDetail = document.getElementById('desktopConfirmDetail');
  const desktopConfirmAccount = document.getElementById('desktopConfirmAccount');
  const btnDesktopDone = document.getElementById('btnDesktopDone');

  const screenInvoiceDetail = document.getElementById('screenInvoiceDetail');
  const btnBackToInvoices = document.getElementById('btnBackToInvoices');
  const invoiceDetailStatusBadge = document.getElementById('invoiceDetailStatusBadge');
  const detailDueAlert = document.getElementById('detailDueAlert');
  const detailNumeroFactura = document.getElementById('detailNumeroFactura');
  const detailConcepto = document.getElementById('detailConcepto');
  const detailEmisor = document.getElementById('detailEmisor');
  const detailNit = document.getElementById('detailNit');
  const detailFechaEmision = document.getElementById('detailFechaEmision');
  const detailFechaVencimiento = document.getElementById('detailFechaVencimiento');
  const detailReferenciaERP = document.getElementById('detailReferenciaERP');
  const detailMonto = document.getElementById('detailMonto');
  const rangoPagoSelect = document.getElementById('rangoPagoSelect');
  const rangePickerRow = document.getElementById('rangePickerRow');
  const detailSelectRow = document.getElementById('detailSelectRow');
  const detailSelectCheckbox = document.getElementById('detailSelectCheckbox');

  const screenCashflow = document.getElementById('screenCashflow');
  const btnBackFromCashflow = document.getElementById('btnBackFromCashflow');
  const cashflowList = document.getElementById('cashflowList');
  const cashflowTotal = document.getElementById('cashflowTotal');

  const screenIdentityConfirm = document.getElementById('screenIdentityConfirm');
  const btnBackFromIdentity = document.getElementById('btnBackFromIdentity');
  const identitySummary = document.getElementById('identitySummary');
  const btnContinueFromIdentity = document.getElementById('btnContinueFromIdentity');

  const screenBankApp = document.getElementById('screenBankApp');
  const btnCloseBankApp = document.getElementById('btnCloseBankApp');
  const bankAppPaymentView = document.getElementById('bankAppPaymentView');
  const bankAppInvoiceNumber = document.getElementById('bankAppInvoiceNumber');
  const bankAppAmount = document.getElementById('bankAppAmount');
  const bankAppInvoiceList = document.getElementById('bankAppInvoiceList');
  const accountDefaultRow = document.getElementById('accountDefaultRow');
  const accountDefaultItem = document.getElementById('accountDefaultItem');
  const btnFavoriteAccount = document.getElementById('btnFavoriteAccount');
  const btnChangeAccount = document.getElementById('btnChangeAccount');
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
  const reconciliationList = document.getElementById('reconciliationList');
  const btnCloseReconciliation = document.getElementById('btnCloseReconciliation');

  let currentDetailInvoice = null;
  let selectedAccount = { name: 'Cuenta Corriente Principal', balance: '$18.400.000' };
  const selectedIds = new Set();

  // ===================== Paso 1: lista de facturas =====================
  function invoiceCardHTML(invoice) {
    if (invoice.paid) {
      return (
        '<div class="invoice-card invoice-card-paid" data-id="' + invoice.id + '">' +
          '<div class="invoice-card-top">' +
            '<span class="invoice-card-number">Factura ' + invoice.numeroFactura + '</span>' +
            '<span class="invoice-card-badge invoice-card-badge-paid">Conciliada</span>' +
          '</div>' +
          '<div class="invoice-card-concept">' + invoice.concepto + '</div>' +
          '<div class="invoice-card-issuer">Emisor: ' + invoice.emisor + ' · NIT ' + invoice.nit + '</div>' +
          '<div class="invoice-card-row">' +
            '<span class="invoice-card-due">Venció: ' + invoice.fechaVencimiento + '</span>' +
            '<span class="invoice-card-amount">' + formatCOP(invoice.monto) + '</span>' +
          '</div>' +
        '</div>'
      );
    }

    const alerta = semaforo(invoice);
    const checked = selectedIds.has(invoice.id) ? 'checked' : '';

    return (
      '<div class="invoice-card" data-id="' + invoice.id + '">' +
        '<div class="invoice-card-top">' +
          '<label class="invoice-checkbox-label">' +
            '<input type="checkbox" class="invoice-checkbox" data-id="' + invoice.id + '" ' + checked + '>' +
            '<span class="invoice-card-number">Factura ' + invoice.numeroFactura + '</span>' +
          '</label>' +
          '<span class="due-alert due-alert-' + alerta.nivel + '">' + alerta.texto + '</span>' +
        '</div>' +
        '<div class="invoice-card-concept">' + invoice.concepto + '</div>' +
        '<div class="invoice-card-issuer">Emisor: ' + invoice.emisor + ' · NIT ' + invoice.nit + '</div>' +
        '<div class="invoice-card-row">' +
          '<span class="invoice-card-due">Vence: ' + invoice.fechaVencimiento + '</span>' +
          '<span class="invoice-card-amount">' + formatCOP(invoice.monto) + '</span>' +
        '</div>' +
        '<button class="invoice-detail-link" data-id="' + invoice.id + '">Ver detalle →</button>' +
      '</div>'
    );
  }

  function renderInvoiceList() {
    invoicesBody.innerHTML = invoices.map(invoiceCardHTML).join('');
    updateSelectionBar();
  }

  function updateSelectionBar() {
    const total = invoices
      .filter(function (inv) { return selectedIds.has(inv.id); })
      .reduce(function (sum, inv) { return sum + inv.monto; }, 0);

    if (selectedIds.size === 0) {
      selectionBar.hidden = true;
    } else {
      selectionBar.hidden = false;
      selectionCount.textContent = selectedIds.size + (selectedIds.size === 1 ? ' factura seleccionada' : ' facturas seleccionadas');
      selectionTotal.textContent = formatCOP(total);
    }
  }

  // ===================== Vista de escritorio (Banca Empresarial / TESO ACH) =====================
  // Réplica web funcionalmente equivalente al celular, pero sin vínculo entre ambas:
  // son dos canales independientes hacia la misma cuenta empresarial (cada una con su
  // propia selección de facturas y su propio flujo de pago), no una vista espejo.
  let desktopAppMode = 'occidente'; // 'occidente' | 'teso'
  const desktopSelectedIds = new Set();
  let desktopSelectedAccount = null;

  const desktopAccounts = [
    { id: 'corriente', name: 'Cuenta Corriente Principal', balance: '$18.400.000' },
    { id: 'operativa', name: 'Cuenta Operativa', balance: '$6.250.000' }
  ];

  function desktopInvoiceRowHTML(invoice) {
    if (invoice.paid) {
      return (
        '<div class="desktop-invoice-row desktop-invoice-row-paid">' +
          '<span class="desktop-invoice-row-dot"></span>' +
          '<span class="desktop-invoice-row-main">' +
            '<span class="desktop-invoice-row-number">' + invoice.numeroFactura + ' · Conciliada</span>' +
            '<span class="desktop-invoice-row-detail">' + invoice.emisor + '</span>' +
          '</span>' +
          '<span class="desktop-invoice-row-amount">' + formatCOP(invoice.monto) + '</span>' +
        '</div>'
      );
    }

    const alerta = semaforo(invoice);
    const selected = desktopSelectedIds.has(invoice.id);

    return (
      '<label class="desktop-invoice-row' + (selected ? ' desktop-invoice-row-selected' : '') + '">' +
        '<input type="checkbox" class="desktop-invoice-row-checkbox" data-id="' + invoice.id + '" ' + (selected ? 'checked' : '') + '>' +
        '<span class="desktop-invoice-row-main">' +
          '<span class="desktop-invoice-row-number">' + invoice.numeroFactura + '</span>' +
          '<span class="desktop-invoice-row-detail">' + invoice.emisor + ' · ' + alerta.texto + '</span>' +
        '</span>' +
        '<span class="desktop-invoice-row-amount">' + formatCOP(invoice.monto) + '</span>' +
      '</label>'
    );
  }

  function renderDesktopInvoiceList() {
    desktopInvoiceTable.innerHTML = invoices.map(desktopInvoiceRowHTML).join('');
    updateDesktopSelectionBar();
  }

  function updateDesktopSelectionBar() {
    const selected = invoices.filter(function (inv) { return desktopSelectedIds.has(inv.id); });

    if (selected.length === 0) {
      desktopSelectionBar.hidden = true;
      desktopAppSummary.hidden = false;
    } else {
      desktopSelectionBar.hidden = false;
      desktopAppSummary.hidden = true;
      const total = selected.reduce(function (sum, inv) { return sum + inv.monto; }, 0);
      desktopSelectionCount.textContent = selected.length + (selected.length === 1 ? ' factura seleccionada' : ' facturas seleccionadas');
      desktopSelectionTotal.textContent = formatCOP(total);
    }
  }

  desktopInvoiceTable.addEventListener('change', function (e) {
    const checkbox = e.target.closest('.desktop-invoice-row-checkbox');
    if (!checkbox) return;

    const id = checkbox.getAttribute('data-id');
    if (checkbox.checked) desktopSelectedIds.add(id); else desktopSelectedIds.delete(id);
    checkbox.closest('.desktop-invoice-row').classList.toggle('desktop-invoice-row-selected', checkbox.checked);
    updateDesktopSelectionBar();
  });

  function showDesktopView(view) {
    desktopViewInvoices.hidden = view !== 'invoices';
    desktopViewCashflow.hidden = view !== 'cashflow';
    desktopViewAuthorize.hidden = view !== 'authorize';
    desktopViewConfirm.hidden = view !== 'confirm';
  }

  // ===================== Flujo de caja proyectado (propio del panel de escritorio) =====================
  function renderDesktopCashflow() {
    const pendientes = invoices
      .filter(function (inv) { return !inv.paid; })
      .slice()
      .sort(function (a, b) { return a.fechaVencimientoISO.localeCompare(b.fechaVencimientoISO); });

    let acumulado = 0;
    desktopCashflowList.innerHTML = pendientes.map(function (inv) {
      acumulado += inv.monto;
      const alerta = semaforo(inv);
      return (
        '<div class="cashflow-row">' +
          '<div class="cashflow-row-main">' +
            '<span class="cashflow-row-date">' + inv.fechaVencimiento + '</span>' +
            '<span class="due-alert due-alert-' + alerta.nivel + '">' + alerta.texto + '</span>' +
          '</div>' +
          '<div class="cashflow-row-detail">' + inv.numeroFactura + ' · ' + inv.emisor + '</div>' +
          '<div class="cashflow-row-amounts">' +
            '<span>' + formatCOP(inv.monto) + '</span>' +
            '<span class="cashflow-row-accum">Acum: ' + formatCOP(acumulado) + '</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    desktopCashflowTotal.textContent = formatCOP(acumulado);
  }

  btnDesktopOpenCashflow.addEventListener('click', function () {
    renderDesktopCashflow();
    showDesktopView('cashflow');
  });

  btnDesktopBackFromCashflow.addEventListener('click', function () {
    showDesktopView('invoices');
  });

  function desktopAccountItemHTML(account) {
    const selected = desktopSelectedAccount && desktopSelectedAccount.id === account.id;
    return (
      '<button class="desktop-account-item' + (selected ? ' selected' : '') + '" data-id="' + account.id + '">' +
        '<span class="account-dot dot-bank-app"></span>' +
        '<span class="account-info">' +
          '<span class="account-name">' + account.name + '</span>' +
          '<span class="account-balance">Saldo: ' + account.balance + '</span>' +
        '</span>' +
        '<span class="desktop-account-item-check">✔</span>' +
      '</button>'
    );
  }

  function renderDesktopAccountList() {
    desktopAccountList.innerHTML = desktopAccounts.map(desktopAccountItemHTML).join('');
  }

  desktopAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.desktop-account-item');
    if (!item) return;

    const id = item.getAttribute('data-id');
    desktopSelectedAccount = desktopAccounts.find(function (acc) { return acc.id === id; });
    renderDesktopAccountList();
  });

  btnDesktopPaySelected.addEventListener('click', function () {
    const selected = invoices.filter(function (inv) { return desktopSelectedIds.has(inv.id); });
    if (selected.length === 0) return;

    const total = selected.reduce(function (sum, inv) { return sum + inv.monto; }, 0);

    desktopAuthorizeInvoiceList.innerHTML = selected.map(function (inv) {
      return (
        '<div class="desktop-invoice-row desktop-invoice-row-paid">' +
          '<span class="desktop-invoice-row-dot"></span>' +
          '<span class="desktop-invoice-row-main">' +
            '<span class="desktop-invoice-row-number">' + inv.numeroFactura + '</span>' +
            '<span class="desktop-invoice-row-detail">' + inv.emisor + '</span>' +
          '</span>' +
          '<span class="desktop-invoice-row-amount">' + formatCOP(inv.monto) + '</span>' +
        '</div>'
      );
    }).join('');
    desktopAuthorizeAmount.textContent = formatCOP(total);

    desktopSelectedAccount = desktopAccounts[0];
    renderDesktopAccountList();

    showDesktopView('authorize');
  });

  btnDesktopBackToInvoices.addEventListener('click', function () {
    showDesktopView('invoices');
  });

  btnDesktopAuthorize.addEventListener('click', function () {
    if (!desktopSelectedAccount) return;

    const selected = invoices.filter(function (inv) { return desktopSelectedIds.has(inv.id); });
    const total = selected.reduce(function (sum, inv) { return sum + inv.monto; }, 0);

    selected.forEach(function (inv) { inv.paid = true; });

    desktopConfirmAmount.textContent = formatCOP(total);
    desktopConfirmDetail.textContent = selected.length === 1
      ? 'Factura ' + selected[0].numeroFactura
      : selected.length + ' facturas';
    desktopConfirmAccount.textContent = desktopSelectedAccount.name + ' · Saldo: ' + desktopSelectedAccount.balance;

    showDesktopView('confirm');

    // La factura queda conciliada en el backend del emisor sin importar el canal
    // (banca empresarial o TESO ACH) desde el que se autorizó el pago.
    if (!screenInvoices.hidden) renderInvoiceList();
  });

  btnDesktopDone.addEventListener('click', function () {
    desktopSelectedIds.clear();
    desktopSelectedAccount = null;
    renderDesktopInvoiceList();
    showDesktopView('invoices');
  });

  function applyDesktopAppMode() {
    if (desktopAppMode === 'teso') {
      desktopApp.className = 'desktop-app theme-desktop-teso';
      desktopAppLogoImg.hidden = true;
      desktopAppLogoEmoji.hidden = false;
      desktopAppName.textContent = 'TESO ACH';
      desktopAppSubtitle.textContent = 'Portal empresarial · ACH Colombia';
      desktopBrowserAddress.textContent = 'teso.achcolombia.com.co/empresas';
      btnSwitchDesktopApp.textContent = 'Ver en Banco Azul de Occidente →';
    } else {
      desktopApp.className = 'desktop-app theme-desktop-occidente';
      desktopAppLogoImg.hidden = false;
      desktopAppLogoEmoji.hidden = true;
      desktopAppName.textContent = 'Banco Azul de Occidente Empresas';
      desktopAppSubtitle.textContent = 'Banca empresarial en línea';
      desktopBrowserAddress.textContent = 'bancoazuldeoccidente.com/empresas';
      btnSwitchDesktopApp.textContent = 'Ver en TESO ACH →';
    }
  }

  applyDesktopAppMode();
  showDesktopView('invoices');
  renderDesktopInvoiceList();

  btnSwitchDesktopApp.addEventListener('click', function () {
    desktopAppMode = desktopAppMode === 'teso' ? 'occidente' : 'teso';
    applyDesktopAppMode();
  });

  invoicesBody.addEventListener('click', function (e) {
    const checkbox = e.target.closest('.invoice-checkbox');
    if (checkbox) {
      const id = checkbox.getAttribute('data-id');
      if (checkbox.checked) selectedIds.add(id); else selectedIds.delete(id);
      updateSelectionBar();
      return;
    }

    const detailLink = e.target.closest('.invoice-detail-link');
    if (detailLink) {
      const invoice = invoices.find(function (inv) { return inv.id === detailLink.getAttribute('data-id'); });
      if (invoice) openInvoiceDetail(invoice);
    }
  });

  renderInvoiceList();

  // ===================== Paso 2: detalle de factura (solo lectura) =====================
  function openInvoiceDetail(invoice) {
    currentDetailInvoice = invoice;

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
      detailDueAlert.hidden = true;
      rangePickerRow.hidden = true;
      detailSelectRow.hidden = true;
    } else {
      invoiceDetailStatusBadge.textContent = 'RTP embebido';
      const alerta = semaforo(invoice);
      detailDueAlert.hidden = false;
      detailDueAlert.className = 'due-alert due-alert-' + alerta.nivel;
      detailDueAlert.textContent = alerta.texto;
      rangePickerRow.hidden = false;
      rangoPagoSelect.value = invoice.rangoPago;
      detailSelectRow.hidden = false;
      detailSelectCheckbox.checked = selectedIds.has(invoice.id);
    }

    screenInvoices.hidden = true;
    screenInvoiceDetail.hidden = false;
  }

  btnBackToInvoices.addEventListener('click', function () {
    screenInvoiceDetail.hidden = true;
    screenInvoices.hidden = false;
    renderInvoiceList();
  });

  rangoPagoSelect.addEventListener('change', function () {
    if (currentDetailInvoice) currentDetailInvoice.rangoPago = rangoPagoSelect.value;
  });

  detailSelectCheckbox.addEventListener('change', function () {
    if (!currentDetailInvoice) return;
    if (detailSelectCheckbox.checked) selectedIds.add(currentDetailInvoice.id);
    else selectedIds.delete(currentDetailInvoice.id);
  });

  // ===================== Flujo de caja proyectado =====================
  function renderCashflow() {
    const pendientes = invoices
      .filter(function (inv) { return !inv.paid; })
      .slice()
      .sort(function (a, b) { return a.fechaVencimientoISO.localeCompare(b.fechaVencimientoISO); });

    let acumulado = 0;
    cashflowList.innerHTML = pendientes.map(function (inv) {
      acumulado += inv.monto;
      const alerta = semaforo(inv);
      return (
        '<div class="cashflow-row">' +
          '<div class="cashflow-row-main">' +
            '<span class="cashflow-row-date">' + inv.fechaVencimiento + '</span>' +
            '<span class="due-alert due-alert-' + alerta.nivel + '">' + alerta.texto + '</span>' +
          '</div>' +
          '<div class="cashflow-row-detail">' + inv.numeroFactura + ' · ' + inv.emisor + '</div>' +
          '<div class="cashflow-row-amounts">' +
            '<span>' + formatCOP(inv.monto) + '</span>' +
            '<span class="cashflow-row-accum">Acum: ' + formatCOP(acumulado) + '</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    cashflowTotal.textContent = formatCOP(acumulado);
  }

  btnOpenCashflow.addEventListener('click', function () {
    renderCashflow();
    screenInvoices.hidden = true;
    screenCashflow.hidden = false;
  });

  btnBackFromCashflow.addEventListener('click', function () {
    screenCashflow.hidden = true;
    screenInvoices.hidden = false;
  });

  // ===================== Paso 3: confirmar pago (identificación precargada) =====================
  btnPaySelected.addEventListener('click', function () {
    if (selectedIds.size === 0) return;

    const total = invoices
      .filter(function (inv) { return selectedIds.has(inv.id); })
      .reduce(function (sum, inv) { return sum + inv.monto; }, 0);

    identitySummary.textContent = selectedIds.size +
      (selectedIds.size === 1 ? ' factura · ' : ' facturas · ') + formatCOP(total);

    screenInvoices.hidden = true;
    screenIdentityConfirm.hidden = false;
  });

  btnBackFromIdentity.addEventListener('click', function () {
    screenIdentityConfirm.hidden = true;
    screenInvoices.hidden = false;
  });

  btnContinueFromIdentity.addEventListener('click', function () {
    screenIdentityConfirm.hidden = true;
    screenBiometric.hidden = false;
  });

  // ===================== Biometría -> app del banco con metadata de facturas =====================
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    const selected = invoices.filter(function (inv) { return selectedIds.has(inv.id); });
    const total = selected.reduce(function (sum, inv) { return sum + inv.monto; }, 0);

    bankAppInvoiceNumber.textContent = selected.length === 1
      ? 'Factura ' + selected[0].numeroFactura
      : selected.length + ' facturas seleccionadas';
    bankAppAmount.textContent = formatCOP(total);
    bankAppInvoiceList.innerHTML = selected.map(function (inv) {
      return '<span class="bank-app-invoice-chip">' + inv.numeroFactura + ' · ' + formatCOP(inv.monto) + '</span>';
    }).join('');

    accountDefaultRow.hidden = false;
    bankAppAccountList.hidden = true;
    selectedAccount = { name: 'Cuenta Corriente Principal', balance: '$18.400.000' };
    btnAuthorizePayment.disabled = false;

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

  // ===================== Cuenta por defecto + cambiar cuenta =====================
  let accountIsFavorite = false;

  btnFavoriteAccount.addEventListener('click', function (e) {
    e.stopPropagation();
    accountIsFavorite = !accountIsFavorite;
    btnFavoriteAccount.textContent = accountIsFavorite ? '★' : '☆';
    btnFavoriteAccount.title = accountIsFavorite
      ? 'Cuenta favorita para este centro de costo'
      : 'Marcar como favorita para este centro de costo';
  });

  btnChangeAccount.addEventListener('click', function () {
    accountDefaultRow.hidden = true;
    bankAppAccountList.hidden = false;
    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.toggle('selected', el.getAttribute('data-account') === accountDefaultItem.getAttribute('data-account'));
    });
  });

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

    accountDefaultItem.setAttribute('data-account', item.getAttribute('data-account'));
    accountDefaultItem.querySelector('.account-name').textContent = selectedAccount.name;
    accountDefaultItem.querySelector('.account-balance').textContent = 'Saldo: ' + selectedAccount.balance;

    bankAppAccountList.hidden = true;
    accountDefaultRow.hidden = false;
  });

  // ===================== Autorización desde el banco =====================
  btnAuthorizePayment.addEventListener('click', function () {
    const selected = invoices.filter(function (inv) { return selectedIds.has(inv.id); });
    const total = selected.reduce(function (sum, inv) { return sum + inv.monto; }, 0);

    bankAppPaymentView.hidden = true;
    btnAuthorizePayment.hidden = true;

    bankAppConfirmAmount.textContent = formatCOP(total);
    bankAppConfirmConcept.textContent = selected.length === 1
      ? 'Factura ' + selected[0].numeroFactura
      : selected.length + ' facturas';
    bankAppConfirmAccount.textContent = selectedAccount.name + ' · Saldo: ' + selectedAccount.balance;
    bankAppConfirmView.hidden = false;
    btnReturnToMerchant.hidden = false;
  });

  // ===================== Regresar a Banca Empresarial -> conciliación =====================
  btnReturnToMerchant.addEventListener('click', function () {
    screenBankApp.hidden = true;

    const selected = invoices.filter(function (inv) { return selectedIds.has(inv.id); });

    reconciliationList.innerHTML = selected.map(function (inv) {
      inv.paid = true;
      return (
        '<div class="invoice-meta-card">' +
          '<div class="invoice-meta-row"><span>Número de factura</span><span>' + inv.numeroFactura + '</span></div>' +
          '<div class="invoice-meta-row"><span>Monto pagado</span><span>' + formatCOP(inv.monto) + '</span></div>' +
          '<div class="invoice-meta-row"><span>Cuenta origen</span><span>' + selectedAccount.name + '</span></div>' +
          '<div class="invoice-meta-row"><span>Referencia ERP</span><span>' + inv.referenciaERP + '</span></div>' +
          '<div class="invoice-meta-row invoice-meta-row-highlight"><span>ID de conciliación</span><span>' + conciliacionId(inv.numeroFactura) + '</span></div>' +
        '</div>'
      );
    }).join('');

    screenReconciliation.hidden = false;
  });

  // ===================== Cerrar confirmación -> volver a la lista actualizada =====================
  btnCloseReconciliation.addEventListener('click', function () {
    screenReconciliation.hidden = true;
    screenInvoiceDetail.hidden = true;

    selectedIds.clear();
    currentDetailInvoice = null;

    renderInvoiceList();
    screenInvoices.hidden = false;
  });
})();
