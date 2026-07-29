(function () {
  const chatBody = document.getElementById('chatBody');
  const overlayBackdrop = document.getElementById('overlayBackdrop');

  const sheetDetail = document.getElementById('sheetDetail');
  const sheetReceipt = document.getElementById('sheetReceipt');
  const screenBiometric = document.getElementById('screenBiometric');

  const btnPayWhatsapp = document.getElementById('btnPayWhatsapp');
  const btnAuthorize = document.getElementById('btnAuthorize');
  const fingerprintTap = document.getElementById('fingerprintTap');
  const btnViewReceipt = document.getElementById('btnViewReceipt');
  const btnCloseReceipt = document.getElementById('btnCloseReceipt');

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

  const screenBankSummary = document.getElementById('screenBankSummary');
  const summaryScreenHeader = document.getElementById('summaryScreenHeader');
  const summaryScreenBankName = document.getElementById('summaryScreenBankName');
  const bankSummaryAccountList = document.getElementById('bankSummaryAccountList');
  const btnAuthorizeBankPayment = document.getElementById('btnAuthorizeBankPayment');

  const sheetAlreadyPaid = document.getElementById('sheetAlreadyPaid');
  const btnCloseAlreadyPaid = document.getElementById('btnCloseAlreadyPaid');

  const receiptBubble = document.getElementById('receiptBubble');
  const receiptTime = document.getElementById('receiptTime');
  const receiptBankName = document.getElementById('receiptBankName');
  const receiptDate = document.getElementById('receiptDate');

  let selectedBank = null;

  // Cuenta configurada por defecto para pagos por WhatsApp (vía onboarding en la app del banco).
  // Se preconfigura con Banco Amarillo / Cuenta de Ahorros para que el escenario "ir directo al pago" funcione sin pasar por el onboarding.
  let defaultBankKey = 'amarillo';
  let defaultBankName = 'Banco Amarillo';
  let defaultBankInitials = 'BA';
  let defaultAccountName = 'Cuenta de Ahorros';
  let defaultAccountBalance = '$980.300';
  let onboardingChoice = null;
  let paymentCompleted = false;

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
    screenPushNotification.hidden = true;
    screenBankSummary.hidden = true;
    sheetAlreadyPaid.hidden = true;
  }

  function applyBankTheme(headerEl, bankKey) {
    headerEl.className = 'bank-app-header theme-' + bankKey;
  }

  function showAlreadyPaid() {
    showOverlay();
    sheetAlreadyPaid.hidden = false;
  }

  function currentTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

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

    defaultBankKey = chosen.getAttribute('data-bank');
    defaultBankName = chosen.getAttribute('data-bank-name');
    defaultBankInitials = chosen.getAttribute('data-bank-initials');
    defaultAccountName = chosen.querySelector('.account-name').textContent;
    defaultAccountBalance = chosen.getAttribute('data-balance');

    screenOnboardingAccount.hidden = true;
  });

  // Step 1 -> 2: open order detail sheet
  btnPayWhatsapp.addEventListener('click', function () {
    if (paymentCompleted) {
      showAlreadyPaid();
      return;
    }
    showOverlay();
    sheetDetail.hidden = false;
  });

  // Step 2 -> 3: authorize. El banco y la cuenta ya están preconfigurados (onboarding), así
  // que se salta directo a la notificación push, sin elegir banco ni verificar identidad de nuevo.
  btnAuthorize.addEventListener('click', function () {
    sheetDetail.hidden = true;
    hideOverlay();

    pushNotificationIcon.className = 'push-notification-icon dot-' + defaultBankKey;
    pushNotificationIcon.textContent = defaultBankInitials;
    pushNotificationTitle.textContent = defaultBankName;

    screenPushNotification.hidden = false;
  });

  // Tapping the push notification opens the simulated bank app on its biometric check
  pushNotificationCard.addEventListener('click', function () {
    screenPushNotification.hidden = true;
    screenBiometric.hidden = false;
  });

  // Muestra la cuenta por defecto en la tarjeta preseleccionada y colapsa el listado completo.
  function selectAccountForSummary(item) {
    bankSummaryAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    accountSelectedDot.className = item.querySelector('.account-dot').className;
    accountSelectedName.textContent = item.querySelector('.account-name').textContent;
    accountSelectedBalance.textContent = item.querySelector('.account-balance').textContent;

    selectedBank = {
      name: defaultBankName + ' - ' + item.querySelector('.account-name').textContent,
      balance: item.getAttribute('data-balance')
    };

    btnAuthorizeBankPayment.disabled = false;
    bankSummaryAccountList.hidden = true;
  }

  function finishBankBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    applyBankTheme(summaryScreenHeader, defaultBankKey);
    summaryScreenBankName.textContent = defaultBankName;

    // La cuenta configurada como predeterminada en el onboarding queda preseleccionada.
    const accountItems = bankSummaryAccountList.querySelectorAll('.account-item');
    let matched = null;
    accountItems.forEach(function (el) {
      if (el.querySelector('.account-name').textContent === defaultAccountName) matched = el;
    });
    selectAccountForSummary(matched || accountItems[0]);

    screenBankSummary.hidden = false;
  }

  // Bank summary, step: account selection right before authorizing the payment
  bankSummaryAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;
    selectAccountForSummary(item);
  });

  btnChangeAccount.addEventListener('click', function () {
    bankSummaryAccountList.hidden = !bankSummaryAccountList.hidden;
  });

  fingerprintTap.addEventListener('click', finishBankBiometric);

  // Auto-complete biometric after a short simulated delay
  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(finishBankBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  // Bank summary -> authorize from the bank app, return to WhatsApp with the receipt
  btnAuthorizeBankPayment.addEventListener('click', function () {
    screenBankSummary.hidden = true;
    hideAllSheets();
    paymentCompleted = true;

    receiptBubble.hidden = false;
    receiptTime.textContent = currentTime();
    receiptBankName.textContent = selectedBank ? selectedBank.name : '—';
    receiptDate.textContent = new Date().toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    chatBody.scrollTop = chatBody.scrollHeight;
  });

  // Step 4: view receipt detail
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
