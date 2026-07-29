(function () {
  // ===================== Shared state (pago con doble aprobación) =====================
  // Los 2 celulares (uno por aprobador) y la vista de escritorio leen y escriben sobre este
  // mismo objeto, así que firmar desde un celular se refleja de inmediato en el otro celular
  // y en la banca empresarial, sin necesidad de recargar nada.
  const payment = {
    amount: 32500000,
    empresaPagadora: 'Constructora Meridiano S.A.S.',
    beneficiario: 'Aceros del Norte S.A.S.',
    centroCosto: 'Obra Torre Central — Compras',
    concepto: 'Anticipo suministro de estructura metálica',
    numeroFactura: 'OC-2026-4471',
    approvers: [
      { name: 'Marta Gómez', role: 'Gerente Financiera', approved: false, approvedAt: null },
      { name: 'Diego Ramírez', role: 'Director de Operaciones', approved: false, approvedAt: null }
    ]
  };

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  function currentTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  function approvedCount() {
    return payment.approvers.filter(function (a) { return a.approved; }).length;
  }

  function isFullyApproved() {
    return approvedCount() === payment.approvers.length;
  }

  const phoneControllers = [];

  // ===================== Fábrica de controlador: un celular = un aprobador =====================
  // suffix: '1' o '2', usado para resolver los IDs duplicados de cada celular.
  // approverIndex: posición en payment.approvers que este celular representa.
  function createPhoneController(suffix, approverIndex) {
    const el = function (id) { return document.getElementById(id + suffix); };

    const overlayBackdrop = el('overlayBackdrop');
    const alertBubble = el('alertBubble');
    const bubbleAmount = el('bubbleAmount');
    const bubbleBeneficiario = el('bubbleBeneficiario');
    const bubbleOtherApproverNote = el('bubbleOtherApproverNote');
    const btnPayWhatsapp = el('btnPayWhatsapp');

    const receiptBubble = el('receiptBubble');
    const receiptPreviewIcon = el('receiptPreviewIcon');
    const receiptAmountText = el('receiptAmountText');
    const receiptStatusNote = el('receiptStatusNote');
    const receiptTime = el('receiptTime');
    const btnViewReceipt = el('btnViewReceipt');

    const sheetDetail = el('sheetDetail');
    const detailEmpresa = el('detailEmpresa');
    const detailCentroCosto = el('detailCentroCosto');
    const detailBeneficiario = el('detailBeneficiario');
    const detailConcepto = el('detailConcepto');
    const detailApproversList = el('detailApproversList');
    const detailAmount = el('detailAmount');
    const btnAuthorize = el('btnAuthorize');

    const accountDefaultRow = el('accountDefaultRow');
    const accountDefaultItem = el('accountDefaultItem');
    const btnChangeAccount = el('btnChangeAccount');
    const bankSummaryAccountList = el('bankSummaryAccountList');

    const screenBiometric = el('screenBiometric');
    const fingerprintTap = el('fingerprintTap');

    const sheetApproverConfirm = el('sheetApproverConfirm');
    const confirmAmount = el('confirmAmount');
    const confirmText = el('confirmText');
    const approverCheckbox = el('approverCheckbox');
    const btnConfirmApproval = el('btnConfirmApproval');

    const sheetAlreadyPaid = el('sheetAlreadyPaid');
    const btnCloseAlreadyPaid = el('btnCloseAlreadyPaid');

    const sheetReceipt = el('sheetReceipt');
    const receiptEmpresa = el('receiptEmpresa');
    const receiptCentroCosto = el('receiptCentroCosto');
    const receiptBeneficiario = el('receiptBeneficiario');
    const receiptFirmante = el('receiptFirmante');
    const receiptBankName = el('receiptBankName');
    const receiptDate = el('receiptDate');
    const receiptDetailAmount = el('receiptDetailAmount');
    const receiptApprovalStatus = el('receiptApprovalStatus');
    const btnCloseReceipt = el('btnCloseReceipt');

    let selectedAccount = { name: 'Cuenta Operativa', balance: '$142.300.000' };

    function showOverlay() { overlayBackdrop.hidden = false; }
    function hideOverlay() { overlayBackdrop.hidden = true; }

    function hideAllSheets() {
      sheetDetail.hidden = true;
      sheetReceipt.hidden = true;
      screenBiometric.hidden = true;
      sheetApproverConfirm.hidden = true;
      sheetAlreadyPaid.hidden = true;
    }

    function approver() { return payment.approvers[approverIndex]; }
    function other() { return payment.approvers[1 - approverIndex]; }

    // Refresca este celular con el estado actual del pago (llamado al inicio y tras cualquier firma).
    function render() {
      bubbleAmount.textContent = formatCOP(payment.amount);
      bubbleBeneficiario.textContent = payment.beneficiario;

      if (approver().approved) {
        alertBubble.hidden = true;
        receiptBubble.hidden = false;

        receiptAmountText.textContent = formatCOP(payment.amount);
        receiptTime.textContent = approver().approvedAt || currentTime();
        receiptPreviewIcon.textContent = isFullyApproved() ? '✅' : '⏳';
        receiptStatusNote.textContent = isFullyApproved()
          ? '✅ Pago totalmente aprobado — ambas firmas registradas.'
          : '⏳ Falta la firma de ' + other().name + ' para liberar el pago.';
      } else {
        receiptBubble.hidden = true;
        alertBubble.hidden = false;

        if (other().approved) {
          bubbleOtherApproverNote.hidden = false;
          bubbleOtherApproverNote.textContent = other().name + ' ya registró su firma ✔ · Falta la tuya para liberar el pago.';
        } else {
          bubbleOtherApproverNote.hidden = true;
        }
      }

      hideAllSheets();
      hideOverlay();
    }

    // Step 1 -> 2: abrir el detalle del pago (con checklist de firmas ya registradas)
    btnPayWhatsapp.addEventListener('click', function () {
      if (approver().approved) {
        showOverlay();
        sheetAlreadyPaid.hidden = false;
        return;
      }

      detailEmpresa.textContent = payment.empresaPagadora;
      detailCentroCosto.textContent = payment.centroCosto;
      detailBeneficiario.textContent = payment.beneficiario;
      detailConcepto.textContent = payment.concepto;
      detailAmount.textContent = formatCOP(payment.amount);

      detailApproversList.innerHTML = '';
      payment.approvers.forEach(function (a, i) {
        const row = document.createElement('div');
        row.className = 'approvers-checklist-row' + (a.approved ? ' approvers-checklist-row-approved' : '');
        row.innerHTML =
          '<span>' + a.name + (i === approverIndex ? ' (tú)' : '') + ' · ' + a.role + '</span>' +
          '<span>' + (a.approved ? '✔ Aprobado' : '⏳ Pendiente') + '</span>';
        detailApproversList.appendChild(row);
      });

      showOverlay();
      accountDefaultRow.hidden = false;
      bankSummaryAccountList.hidden = true;
      sheetDetail.hidden = false;
    });

    // Cuenta por defecto -> "cambiar cuenta" revela las demás cuentas empresariales
    btnChangeAccount.addEventListener('click', function () {
      accountDefaultRow.hidden = true;
      bankSummaryAccountList.hidden = false;
      bankSummaryAccountList.querySelectorAll('.account-item').forEach(function (el) {
        el.classList.toggle('selected', el.getAttribute('data-account') === accountDefaultItem.getAttribute('data-account'));
      });
    });

    bankSummaryAccountList.addEventListener('click', function (e) {
      const item = e.target.closest('.account-item');
      if (!item) return;

      selectedAccount = {
        name: item.querySelector('.account-name').textContent,
        balance: item.getAttribute('data-balance')
      };

      accountDefaultItem.setAttribute('data-account', item.getAttribute('data-account'));
      accountDefaultItem.querySelector('.account-name').textContent = selectedAccount.name;
      accountDefaultItem.querySelector('.account-balance').textContent = 'Saldo: ' + selectedAccount.balance;

      bankSummaryAccountList.hidden = true;
      accountDefaultRow.hidden = false;
    });

    // Step 2 -> 3: continuar con la firma -> biometría
    btnAuthorize.addEventListener('click', function () {
      sheetDetail.hidden = true;
      hideOverlay();
      screenBiometric.hidden = false;
    });

    function finishBiometric() {
      if (screenBiometric.hidden) return;
      screenBiometric.hidden = true;

      // El texto de confirmación cambia si esta firma es la que libera el pago (segunda de dos).
      const willBeFinal = approvedCount() === payment.approvers.length - 1;

      showOverlay();
      confirmAmount.textContent = formatCOP(payment.amount);
      confirmText.innerHTML = willBeFinal
        ? 'Estás a punto de registrar tu firma en un pago por <strong>' + formatCOP(payment.amount) + '</strong> en nombre de ' +
          '<strong>' + payment.empresaPagadora + '</strong>. Con tu firma, el pago queda totalmente aprobado y se programará para pago.'
        : 'Estás a punto de registrar tu firma en un pago por <strong>' + formatCOP(payment.amount) + '</strong> en nombre de ' +
          '<strong>' + payment.empresaPagadora + '</strong>. Aún faltará la firma de ' + other().name + ' para liberar el pago.';
      approverCheckbox.checked = false;
      btnConfirmApproval.disabled = true;
      sheetApproverConfirm.hidden = false;
    }

    fingerprintTap.addEventListener('click', finishBiometric);

    // Auto-complete biometric after a short simulated delay
    const biometricObserver = new MutationObserver(function () {
      if (!screenBiometric.hidden) {
        setTimeout(finishBiometric, 1500);
      }
    });
    biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

    approverCheckbox.addEventListener('change', function () {
      btnConfirmApproval.disabled = !approverCheckbox.checked;
    });

    // Confirmación del firmante -> registra la firma y refresca ambos celulares + escritorio
    btnConfirmApproval.addEventListener('click', function () {
      sheetApproverConfirm.hidden = true;
      hideOverlay();

      approver().approved = true;
      approver().approvedAt = currentTime();

      renderAll();
    });

    btnViewReceipt.addEventListener('click', function () {
      receiptEmpresa.textContent = payment.empresaPagadora;
      receiptCentroCosto.textContent = payment.centroCosto;
      receiptBeneficiario.textContent = payment.beneficiario;
      receiptFirmante.textContent = approver().name + ' (' + approver().role + ')';
      receiptBankName.textContent = selectedAccount.name + ' · Saldo: ' + selectedAccount.balance;
      receiptDetailAmount.textContent = formatCOP(payment.amount);
      receiptDate.textContent = new Date().toLocaleString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      receiptApprovalStatus.textContent = isFullyApproved()
        ? '✅ Pago totalmente aprobado — ambas firmas registradas.'
        : '⏳ Falta la firma de ' + other().name + '.';

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

    return { render: render };
  }

  // ===================== Vista de escritorio: banca empresarial (siempre refleja el estado global) =====================
  const desktopStatusBadge = document.getElementById('desktopStatusBadge');
  const desktopAmount = document.getElementById('desktopAmount');
  const desktopBeneficiario = document.getElementById('desktopBeneficiario');
  const desktopConcept = document.getElementById('desktopConcept');
  const desktopMeta = document.getElementById('desktopMeta');
  const desktopApprovedCount = document.getElementById('desktopApprovedCount');
  const desktopApproversList = document.getElementById('desktopApproversList');
  const desktopApprovedBanner = document.getElementById('desktopApprovedBanner');

  function renderDesktop() {
    const count = approvedCount();
    const full = isFullyApproved();

    desktopAmount.textContent = formatCOP(payment.amount);
    desktopBeneficiario.textContent = payment.beneficiario;
    desktopConcept.textContent = payment.concepto + ' · ' + payment.numeroFactura;
    desktopMeta.textContent = 'Centro de costo: ' + payment.centroCosto;
    desktopApprovedCount.textContent = String(count);

    desktopStatusBadge.textContent = full ? 'Aprobado y programado' : (count > 0 ? 'Falta 1 firma' : 'Pendiente de aprobación');
    desktopStatusBadge.className = 'desktop-payment-status-badge ' +
      (full ? 'desktop-payment-status-badge-approved' : 'desktop-payment-status-badge-pending');

    desktopApproversList.innerHTML = '';
    payment.approvers.forEach(function (a) {
      const row = document.createElement('div');
      row.className = 'desktop-approver-row' + (a.approved ? ' desktop-approver-row-approved' : '');
      row.innerHTML =
        '<span class="desktop-approver-avatar">' + a.name.charAt(0) + '</span>' +
        '<span class="desktop-approver-info">' +
          '<span class="desktop-approver-name">' + a.name + '</span>' +
          '<span class="desktop-approver-role">' + a.role + '</span>' +
        '</span>' +
        '<span class="desktop-approver-status">' + (a.approved ? '✔ Firmó · ' + a.approvedAt : '⏳ Pendiente') + '</span>';
      desktopApproversList.appendChild(row);
    });

    desktopApprovedBanner.hidden = !full;
  }

  function renderAll() {
    phoneControllers.forEach(function (c) { c.render(); });
    renderDesktop();
  }

  phoneControllers.push(createPhoneController('1', 0));
  phoneControllers.push(createPhoneController('2', 1));

  renderAll();
})();
