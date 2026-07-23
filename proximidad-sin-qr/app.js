(function () {
  // ===================== Shared state =====================
  const charge = {
    amount: 0,
    concept: '',
    paid: false,
    payerIdentifier: '',
    payerAccountLabel: '',
    payerTime: ''
  };

  // Fixed mock contact matched to any celular/alias entered by the tendero.
  // Validating/disambiguating the identifier is out of scope for this prototype.
  const MOCK_PAYER_FULL_NAME = 'Juan Pérez';
  const MOCK_PAYER_MASKED_NAME = 'Juan P.';

  let selectedAccountLabel = null;
  let biometricNext = null;
  let pushTimeoutId = null;

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  function currentTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  // ===================== Tendero elements =====================
  const tScreenLogin = document.getElementById('tScreenLogin');
  const tScreenHome = document.getElementById('tScreenHome');
  const tScreenAmount = document.getElementById('tScreenAmount');
  const tScreenSent = document.getElementById('tScreenSent');
  const tScreenPaid = document.getElementById('tScreenPaid');
  const tScreens = [tScreenLogin, tScreenHome, tScreenAmount, tScreenSent, tScreenPaid];

  const tCedula = document.getElementById('tCedula');
  const tPassword = document.getElementById('tPassword');
  const btnTLogin = document.getElementById('btnTLogin');
  const btnTLogout = document.getElementById('btnTLogout');
  const btnTCobrar = document.getElementById('btnTCobrar');
  const btnTBackToHome = document.getElementById('btnTBackToHome');
  const tAmountInput = document.getElementById('tAmountInput');
  const tConceptInput = document.getElementById('tConceptInput');
  const tPayerIdentifierInput = document.getElementById('tPayerIdentifierInput');
  const btnTEnviarCobro = document.getElementById('btnTEnviarCobro');
  const btnTCancelSent = document.getElementById('btnTCancelSent');
  const btnTNuevoCobro = document.getElementById('btnTNuevoCobro');
  const tSentAmount = document.getElementById('tSentAmount');
  const tSentConcept = document.getElementById('tSentConcept');
  const tSentIdentifier = document.getElementById('tSentIdentifier');
  const tPaidAmount = document.getElementById('tPaidAmount');
  const tPaidPayer = document.getElementById('tPaidPayer');
  const tPaidConcept = document.getElementById('tPaidConcept');
  const tPaidTime = document.getElementById('tPaidTime');

  function showT(screen) {
    tScreens.forEach(function (s) { s.hidden = s !== screen; });
  }

  btnTLogin.addEventListener('click', function () {
    if (!tCedula.value.trim() || !tPassword.value.trim()) return;
    showT(tScreenHome);
  });

  btnTLogout.addEventListener('click', function () {
    tCedula.value = '';
    tPassword.value = '';
    showT(tScreenLogin);
  });

  btnTCobrar.addEventListener('click', function () {
    tAmountInput.value = '';
    tConceptInput.value = '';
    tPayerIdentifierInput.value = '';
    btnTEnviarCobro.disabled = true;
    showT(tScreenAmount);
  });

  btnTBackToHome.addEventListener('click', function () {
    showT(tScreenHome);
  });

  function updateEnviarCobroState() {
    const digits = tAmountInput.value.replace(/\D/g, '');
    const hasAmount = digits && Number(digits) > 0;
    const hasIdentifier = tPayerIdentifierInput.value.trim().length > 0;
    btnTEnviarCobro.disabled = !(hasAmount && hasIdentifier);
  }

  tAmountInput.addEventListener('input', function () {
    const digits = tAmountInput.value.replace(/\D/g, '');
    tAmountInput.value = digits ? Number(digits).toLocaleString('es-CO') : '';
    updateEnviarCobroState();
  });

  tPayerIdentifierInput.addEventListener('input', updateEnviarCobroState);

  btnTEnviarCobro.addEventListener('click', function () {
    const digits = tAmountInput.value.replace(/\D/g, '');
    charge.amount = Number(digits) || 0;
    charge.concept = tConceptInput.value.trim() || 'Cobro ACH';
    charge.payerIdentifier = tPayerIdentifierInput.value.trim();
    charge.paid = false;
    charge.payerAccountLabel = '';
    charge.payerTime = '';

    tSentAmount.textContent = formatCOP(charge.amount);
    tSentConcept.textContent = charge.concept;
    tSentIdentifier.textContent = charge.payerIdentifier;

    resetPayerFlow();
    showT(tScreenSent);

    // Simulate the RTP arriving directly in the client's banking app, with no QR to scan.
    if (pushTimeoutId) clearTimeout(pushTimeoutId);
    pushTimeoutId = setTimeout(triggerClientPush, 1800);
  });

  btnTCancelSent.addEventListener('click', function () {
    if (pushTimeoutId) { clearTimeout(pushTimeoutId); pushTimeoutId = null; }
    showT(tScreenAmount);
  });

  btnTNuevoCobro.addEventListener('click', function () {
    showT(tScreenHome);
  });

  function markTenderoPaid() {
    tPaidAmount.textContent = formatCOP(charge.amount);
    tPaidPayer.textContent = charge.payerAccountLabel || '—';
    tPaidConcept.textContent = charge.concept || '—';
    tPaidTime.textContent = charge.payerTime || currentTime();
    showT(tScreenPaid);
  }

  // ===================== Cliente/pagador elements =====================
  const pScreenIdle = document.getElementById('pScreenIdle');

  const screenPushNotification = document.getElementById('screenPushNotification');
  const pushNotificationCard = document.getElementById('pushNotificationCard');

  const pScreenIdentityConfirm = document.getElementById('pScreenIdentityConfirm');
  const identityConfirmName = document.getElementById('identityConfirmName');
  const identityConfirmIdentifier = document.getElementById('identityConfirmIdentifier');
  const btnIdentityConfirmYes = document.getElementById('btnIdentityConfirmYes');
  const btnIdentityConfirmNo = document.getElementById('btnIdentityConfirmNo');

  const screenBankSummary = document.getElementById('screenBankSummary');
  const pSummaryAmount = document.getElementById('pSummaryAmount');
  const pSummaryConcept = document.getElementById('pSummaryConcept');
  const bankSummaryAccountList = document.getElementById('bankSummaryAccountList');
  const btnAuthorizeBankPayment = document.getElementById('btnAuthorizeBankPayment');

  const screenBiometric = document.getElementById('screenBiometric');
  const fingerprintTap = document.getElementById('fingerprintTap');

  const pScreenSuccess = document.getElementById('pScreenSuccess');
  const pSuccessAmount = document.getElementById('pSuccessAmount');
  const pSuccessAccount = document.getElementById('pSuccessAccount');
  const pSuccessTime = document.getElementById('pSuccessTime');
  const btnPDone = document.getElementById('btnPDone');

  const payerOverlayScreens = [
    screenPushNotification, pScreenIdentityConfirm, screenBankSummary, screenBiometric, pScreenSuccess
  ];

  function hidePayerOverlays() {
    payerOverlayScreens.forEach(function (s) { s.hidden = true; });
  }

  function resetPayerFlow() {
    hidePayerOverlays();
    pScreenIdle.hidden = false;
    selectedAccountLabel = null;
    btnAuthorizeBankPayment.disabled = true;
  }

  // --- Single route: push notification -> identity confirmation -> account -> biometric -> success ---
  function triggerClientPush() {
    if (charge.amount <= 0 || charge.paid) return;
    pScreenIdle.hidden = true;
    screenPushNotification.hidden = false;
  }

  pushNotificationCard.addEventListener('click', function () {
    screenPushNotification.hidden = true;
    identityConfirmName.textContent = MOCK_PAYER_MASKED_NAME;
    identityConfirmIdentifier.textContent = charge.payerIdentifier || '—';
    pScreenIdentityConfirm.hidden = false;
  });

  btnIdentityConfirmYes.addEventListener('click', function () {
    pScreenIdentityConfirm.hidden = true;
    openBankSummary();
  });

  // Rejecting the identity match simply returns to idle; handling a mismatched/ambiguous
  // identifier for real is out of scope for this prototype.
  btnIdentityConfirmNo.addEventListener('click', function () {
    resetPayerFlow();
  });

  function openBankSummary() {
    pSummaryAmount.textContent = formatCOP(charge.amount);
    pSummaryConcept.textContent = charge.concept;
    bankSummaryAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    selectedAccountLabel = null;
    btnAuthorizeBankPayment.disabled = true;
    screenBankSummary.hidden = false;
  }

  bankSummaryAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;
    bankSummaryAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');
    selectedAccountLabel = 'Mi Banco - ' + item.querySelector('.account-name').textContent;
    btnAuthorizeBankPayment.disabled = false;
  });

  btnAuthorizeBankPayment.addEventListener('click', function () {
    screenBankSummary.hidden = true;
    goBiometric(completePayment);
  });

  // --- Shared biometric screen ---
  function goBiometric(nextFn) {
    biometricNext = nextFn;
    screenBiometric.hidden = false;
    setTimeout(finishBiometric, 1500);
  }

  function finishBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;
    const next = biometricNext;
    biometricNext = null;
    if (next) next();
  }

  fingerprintTap.addEventListener('click', finishBiometric);

  // --- Completion ---
  function completePayment() {
    charge.paid = true;
    charge.payerAccountLabel = selectedAccountLabel || 'Mi Banco';
    charge.payerTime = currentTime();

    pSuccessAmount.textContent = formatCOP(charge.amount);
    pSuccessAccount.textContent = charge.payerAccountLabel;
    pSuccessTime.textContent = charge.payerTime;

    hidePayerOverlays();
    pScreenSuccess.hidden = false;

    markTenderoPaid();
  }

  btnPDone.addEventListener('click', function () {
    resetPayerFlow();
  });
})();
