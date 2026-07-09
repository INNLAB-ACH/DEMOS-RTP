(function () {
  // ===================== Shared state =====================
  const charge = {
    amount: 34900,
    concept: 'Suscripción mensual',
    paid: false,
    method: null, // 'qr' | 'bank'
    bankName: '',
    accountLabel: '',
    paidTime: '',
  };

  let selectedBank = null; // { key, name } — chosen on the desktop bank-selection sheet (Forma 2)
  let selectedBankKey = null; // bank chosen inside the phone flows (Forma 1)
  let selectedBankName = null;
  let selectedAccountLabel = null;
  let summaryFlow = null; // 'qr-camera' | 'qr-bankapp' | 'bank'
  let biometricNext = null;
  let cameraTimeoutId = null;
  let qrRefreshIntervalId = null;
  let catalogEmbedded = false;

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  function currentTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  function initialsOf(name) {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'B';
  }

  function bankThemeKey(key) {
    return key === 'amarillo' || key === 'rojo' || key === 'azul' ? key : 'otros';
  }

  function applyBankTheme(headerEl, bankKey) {
    headerEl.className = 'bank-app-header theme-' + bankThemeKey(bankKey);
  }

  // ===================== Desktop elements =====================
  const screenCatalog = document.getElementById('screenCatalog');
  const overlayBackdrop = document.getElementById('overlayBackdrop');

  const sheetPendingPayment = document.getElementById('sheetPendingPayment');
  const sheetPaymentMethod = document.getElementById('sheetPaymentMethod');
  const sheetSubscriptionQR = document.getElementById('sheetSubscriptionQR');
  const sheetBankSelection = document.getElementById('sheetBankSelection');
  const sheetIdentityVerification = document.getElementById('sheetIdentityVerification');
  const sheetPaymentConfirmed = document.getElementById('sheetPaymentConfirmed');

  const allSheets = [
    sheetPendingPayment, sheetPaymentMethod, sheetSubscriptionQR,
    sheetBankSelection, sheetIdentityVerification, sheetPaymentConfirmed,
  ];

  const btnAuthorizePayment = document.getElementById('btnAuthorizePayment');
  const btnCancelPayment = document.getElementById('btnCancelPayment');
  const btnMethodQR = document.getElementById('btnMethodQR');
  const btnMethodBank = document.getElementById('btnMethodBank');
  const btnBackToPending = document.getElementById('btnBackToPending');
  const btnBackFromQR = document.getElementById('btnBackFromQR');
  const subQrAmount = document.getElementById('subQrAmount');
  const subQrCanvas = document.getElementById('subQrCanvas');

  const bankGrid = document.getElementById('bankGrid');
  const bankItemOther = document.getElementById('bankItemOther');
  const otherBanksSelect = document.getElementById('otherBanksSelect');
  const btnGoToPay = document.getElementById('btnGoToPay');

  const btnBackToBankSelectionDesktop = document.getElementById('btnBackToBankSelectionDesktop');
  const suscIdentityBankName = document.getElementById('suscIdentityBankName');
  const suscAuthMethodList = document.getElementById('suscAuthMethodList');
  const suscAuthFieldEmail = document.getElementById('suscAuthFieldEmail');
  const suscAuthFieldPhone = document.getElementById('suscAuthFieldPhone');
  const suscAuthFieldId = document.getElementById('suscAuthFieldId');
  const suscIdentityEmailInput = document.getElementById('suscIdentityEmailInput');
  const suscIdentityPhoneInput = document.getElementById('suscIdentityPhoneInput');
  const suscIdentityIdTypeSelect = document.getElementById('suscIdentityIdTypeSelect');
  const suscIdentityIdNumberInput = document.getElementById('suscIdentityIdNumberInput');
  const btnSuscStartPayment = document.getElementById('btnSuscStartPayment');

  const confirmBankName = document.getElementById('confirmBankName');
  const confirmAccountName = document.getElementById('confirmAccountName');
  const confirmDate = document.getElementById('confirmDate');
  const btnCloseConfirmation = document.getElementById('btnCloseConfirmation');

  const payStage = document.getElementById('payStage');
  const browserFrame = document.getElementById('browserFrame');
  const browserBody = document.getElementById('browserBody');
  const stageConnectorLabel = document.getElementById('stageConnectorLabel');

  function showOverlay() {
    overlayBackdrop.hidden = false;
  }

  function hideOverlay() {
    overlayBackdrop.hidden = true;
  }

  function showSheet(sheet) {
    sheet.hidden = false;
    showOverlay();
  }

  function hideSheet(sheet) {
    sheet.hidden = true;
    if (sheet === sheetSubscriptionQR && qrRefreshIntervalId) {
      clearInterval(qrRefreshIntervalId);
      qrRefreshIntervalId = null;
    }
  }

  function hideAllSheets() {
    allSheets.forEach(hideSheet);
    hideOverlay();
  }

  // ===================== Embedding the catalog inside the browser frame =====================
  function embedIntoBrowser() {
    if (catalogEmbedded) return;
    browserBody.appendChild(screenCatalog);
    browserBody.appendChild(overlayBackdrop);
    allSheets.forEach((s) => browserBody.appendChild(s));
    browserFrame.classList.add('browser-frame--payment-active');
    catalogEmbedded = true;
  }

  function restoreFullscreenCatalog() {
    if (!catalogEmbedded) return;
    document.body.insertBefore(screenCatalog, document.body.firstChild);
    document.body.appendChild(overlayBackdrop);
    allSheets.forEach((s) => document.body.appendChild(s));
    browserFrame.classList.remove('browser-frame--payment-active');
    catalogEmbedded = false;
  }

  function openPayStage() {
    embedIntoBrowser();
    payStage.hidden = false;
  }

  function closePayStage() {
    payStage.hidden = true;
    restoreFullscreenCatalog();
  }

  // ===================== Phone elements & screen switching =====================
  const pScreenIdle = document.getElementById('pScreenIdle');

  const qrScreenChooseChannel = document.getElementById('qrScreenChooseChannel');
  const btnQrChannelBack = document.getElementById('btnQrChannelBack');
  const btnQrScanCamera = document.getElementById('btnQrScanCamera');
  const btnQrScanBankApp = document.getElementById('btnQrScanBankApp');

  const qrScreenCamera = document.getElementById('qrScreenCamera');
  const btnQrCameraBack = document.getElementById('btnQrCameraBack');

  const qrScreenBankPicker = document.getElementById('qrScreenBankPicker');
  const btnQrBankPickerBack = document.getElementById('btnQrBankPickerBack');
  const qrPortalAmount = document.getElementById('qrPortalAmount');
  const qrBankFavorites = document.getElementById('qrBankFavorites');

  const qrScreenIdentity = document.getElementById('qrScreenIdentity');
  const btnQrIdentityBack = document.getElementById('btnQrIdentityBack');
  const qrIdentityBankName = document.getElementById('qrIdentityBankName');
  const qrAuthMethodList = document.getElementById('qrAuthMethodList');
  const qrAuthFieldEmail = document.getElementById('qrAuthFieldEmail');
  const qrAuthFieldPhone = document.getElementById('qrAuthFieldPhone');
  const qrAuthFieldId = document.getElementById('qrAuthFieldId');
  const qrIdentityEmailInput = document.getElementById('qrIdentityEmailInput');
  const qrIdentityPhoneInput = document.getElementById('qrIdentityPhoneInput');
  const qrIdentityIdTypeSelect = document.getElementById('qrIdentityIdTypeSelect');
  const qrIdentityIdNumberInput = document.getElementById('qrIdentityIdNumberInput');
  const btnQrStartPayment = document.getElementById('btnQrStartPayment');

  const qrScreenBankAppHome = document.getElementById('qrScreenBankAppHome');
  const btnQrBankAppScan = document.getElementById('btnQrBankAppScan');
  const qrScreenBankAppCamera = document.getElementById('qrScreenBankAppCamera');
  const btnQrBankAppCameraBack = document.getElementById('btnQrBankAppCameraBack');

  const subScreenPushNotification = document.getElementById('subScreenPushNotification');
  const subPushNotificationCard = document.getElementById('subPushNotificationCard');
  const subPushNotificationIcon = document.getElementById('subPushNotificationIcon');
  const subPushNotificationTitle = document.getElementById('subPushNotificationTitle');

  const subScreenBiometric = document.getElementById('subScreenBiometric');
  const subFingerprintTap = document.getElementById('subFingerprintTap');

  const subScreenBankSummary = document.getElementById('subScreenBankSummary');
  const subSummaryScreenHeader = document.getElementById('subSummaryScreenHeader');
  const subSummaryScreenBankName = document.getElementById('subSummaryScreenBankName');
  const subSummaryAmount = document.getElementById('subSummaryAmount');
  const subBankSummaryAccountList = document.getElementById('subBankSummaryAccountList');
  const btnSubAuthorizeBankPayment = document.getElementById('btnSubAuthorizeBankPayment');

  const subScreenSuccess = document.getElementById('subScreenSuccess');
  const subSuccessAmount = document.getElementById('subSuccessAmount');
  const subSuccessAccount = document.getElementById('subSuccessAccount');
  const subSuccessTime = document.getElementById('subSuccessTime');
  const btnSubDone = document.getElementById('btnSubDone');

  const phoneScreens = [
    pScreenIdle, qrScreenChooseChannel, qrScreenCamera, qrScreenBankPicker, qrScreenIdentity,
    qrScreenBankAppHome, qrScreenBankAppCamera,
    subScreenPushNotification, subScreenBiometric, subScreenBankSummary, subScreenSuccess,
  ];

  function showPhoneScreen(screen) {
    if (cameraTimeoutId) { clearTimeout(cameraTimeoutId); cameraTimeoutId = null; }
    phoneScreens.forEach((s) => { s.hidden = s !== screen; });
  }

  function resetPhoneToIdle() {
    showPhoneScreen(pScreenIdle);
  }

  // ===================== Reusable identity verification controller =====================
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function createIdentityController(refs) {
    let method = 'email';

    function select(m) {
      method = m;
      refs.methodList.querySelectorAll('.bank-favorite').forEach((el) => {
        el.classList.toggle('selected', el.getAttribute('data-method') === m);
      });
      refs.fieldEmail.hidden = m !== 'email';
      refs.fieldPhone.hidden = m !== 'phone';
      refs.fieldId.hidden = m !== 'id';
      update();
    }

    function update() {
      let valid = false;
      if (method === 'email') {
        valid = emailPattern.test(refs.emailInput.value.trim());
      } else if (method === 'phone') {
        valid = refs.phoneInput.value.replace(/\D/g, '').length === 10;
      } else if (method === 'id') {
        valid = refs.idTypeSelect.value !== '' && refs.idNumberInput.value.trim().length >= 5;
      }
      refs.submitBtn.disabled = !valid;
    }

    refs.methodList.addEventListener('click', (e) => {
      const btn = e.target.closest('.bank-favorite');
      if (!btn) return;
      select(btn.getAttribute('data-method'));
    });

    refs.emailInput.addEventListener('input', update);
    refs.phoneInput.addEventListener('input', update);
    refs.idTypeSelect.addEventListener('change', update);
    refs.idNumberInput.addEventListener('input', update);

    return {
      reset() {
        refs.emailInput.value = '';
        refs.phoneInput.value = '';
        refs.idTypeSelect.value = '';
        refs.idNumberInput.value = '';
        select('email');
      },
    };
  }

  const qrIdentity = createIdentityController({
    methodList: qrAuthMethodList,
    fieldEmail: qrAuthFieldEmail,
    fieldPhone: qrAuthFieldPhone,
    fieldId: qrAuthFieldId,
    emailInput: qrIdentityEmailInput,
    phoneInput: qrIdentityPhoneInput,
    idTypeSelect: qrIdentityIdTypeSelect,
    idNumberInput: qrIdentityIdNumberInput,
    submitBtn: btnQrStartPayment,
  });

  const suscIdentity = createIdentityController({
    methodList: suscAuthMethodList,
    fieldEmail: suscAuthFieldEmail,
    fieldPhone: suscAuthFieldPhone,
    fieldId: suscAuthFieldId,
    emailInput: suscIdentityEmailInput,
    phoneInput: suscIdentityPhoneInput,
    idTypeSelect: suscIdentityIdTypeSelect,
    idNumberInput: suscIdentityIdNumberInput,
    submitBtn: btnSuscStartPayment,
  });

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
    const ctx = subQrCanvas.getContext('2d');
    const size = subQrCanvas.width;
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

  // ===================== Shared biometric screen =====================
  function goBiometric(nextFn) {
    biometricNext = nextFn;
    showPhoneScreen(subScreenBiometric);
    setTimeout(finishBiometric, 1500);
  }

  function finishBiometric() {
    if (subScreenBiometric.hidden) return;
    subScreenBiometric.hidden = true;
    const next = biometricNext;
    biometricNext = null;
    if (next) next();
  }

  subFingerprintTap.addEventListener('click', finishBiometric);

  // ===================== Shared: account selection + authorize (phone) =====================
  function openBankSummary() {
    subSummaryAmount.textContent = formatCOP(charge.amount);
    subBankSummaryAccountList.querySelectorAll('.account-item').forEach((el) => {
      el.classList.remove('selected');
    });
    selectedAccountLabel = null;
    btnSubAuthorizeBankPayment.disabled = true;
    showPhoneScreen(subScreenBankSummary);
  }

  subBankSummaryAccountList.addEventListener('click', (e) => {
    const item = e.target.closest('.account-item');
    if (!item) return;
    subBankSummaryAccountList.querySelectorAll('.account-item').forEach((el) => {
      el.classList.remove('selected');
    });
    item.classList.add('selected');
    selectedAccountLabel = (selectedBankName || '') + ' - ' + item.getAttribute('data-name');
    btnSubAuthorizeBankPayment.disabled = false;
  });

  btnSubAuthorizeBankPayment.addEventListener('click', () => {
    subScreenBankSummary.hidden = true;
    if (summaryFlow === 'qr-bankapp') {
      goBiometric(completePayment);
    } else {
      completePayment();
    }
  });

  function completePayment() {
    charge.paid = true;
    charge.bankName = selectedBankName || '—';
    charge.accountLabel = selectedAccountLabel || '—';
    charge.paidTime = currentTime();

    subSuccessAmount.textContent = formatCOP(charge.amount);
    subSuccessAccount.textContent = charge.accountLabel;
    subSuccessTime.textContent = charge.paidTime;
    showPhoneScreen(subScreenSuccess);

    syncDesktopPaid();
  }

  function syncDesktopPaid() {
    if (qrRefreshIntervalId) { clearInterval(qrRefreshIntervalId); qrRefreshIntervalId = null; }
    hideAllSheets();

    confirmBankName.textContent = charge.bankName || '—';
    confirmAccountName.textContent = charge.accountLabel || '—';
    confirmDate.textContent = new Date().toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    showSheet(sheetPaymentConfirmed);
    stageConnectorLabel.textContent = 'Pago confirmado';
  }

  btnSubDone.addEventListener('click', () => {
    resetPhoneToIdle();
  });

  // ===================== Entry point: pending payment -> choose method =====================
  showSheet(sheetPendingPayment);

  btnCancelPayment.addEventListener('click', () => {
    hideAllSheets();
  });

  btnAuthorizePayment.addEventListener('click', () => {
    hideSheet(sheetPendingPayment);
    showSheet(sheetPaymentMethod);
  });

  btnBackToPending.addEventListener('click', () => {
    hideSheet(sheetPaymentMethod);
    showSheet(sheetPendingPayment);
  });

  // ===================== Forma 1: pagar con QR =====================
  btnMethodQR.addEventListener('click', () => {
    charge.method = 'qr';
    hideSheet(sheetPaymentMethod);
    openPayStage();
    stageConnectorLabel.textContent = 'Escanea el QR con tu celular';

    subQrAmount.textContent = formatCOP(charge.amount);
    renderQR();
    if (qrRefreshIntervalId) clearInterval(qrRefreshIntervalId);
    qrRefreshIntervalId = setInterval(renderQR, 60000);

    showSheet(sheetSubscriptionQR);
    showPhoneScreen(qrScreenChooseChannel);
  });

  btnBackFromQR.addEventListener('click', () => {
    hideSheet(sheetSubscriptionQR);
    resetPhoneToIdle();
    showSheet(sheetPaymentMethod);
  });

  btnQrChannelBack.addEventListener('click', () => {
    hideSheet(sheetSubscriptionQR);
    resetPhoneToIdle();
    showSheet(sheetPaymentMethod);
  });

  btnQrScanCamera.addEventListener('click', () => {
    showPhoneScreen(qrScreenCamera);
    cameraTimeoutId = setTimeout(() => {
      qrPortalAmount.textContent = formatCOP(charge.amount);
      showPhoneScreen(qrScreenBankPicker);
    }, 1800);
  });

  btnQrCameraBack.addEventListener('click', () => {
    showPhoneScreen(qrScreenChooseChannel);
  });

  btnQrScanBankApp.addEventListener('click', () => {
    showPhoneScreen(qrScreenBankAppHome);
  });

  btnQrBankPickerBack.addEventListener('click', () => {
    showPhoneScreen(qrScreenChooseChannel);
  });

  qrBankFavorites.addEventListener('click', (e) => {
    const favorite = e.target.closest('.bank-favorite');
    if (!favorite) return;

    selectedBankKey = favorite.getAttribute('data-bank');
    selectedBankName = favorite.getAttribute('data-name');

    qrIdentityBankName.textContent = selectedBankName;
    qrIdentity.reset();

    showPhoneScreen(qrScreenIdentity);
  });

  btnQrIdentityBack.addEventListener('click', () => {
    showPhoneScreen(qrScreenBankPicker);
  });

  btnQrStartPayment.addEventListener('click', () => {
    subPushNotificationIcon.className = 'push-notification-icon dot-' + bankThemeKey(selectedBankKey);
    subPushNotificationIcon.textContent = initialsOf(selectedBankName);
    subPushNotificationTitle.textContent = selectedBankName;
    showPhoneScreen(subScreenPushNotification);

    subPushNotificationCard.onclick = () => {
      summaryFlow = 'qr-camera';
      goBiometric(() => {
        applyBankTheme(subSummaryScreenHeader, selectedBankKey);
        subSummaryScreenBankName.textContent = selectedBankName;
        openBankSummary();
      });
    };
  });

  btnQrBankAppScan.addEventListener('click', () => {
    showPhoneScreen(qrScreenBankAppCamera);
    cameraTimeoutId = setTimeout(() => {
      selectedBankKey = 'azul';
      selectedBankName = 'Mi Banco';
      summaryFlow = 'qr-bankapp';
      applyBankTheme(subSummaryScreenHeader, 'azul');
      subSummaryScreenBankName.textContent = 'Mi Banco';
      openBankSummary();
    }, 1800);
  });

  btnQrBankAppCameraBack.addEventListener('click', () => {
    showPhoneScreen(qrScreenBankAppHome);
  });

  // ===================== Forma 2: pagar desde mi banco =====================
  btnMethodBank.addEventListener('click', () => {
    charge.method = 'bank';
    hideSheet(sheetPaymentMethod);
    openPayStage();
    stageConnectorLabel.textContent = 'Elige un método';
    showSheet(sheetBankSelection);
  });

  function selectBank(bankKey, bankName) {
    selectedBank = { key: bankKey, name: bankName };
    bankGrid.querySelectorAll('.bank-item').forEach((item) => item.classList.remove('selected'));
    btnGoToPay.disabled = false;
  }

  bankGrid.addEventListener('click', (event) => {
    const item = event.target.closest('.bank-item');
    if (!item) return;

    if (item === bankItemOther) {
      otherBanksSelect.hidden = !otherBanksSelect.hidden;
      return;
    }

    item.classList.add('selected');
    selectBank(item.dataset.bank, item.dataset.bankName);
  });

  otherBanksSelect.addEventListener('change', () => {
    const option = otherBanksSelect.options[otherBanksSelect.selectedIndex];
    if (!option.value) return;
    bankItemOther.classList.add('selected');
    selectBank(option.value, option.dataset.bankName);
  });

  btnGoToPay.addEventListener('click', () => {
    if (!selectedBank) return;
    suscIdentityBankName.textContent = selectedBank.name;
    suscIdentity.reset();
    hideSheet(sheetBankSelection);
    showSheet(sheetIdentityVerification);
  });

  btnBackToBankSelectionDesktop.addEventListener('click', () => {
    hideSheet(sheetIdentityVerification);
    showSheet(sheetBankSelection);
  });

  btnSuscStartPayment.addEventListener('click', () => {
    if (!selectedBank) return;
    selectedBankKey = selectedBank.key;
    selectedBankName = selectedBank.name;
    summaryFlow = 'bank';

    hideSheet(sheetIdentityVerification);
    stageConnectorLabel.textContent = 'Esperando autorización en tu celular';

    subPushNotificationIcon.className = 'push-notification-icon dot-' + bankThemeKey(selectedBankKey);
    subPushNotificationIcon.textContent = initialsOf(selectedBankName);
    subPushNotificationTitle.textContent = selectedBankName;
    showPhoneScreen(subScreenPushNotification);

    subPushNotificationCard.onclick = () => {
      goBiometric(() => {
        applyBankTheme(subSummaryScreenHeader, selectedBankKey);
        subSummaryScreenBankName.textContent = selectedBankName;
        openBankSummary();
      });
    };
  });

  // ===================== Reset / close =====================
  function resetFlow() {
    selectedBank = null;
    selectedBankKey = null;
    selectedBankName = null;
    selectedAccountLabel = null;
    summaryFlow = null;
    charge.paid = false;
    charge.method = null;
    charge.bankName = '';
    charge.accountLabel = '';
    charge.paidTime = '';

    bankGrid.querySelectorAll('.bank-item').forEach((item) => item.classList.remove('selected'));
    otherBanksSelect.hidden = true;
    otherBanksSelect.selectedIndex = 0;
    btnGoToPay.disabled = true;

    stageConnectorLabel.textContent = 'Elige un método';
    resetPhoneToIdle();
    closePayStage();
  }

  btnCloseConfirmation.addEventListener('click', () => {
    hideAllSheets();
    resetFlow();
  });
})();
