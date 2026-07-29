(function () {
  // ===================== Shared state (aprobación corporativa) =====================
  const charge = {
    amount: 8450000,
    empresaPagadora: 'Distribuidora ANDES S.A.S.',
    beneficiario: 'Proveedores Insumos del Valle SAS',
    centroCosto: 'Logística — Bodega Central',
    aprobador: 'Roberto Salazar (Gerente Financiero)',
    paid: false
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

  // ===================== Elements =====================
  const chatBody = document.getElementById('chatBody');
  const overlayBackdrop = document.getElementById('overlayBackdrop');

  const sheetDetail = document.getElementById('sheetDetail');
  const detailEmpresa = document.getElementById('detailEmpresa');
  const detailCentroCosto = document.getElementById('detailCentroCosto');
  const detailBeneficiario = document.getElementById('detailBeneficiario');
  const detailAprobador = document.getElementById('detailAprobador');
  const detailAmount = document.getElementById('detailAmount');

  const sheetReceipt = document.getElementById('sheetReceipt');
  const screenBiometric = document.getElementById('screenBiometric');
  const fingerprintTap = document.getElementById('fingerprintTap');

  const btnPayWhatsapp = document.getElementById('btnPayWhatsapp');
  const btnAuthorize = document.getElementById('btnAuthorize');
  const btnViewReceipt = document.getElementById('btnViewReceipt');
  const btnCloseReceipt = document.getElementById('btnCloseReceipt');

  const accountDefaultRow = document.getElementById('accountDefaultRow');
  const accountDefaultItem = document.getElementById('accountDefaultItem');
  const btnFavoriteAccount = document.getElementById('btnFavoriteAccount');
  const btnChangeAccount = document.getElementById('btnChangeAccount');
  const bankSummaryAccountList = document.getElementById('bankSummaryAccountList');

  const sheetApproverConfirm = document.getElementById('sheetApproverConfirm');
  const confirmAmount = document.getElementById('confirmAmount');
  const confirmEmpresa = document.getElementById('confirmEmpresa');
  const approverCheckbox = document.getElementById('approverCheckbox');
  const btnConfirmApproval = document.getElementById('btnConfirmApproval');

  const sheetAlreadyPaid = document.getElementById('sheetAlreadyPaid');
  const alreadyPaidAmount = document.getElementById('alreadyPaidAmount');
  const btnCloseAlreadyPaid = document.getElementById('btnCloseAlreadyPaid');

  const receiptBubble = document.getElementById('receiptBubble');
  const receiptAmountText = document.getElementById('receiptAmountText');
  const receiptTime = document.getElementById('receiptTime');
  const receiptEmpresa = document.getElementById('receiptEmpresa');
  const receiptCentroCosto = document.getElementById('receiptCentroCosto');
  const receiptBeneficiario = document.getElementById('receiptBeneficiario');
  const receiptAprobador = document.getElementById('receiptAprobador');
  const receiptBankName = document.getElementById('receiptBankName');
  const receiptDate = document.getElementById('receiptDate');
  const receiptDetailAmount = document.getElementById('receiptDetailAmount');

  let selectedAccount = { name: 'Cuenta Operativa', balance: '$142.300.000' };
  let accountIsFavorite = false;

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
    sheetApproverConfirm.hidden = true;
    sheetAlreadyPaid.hidden = true;
  }

  function showAlreadyPaid() {
    showOverlay();
    sheetAlreadyPaid.hidden = false;
  }

  // Initial render of the fixed charge context (populates detail/summary/receipt fields)
  function renderChargeContext() {
    detailEmpresa.textContent = charge.empresaPagadora;
    detailCentroCosto.textContent = charge.centroCosto;
    detailBeneficiario.textContent = charge.beneficiario;
    detailAprobador.textContent = charge.aprobador;
    detailAmount.textContent = formatCOP(charge.amount);
    alreadyPaidAmount.textContent = formatCOP(charge.amount);
  }
  renderChargeContext();

  // Step 1 -> 2: open approval detail sheet (ya sabemos quién es el aprobador y su cuenta,
  // así que el sheet muestra directamente revisión + cuenta por defecto, sin selección de
  // banco/correo/celular)
  btnPayWhatsapp.addEventListener('click', function () {
    if (charge.paid) {
      showAlreadyPaid();
      return;
    }
    showOverlay();
    accountDefaultRow.hidden = false;
    bankSummaryAccountList.hidden = true;
    sheetDetail.hidden = false;
  });

  // Cuenta por defecto: "cambiar cuenta" revela las demás cuentas empresariales
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

  // Step 2 -> 3: continue straight to biometric (revisión + aprobación, sin pasos intermedios)
  btnAuthorize.addEventListener('click', function () {
    sheetDetail.hidden = true;
    hideOverlay();
    screenBiometric.hidden = false;
  });

  function finishBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    showOverlay();
    confirmAmount.textContent = formatCOP(charge.amount);
    confirmEmpresa.textContent = charge.empresaPagadora;
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

  // Approver confirmation -> finalize, return to WhatsApp with the "aprobación registrada" receipt
  btnConfirmApproval.addEventListener('click', function () {
    sheetApproverConfirm.hidden = true;
    hideAllSheets();
    hideOverlay();
    charge.paid = true;

    receiptBubble.hidden = false;
    receiptAmountText.textContent = formatCOP(charge.amount);
    receiptTime.textContent = currentTime();
    receiptEmpresa.textContent = charge.empresaPagadora;
    receiptCentroCosto.textContent = charge.centroCosto;
    receiptBeneficiario.textContent = charge.beneficiario;
    receiptAprobador.textContent = charge.aprobador;
    receiptBankName.textContent = selectedAccount.name + ' · Saldo: ' + selectedAccount.balance;
    receiptDetailAmount.textContent = formatCOP(charge.amount);
    receiptDate.textContent = new Date().toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    chatBody.scrollTop = chatBody.scrollHeight;
  });

  // Step: view "aprobación registrada" detail
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
})();
