(function () {
  // ===================== Shared state =====================
  const charge = { amount: 0, concept: '', paid: false, payerAccountLabel: '', payerTime: '' };

  let selectedBankKey = null;
  let selectedBankName = null;
  let selectedBankInitials = null;
  let authMethod = 'email';
  let selectedAccountLabel = null;
  let summaryFlow = 'camera'; // 'camera' | 'bankapp'
  let biometricNext = null;
  let cameraTimeoutId = null;
  let qrRefreshIntervalId = null;

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
  const tScreenQR = document.getElementById('tScreenQR');
  const tScreenPaid = document.getElementById('tScreenPaid');
  const tScreens = [tScreenLogin, tScreenHome, tScreenAmount, tScreenQR, tScreenPaid];

  const tCedula = document.getElementById('tCedula');
  const tPassword = document.getElementById('tPassword');
  const btnTLogin = document.getElementById('btnTLogin');
  const btnTLogout = document.getElementById('btnTLogout');
  const btnTCobrar = document.getElementById('btnTCobrar');
  const btnTBackToHome = document.getElementById('btnTBackToHome');
  const tAmountInput = document.getElementById('tAmountInput');
  const tConceptInput = document.getElementById('tConceptInput');
  const btnTGenerarQR = document.getElementById('btnTGenerarQR');
  const btnTCancelQR = document.getElementById('btnTCancelQR');
  const btnTNuevoCobro = document.getElementById('btnTNuevoCobro');
  const tQrAmount = document.getElementById('tQrAmount');
  const tQrConcept = document.getElementById('tQrConcept');
  const tQrCanvas = document.getElementById('tQrCanvas');
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
    btnTGenerarQR.disabled = true;
    showT(tScreenAmount);
  });

  btnTBackToHome.addEventListener('click', function () {
    showT(tScreenHome);
  });

  tAmountInput.addEventListener('input', function () {
    const digits = tAmountInput.value.replace(/\D/g, '');
    tAmountInput.value = digits ? Number(digits).toLocaleString('es-CO') : '';
    btnTGenerarQR.disabled = !digits || Number(digits) <= 0;
  });

  btnTGenerarQR.addEventListener('click', function () {
    const digits = tAmountInput.value.replace(/\D/g, '');
    charge.amount = Number(digits) || 0;
    charge.concept = tConceptInput.value.trim() || 'Cobro ACH';
    charge.paid = false;
    charge.payerAccountLabel = '';
    charge.payerTime = '';

    tQrAmount.textContent = formatCOP(charge.amount);
    tQrConcept.textContent = charge.concept;
    renderQR();

    if (qrRefreshIntervalId) clearInterval(qrRefreshIntervalId);
    qrRefreshIntervalId = setInterval(renderQR, 60000);

    resetPayerFlow();
    showT(tScreenQR);
  });

  btnTCancelQR.addEventListener('click', function () {
    if (qrRefreshIntervalId) clearInterval(qrRefreshIntervalId);
    showT(tScreenAmount);
  });

  btnTNuevoCobro.addEventListener('click', function () {
    showT(tScreenHome);
  });

  function markTenderoPaid() {
    if (qrRefreshIntervalId) clearInterval(qrRefreshIntervalId);
    tPaidAmount.textContent = formatCOP(charge.amount);
    tPaidPayer.textContent = charge.payerAccountLabel || '—';
    tPaidConcept.textContent = charge.concept || '—';
    tPaidTime.textContent = charge.payerTime || currentTime();
    showT(tScreenPaid);
  }

  // ===================== Fake dynamic QR renderer =====================
  function seededRandom(seed) {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }

  function renderQR() {
    const seed = charge.amount + '|' + charge.concept + '|' + Date.now();
    const rand = seededRandom(seed);
    const ctx = tQrCanvas.getContext('2d');
    const size = tQrCanvas.width;
    const cells = 21;
    const cell = size / cells;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#1a1a1a';

    function drawMarker(cx, cy) {
      ctx.fillRect(cx * cell, cy * cell, cell * 7, cell * 7);
      ctx.fillStyle = '#fff';
      ctx.fillRect((cx + 1) * cell, (cy + 1) * cell, cell * 5, cell * 5);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect((cx + 2) * cell, (cy + 2) * cell, cell * 3, cell * 3);
    }

    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const inTopLeft = x < 7 && y < 7;
        const inTopRight = x >= cells - 7 && y < 7;
        const inBottomLeft = x < 7 && y >= cells - 7;
        if (inTopLeft || inTopRight || inBottomLeft) continue;
        if (rand() > 0.55) {
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }

    drawMarker(0, 0);
    drawMarker(cells - 7, 0);
    drawMarker(0, cells - 7);

    ctx.fillStyle = '#fff';
    ctx.fillRect(size / 2 - 16, size / 2 - 16, 32, 32);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ach', size / 2, size / 2);
  }

  // ===================== Payer elements =====================
  const pScreenIdle = document.getElementById('pScreenIdle');
  const btnPScanCamera = document.getElementById('btnPScanCamera');
  const btnPScanBankApp = document.getElementById('btnPScanBankApp');

  const pScreenCamera = document.getElementById('pScreenCamera');
  const btnPCameraBack = document.getElementById('btnPCameraBack');

  const pScreenBankPicker = document.getElementById('pScreenBankPicker');
  const btnPBackToIdle = document.getElementById('btnPBackToIdle');
  const pPortalAmount = document.getElementById('pPortalAmount');
  const bankFavorites = document.getElementById('bankFavorites');

  const pScreenIdentity = document.getElementById('pScreenIdentity');
  const btnPBackToBankPicker = document.getElementById('btnPBackToBankPicker');
  const identityBankName = document.getElementById('identityBankName');
  const authMethodList = document.getElementById('authMethodList');
  const authFieldEmail = document.getElementById('authFieldEmail');
  const authFieldPhone = document.getElementById('authFieldPhone');
  const authFieldId = document.getElementById('authFieldId');
  const identityEmailInput = document.getElementById('identityEmailInput');
  const identityPhoneInput = document.getElementById('identityPhoneInput');
  const identityIdTypeSelect = document.getElementById('identityIdTypeSelect');
  const identityIdNumberInput = document.getElementById('identityIdNumberInput');
  const btnPStartPayment = document.getElementById('btnPStartPayment');

  const screenPushNotification = document.getElementById('screenPushNotification');
  const pushNotificationCard = document.getElementById('pushNotificationCard');
  const pushNotificationIcon = document.getElementById('pushNotificationIcon');
  const pushNotificationTitle = document.getElementById('pushNotificationTitle');

  const pScreenBankAppHome = document.getElementById('pScreenBankAppHome');
  const btnPBankAppScan = document.getElementById('btnPBankAppScan');
  const pScreenBankAppCamera = document.getElementById('pScreenBankAppCamera');
  const btnPBankCameraBack = document.getElementById('btnPBankCameraBack');

  const screenBankSummary = document.getElementById('screenBankSummary');
  const summaryScreenHeader = document.getElementById('summaryScreenHeader');
  const summaryScreenBankName = document.getElementById('summaryScreenBankName');
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
    pScreenCamera, pScreenBankPicker, pScreenIdentity, screenPushNotification,
    pScreenBankAppHome, pScreenBankAppCamera, screenBankSummary, screenBiometric, pScreenSuccess
  ];

  function hidePayerOverlays() {
    payerOverlayScreens.forEach(function (s) { s.hidden = true; });
  }

  function resetPayerFlow() {
    if (cameraTimeoutId) { clearTimeout(cameraTimeoutId); cameraTimeoutId = null; }
    hidePayerOverlays();
    pScreenIdle.hidden = false;
    selectedBankKey = null;
    selectedBankName = null;
    selectedBankInitials = null;
    selectedAccountLabel = null;
    btnAuthorizeBankPayment.disabled = true;
  }

  function applyBankTheme(headerEl, bankKey) {
    headerEl.className = 'bank-app-header theme-' + bankKey;
  }

  // --- Entry point: choose scanning channel ---
  btnPScanCamera.addEventListener('click', function () {
    if (charge.amount <= 0 || charge.paid) return;
    pScreenIdle.hidden = true;
    pScreenCamera.hidden = false;
    cameraTimeoutId = setTimeout(function () {
      pScreenCamera.hidden = true;
      pPortalAmount.textContent = formatCOP(charge.amount);
      pScreenBankPicker.hidden = false;
    }, 1800);
  });

  btnPCameraBack.addEventListener('click', function () {
    if (cameraTimeoutId) { clearTimeout(cameraTimeoutId); cameraTimeoutId = null; }
    pScreenCamera.hidden = true;
    pScreenIdle.hidden = false;
  });

  btnPScanBankApp.addEventListener('click', function () {
    if (charge.amount <= 0 || charge.paid) return;
    pScreenIdle.hidden = true;
    pScreenBankAppHome.hidden = false;
  });

  // --- Camera path: bank selection portal ---
  btnPBackToIdle.addEventListener('click', function () {
    pScreenBankPicker.hidden = true;
    pScreenIdle.hidden = false;
  });

  bankFavorites.addEventListener('click', function (e) {
    const favorite = e.target.closest('.bank-favorite');
    if (!favorite) return;

    selectedBankKey = favorite.getAttribute('data-bank');
    selectedBankName = favorite.getAttribute('data-name');
    selectedBankInitials = favorite.querySelector('.bank-logo').textContent;

    identityBankName.textContent = selectedBankName;
    identityEmailInput.value = '';
    identityPhoneInput.value = '';
    identityIdTypeSelect.value = '';
    identityIdNumberInput.value = '';
    selectAuthMethod('email');

    pScreenBankPicker.hidden = true;
    pScreenIdentity.hidden = false;
  });

  btnPBackToBankPicker.addEventListener('click', function () {
    pScreenIdentity.hidden = true;
    pScreenBankPicker.hidden = false;
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
      valid = emailPattern.test(identityEmailInput.value.trim());
    } else if (authMethod === 'phone') {
      valid = identityPhoneInput.value.replace(/\D/g, '').length === 10;
    } else if (authMethod === 'id') {
      valid = identityIdTypeSelect.value !== '' && identityIdNumberInput.value.trim().length >= 5;
    }
    btnPStartPayment.disabled = !valid;
  }

  identityEmailInput.addEventListener('input', updateStartPaymentState);
  identityPhoneInput.addEventListener('input', updateStartPaymentState);
  identityIdTypeSelect.addEventListener('change', updateStartPaymentState);
  identityIdNumberInput.addEventListener('input', updateStartPaymentState);

  btnPStartPayment.addEventListener('click', function () {
    pScreenIdentity.hidden = true;
    pushNotificationIcon.className = 'push-notification-icon dot-' + selectedBankKey;
    pushNotificationIcon.textContent = selectedBankInitials;
    pushNotificationTitle.textContent = selectedBankName;
    screenPushNotification.hidden = false;
  });

  pushNotificationCard.addEventListener('click', function () {
    screenPushNotification.hidden = true;
    summaryFlow = 'camera';
    goBiometric(showBankSummaryFromCamera);
  });

  function showBankSummaryFromCamera() {
    applyBankTheme(summaryScreenHeader, selectedBankKey);
    summaryScreenBankName.textContent = selectedBankName;
    openBankSummary();
  }

  // --- Bank app path: own bank, already logged in ---
  btnPBankAppScan.addEventListener('click', function () {
    pScreenBankAppHome.hidden = true;
    pScreenBankAppCamera.hidden = false;
    cameraTimeoutId = setTimeout(function () {
      pScreenBankAppCamera.hidden = true;
      selectedBankKey = 'azul';
      selectedBankName = 'Mi Banco';
      selectedBankInitials = 'MB';
      summaryFlow = 'bankapp';
      applyBankTheme(summaryScreenHeader, 'azul');
      summaryScreenBankName.textContent = 'Mi Banco';
      openBankSummary();
    }, 1800);
  });

  btnPBankCameraBack.addEventListener('click', function () {
    if (cameraTimeoutId) { clearTimeout(cameraTimeoutId); cameraTimeoutId = null; }
    pScreenBankAppCamera.hidden = true;
    pScreenBankAppHome.hidden = false;
  });

  // --- Shared: account selection + authorization ---
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
    selectedAccountLabel = selectedBankName + ' - ' + item.querySelector('.account-name').textContent;
    btnAuthorizeBankPayment.disabled = false;
  });

  btnAuthorizeBankPayment.addEventListener('click', function () {
    if (summaryFlow === 'bankapp') {
      screenBankSummary.hidden = true;
      goBiometric(completePayment);
    } else {
      screenBankSummary.hidden = true;
      completePayment();
    }
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
    charge.payerAccountLabel = selectedAccountLabel || (selectedBankName || '—');
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
