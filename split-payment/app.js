(function () {
  // ===================== Estado del cobro y cuentas (mock) =====================
  const charge = {
    concepto: 'Pago de maquinaria industrial',
    beneficiario: 'Maquinaria Andina S.A.S.',
    referencia: 'OC-44210',
    monto: 32000000
  };

  const accounts = [
    { id: 'principal', name: 'Cuenta Corriente Principal', balance: 18400000, asignado: 0, activa: false },
    { id: 'operativa', name: 'Cuenta Operativa', balance: 9500000, asignado: 0, activa: false },
    { id: 'reserva', name: 'Cuenta de Reserva', balance: 12000000, asignado: 0, activa: false }
  ];

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  // ===================== Referencias a elementos =====================
  const screenCharge = document.getElementById('screenCharge');
  const chargeConcepto = document.getElementById('chargeConcepto');
  const chargeBeneficiario = document.getElementById('chargeBeneficiario');
  const chargeReferencia = document.getElementById('chargeReferencia');
  const chargeMonto = document.getElementById('chargeMonto');
  const mainAccountName = document.getElementById('mainAccountName');
  const mainAccountBalance = document.getElementById('mainAccountBalance');
  const btnSplitAcrossAccounts = document.getElementById('btnSplitAcrossAccounts');

  const screenSplit = document.getElementById('screenSplit');
  const btnBackFromSplit = document.getElementById('btnBackFromSplit');
  const splitAccountList = document.getElementById('splitAccountList');
  const btnAutofillSplit = document.getElementById('btnAutofillSplit');
  const splitTotalCard = document.getElementById('splitTotalCard');
  const splitTotalLabel = document.getElementById('splitTotalLabel');
  const btnContinueFromSplit = document.getElementById('btnContinueFromSplit');

  const screenBiometric = document.getElementById('screenBiometric');
  const fingerprintTap = document.getElementById('fingerprintTap');

  const screenSplitConfirm = document.getElementById('screenSplitConfirm');
  const btnBackFromConfirm = document.getElementById('btnBackFromConfirm');
  const confirmBeneficiario = document.getElementById('confirmBeneficiario');
  const confirmConcepto = document.getElementById('confirmConcepto');
  const splitSummaryList = document.getElementById('splitSummaryList');
  const confirmMonto = document.getElementById('confirmMonto');
  const btnAuthorizeSplitPayment = document.getElementById('btnAuthorizeSplitPayment');

  const screenBeneficiaryConfirm = document.getElementById('screenBeneficiaryConfirm');
  const beneficiaryConfirmBeneficiario = document.getElementById('beneficiaryConfirmBeneficiario');
  const beneficiaryConfirmConcepto = document.getElementById('beneficiaryConfirmConcepto');
  const beneficiaryConfirmMonto = document.getElementById('beneficiaryConfirmMonto');
  const btnCloseSplitPayment = document.getElementById('btnCloseSplitPayment');

  // ===================== Paso 1: cobro entrante =====================
  function renderCharge() {
    chargeConcepto.textContent = charge.concepto;
    chargeBeneficiario.textContent = charge.beneficiario;
    chargeReferencia.textContent = charge.referencia;
    chargeMonto.textContent = formatCOP(charge.monto);
    mainAccountName.textContent = accounts[0].name;
    mainAccountBalance.textContent = formatCOP(accounts[0].balance);
  }
  renderCharge();

  btnSplitAcrossAccounts.addEventListener('click', function () {
    screenCharge.hidden = true;
    screenSplit.hidden = false;
    renderSplitAccounts();
  });

  // ===================== Paso 2: selección de cuentas + distribución de montos =====================
  function asignadoTotal() {
    return accounts.reduce(function (sum, acc) { return sum + (acc.activa ? acc.asignado : 0); }, 0);
  }

  function renderSplitAccounts() {
    splitAccountList.innerHTML = accounts.map(function (acc) {
      return (
        '<div class="split-account-row">' +
          '<label class="split-account-checkbox-label">' +
            '<input type="checkbox" class="split-account-checkbox" data-id="' + acc.id + '" ' + (acc.activa ? 'checked' : '') + '>' +
            '<span class="split-account-name">' + acc.name + '</span>' +
          '</label>' +
          '<span class="split-account-balance">Saldo: ' + formatCOP(acc.balance) + '</span>' +
          '<input type="number" class="split-account-input" data-id="' + acc.id + '" placeholder="$0" min="0" ' +
            'value="' + (acc.asignado || '') + '" ' + (acc.activa ? '' : 'disabled') + '>' +
        '</div>'
      );
    }).join('');

    updateSplitTotal();
  }

  function updateSplitTotal() {
    const total = asignadoTotal();
    const restante = charge.monto - total;

    splitTotalLabel.textContent = 'Asignado: ' + formatCOP(total) + ' de ' + formatCOP(charge.monto);

    if (restante === 0 && accounts.some(function (a) { return a.activa; })) {
      splitTotalCard.className = 'split-total-card split-total-ok';
      btnContinueFromSplit.disabled = false;
    } else {
      splitTotalCard.className = 'split-total-card';
      btnContinueFromSplit.disabled = true;
    }
  }

  splitAccountList.addEventListener('change', function (e) {
    const checkbox = e.target.closest('.split-account-checkbox');
    if (checkbox) {
      const acc = accounts.find(function (a) { return a.id === checkbox.getAttribute('data-id'); });
      acc.activa = checkbox.checked;
      if (!acc.activa) acc.asignado = 0;
      renderSplitAccounts();
      return;
    }

    const input = e.target.closest('.split-account-input');
    if (input) {
      const acc = accounts.find(function (a) { return a.id === input.getAttribute('data-id'); });
      acc.asignado = Math.max(0, Math.min(acc.balance, Number(input.value) || 0));
      updateSplitTotal();
    }
  });

  // Reparte el monto pendiente entre las cuentas activas (o todas, si ninguna está activa
  // todavía) respetando el saldo disponible de cada una, hasta cubrir el total exacto.
  btnAutofillSplit.addEventListener('click', function () {
    accounts.forEach(function (acc) { acc.activa = true; acc.asignado = 0; });

    let restante = charge.monto;
    accounts.forEach(function (acc) {
      const aporte = Math.min(acc.balance, restante);
      acc.asignado = aporte;
      restante -= aporte;
    });

    renderSplitAccounts();
  });

  btnBackFromSplit.addEventListener('click', function () {
    screenSplit.hidden = true;
    screenCharge.hidden = false;
  });

  btnContinueFromSplit.addEventListener('click', function () {
    screenSplit.hidden = true;
    screenBiometric.hidden = false;
  });

  // ===================== Biometría -> confirmación única con detalle del split =====================
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    confirmBeneficiario.textContent = charge.beneficiario;
    confirmConcepto.textContent = charge.concepto;
    confirmMonto.textContent = formatCOP(charge.monto);

    splitSummaryList.innerHTML = accounts
      .filter(function (acc) { return acc.activa && acc.asignado > 0; })
      .map(function (acc) {
        return (
          '<div class="split-summary-row">' +
            '<span>' + acc.name + '</span>' +
            '<span>' + formatCOP(acc.asignado) + '</span>' +
          '</div>'
        );
      }).join('');

    screenSplitConfirm.hidden = false;
  }

  fingerprintTap.addEventListener('click', completeBiometric);

  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(completeBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  btnBackFromConfirm.addEventListener('click', function () {
    screenSplitConfirm.hidden = true;
    screenSplit.hidden = false;
  });

  // ===================== Autorización -> confirmación al beneficiario (sin detalle del split) =====================
  btnAuthorizeSplitPayment.addEventListener('click', function () {
    screenSplitConfirm.hidden = true;

    beneficiaryConfirmBeneficiario.textContent = charge.beneficiario;
    beneficiaryConfirmConcepto.textContent = charge.concepto;
    beneficiaryConfirmMonto.textContent = formatCOP(charge.monto);

    screenBeneficiaryConfirm.hidden = false;
  });

  btnCloseSplitPayment.addEventListener('click', function () {
    screenBeneficiaryConfirm.hidden = true;

    accounts.forEach(function (acc) { acc.activa = false; acc.asignado = 0; });

    screenCharge.hidden = false;
  });
})();
