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
  const sheetBankPicker = document.getElementById('sheetBankPicker');
  const btnBackToDetail = document.getElementById('btnBackToDetail');

  const btnPayWhatsapp = document.getElementById('btnPayWhatsapp');
  const btnAuthorize = document.getElementById('btnAuthorize');
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
  const summaryEmpresa = document.getElementById('summaryEmpresa');
  const summaryAmount = document.getElementById('summaryAmount');
  const summaryBeneficiario = document.getElementById('summaryBeneficiario');
  const bankSummaryAccountList = document.getElementById('bankSummaryAccountList');
  const btnAuthorizeBankPayment = document.getElementById('btnAuthorizeBankPayment');

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

  let selectedBank = null;
  let selectedBankKey = null;
  let selectedBankName = null;
  let selectedBankInitials = null;
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
    sheetApproverConfirm.hidden = true;
    sheetAlreadyPaid.hidden = true;
  }

  function applyBankTheme(headerEl, bankKey) {
    headerEl.className = 'bank-app-header theme-' + bankKey;
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

  // Step 1 -> 2: open approval detail sheet
  btnPayWhatsapp.addEventListener('click', function () {
    if (charge.paid) {
      showAlreadyPaid();
      return;
    }
    showOverlay();
    sheetDetail.hidden = false;
  });

  // Step 2 -> 3: continue, switch to corporate account picker sheet
  btnAuthorize.addEventListener('click', function () {
    sheetDetail.hidden = true;
    sheetBankPicker.hidden = false;
  });

  // Account picker -> back to the approval detail sheet
  btnBackToDetail.addEventListener('click', function () {
    sheetBankPicker.hidden = true;
    sheetDetail.hidden = false;
  });

  // Account flow, step 1: choosing a favorite corporate account opens identity verification
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

  // Identity verification -> back to the account picker sheet
  btnBackToBankPicker.addEventListener('click', function () {
    sheetEmailInput.hidden = true;
    sheetBankPicker.hidden = false;
  });

  // Identity verification, step: pick how to authenticate (email, phone or ID)
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

  // Identity verification, step: enable "Iniciar verificación" once the active field looks valid
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

  // Identity verification -> simulated push notification from the bank
  btnStartPayment.addEventListener('click', function () {
    sheetEmailInput.hidden = true;
    hideOverlay();

    pushNotificationIcon.className = 'push-notification-icon dot-' + selectedBankKey;
    pushNotificationIcon.textContent = selectedBankInitials;
    pushNotificationTitle.textContent = selectedBankName;

    screenPushNotification.hidden = false;
  });

  // Tapping the push notification opens the simulated bank app on its biometric check
  pushNotificationCard.addEventListener('click', function () {
    screenPushNotification.hidden = true;
    screenBiometric.hidden = false;
  });

  function finishBankBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    applyBankTheme(summaryScreenHeader, selectedBankKey);
    summaryScreenBankName.textContent = selectedBankName;
    summaryEmpresa.textContent = charge.empresaPagadora;
    summaryAmount.textContent = formatCOP(charge.amount);
    summaryBeneficiario.textContent = charge.beneficiario;

    bankSummaryAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnAuthorizeBankPayment.disabled = true;
    selectedBank = null;

    screenBankSummary.hidden = false;
  }

  // Bank summary, step: account selection right before continuing to the approver confirmation
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

  // Auto-complete biometric after a short simulated delay
  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(finishBankBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  // Bank summary -> continue to the double-check approver confirmation (differentiates B2B from B2C)
  btnAuthorizeBankPayment.addEventListener('click', function () {
    screenBankSummary.hidden = true;
    confirmAmount.textContent = formatCOP(charge.amount);
    confirmEmpresa.textContent = charge.empresaPagadora;
    approverCheckbox.checked = false;
    btnConfirmApproval.disabled = true;
    sheetApproverConfirm.hidden = false;
  });

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
    receiptBankName.textContent = selectedBank ? selectedBank.name : '—';
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
