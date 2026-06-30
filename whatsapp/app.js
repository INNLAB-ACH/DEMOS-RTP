(function () {
  const chatBody = document.getElementById('chatBody');
  const overlayBackdrop = document.getElementById('overlayBackdrop');

  const sheetDetail = document.getElementById('sheetDetail');
  const sheetAccounts = document.getElementById('sheetAccounts');
  const sheetReceipt = document.getElementById('sheetReceipt');
  const screenBiometric = document.getElementById('screenBiometric');
  const sheetBankPicker = document.getElementById('sheetBankPicker');
  const screenBankApp = document.getElementById('screenBankApp');
  const screenBrowser = document.getElementById('screenBrowser');
  const screenAchLogin = document.getElementById('screenAchLogin');
  const screenAchPortal = document.getElementById('screenAchPortal');

  const btnPayWhatsapp = document.getElementById('btnPayWhatsapp');
  const btnPayBank = document.getElementById('btnPayBank');
  const btnPayAchPortal = document.getElementById('btnPayAchPortal');
  const btnAuthorize = document.getElementById('btnAuthorize');
  const accountList = document.getElementById('accountList');
  const btnConfirmPayment = document.getElementById('btnConfirmPayment');
  const fingerprintTap = document.getElementById('fingerprintTap');
  const btnViewReceipt = document.getElementById('btnViewReceipt');
  const btnCloseReceipt = document.getElementById('btnCloseReceipt');

  const bankFavorites = document.getElementById('bankFavorites');
  const bankAppHeader = document.getElementById('bankAppHeader');
  const bankAppName = document.getElementById('bankAppName');
  const btnCloseBankApp = document.getElementById('btnCloseBankApp');
  const bankAppAccountList = document.getElementById('bankAppAccountList');
  const btnConfirmBankPayment = document.getElementById('btnConfirmBankPayment');

  const btnAchLogin = document.getElementById('btnAchLogin');
  const achPortalAccountList = document.getElementById('achPortalAccountList');
  const btnConfirmAchPayment = document.getElementById('btnConfirmAchPayment');

  const sheetAlreadyPaid = document.getElementById('sheetAlreadyPaid');
  const btnCloseAlreadyPaid = document.getElementById('btnCloseAlreadyPaid');

  const receiptBubble = document.getElementById('receiptBubble');
  const receiptTime = document.getElementById('receiptTime');
  const receiptBankName = document.getElementById('receiptBankName');
  const receiptDate = document.getElementById('receiptDate');

  let selectedBank = null;
  let paymentCompleted = false;

  function showOverlay() {
    overlayBackdrop.hidden = false;
  }

  function hideOverlay() {
    overlayBackdrop.hidden = true;
  }

  function hideAllSheets() {
    sheetDetail.hidden = true;
    sheetAccounts.hidden = true;
    sheetReceipt.hidden = true;
    screenBiometric.hidden = true;
    sheetBankPicker.hidden = true;
    screenBankApp.hidden = true;
    screenBrowser.hidden = true;
    screenAchLogin.hidden = true;
    screenAchPortal.hidden = true;
    sheetAlreadyPaid.hidden = true;
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

  // Step 1 -> 2: open order detail sheet
  btnPayWhatsapp.addEventListener('click', function () {
    if (paymentCompleted) {
      showAlreadyPaid();
      return;
    }
    showOverlay();
    sheetDetail.hidden = false;
  });

  // Bank flow, step 1: open bank picker sheet
  btnPayBank.addEventListener('click', function () {
    if (paymentCompleted) {
      showAlreadyPaid();
      return;
    }
    showOverlay();
    sheetBankPicker.hidden = false;
  });

  // Step 2 -> 3: authorize, switch to account selection sheet
  btnAuthorize.addEventListener('click', function () {
    sheetDetail.hidden = true;
    sheetAccounts.hidden = false;
  });

  // Account selection
  accountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;

    accountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    selectedBank = {
      name: 'Banco ' + item.getAttribute('data-bank').charAt(0).toUpperCase() + item.getAttribute('data-bank').slice(1),
      balance: item.getAttribute('data-balance')
    };

    btnConfirmPayment.disabled = false;
  });

  // Step 3: confirm payment -> biometric screen
  btnConfirmPayment.addEventListener('click', function () {
    sheetAccounts.hidden = true;
    hideOverlay();
    screenBiometric.hidden = false;
  });

  // Bank flow, step 1: choosing a favorite bank opens the simulated bank app
  bankFavorites.addEventListener('click', function (e) {
    const favorite = e.target.closest('.bank-favorite');
    if (!favorite) return;

    const bankKey = favorite.getAttribute('data-bank');
    const bankName = favorite.getAttribute('data-name');

    bankAppHeader.className = 'bank-app-header theme-' + bankKey;
    bankAppName.textContent = bankName;

    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnConfirmBankPayment.disabled = true;
    selectedBank = null;

    sheetBankPicker.hidden = true;
    hideOverlay();
    screenBankApp.hidden = false;
  });

  // Bank flow, step 2: account selection within the bank app
  bankAppAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;

    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    selectedBank = {
      name: bankAppName.textContent + ' - ' + item.querySelector('.account-name').textContent,
      balance: item.getAttribute('data-balance')
    };

    btnConfirmBankPayment.disabled = false;
  });

  // Bank flow, step 2 -> biometric screen (reuses the same screen as the WhatsApp flow)
  btnConfirmBankPayment.addEventListener('click', function () {
    screenBankApp.hidden = true;
    screenBiometric.hidden = false;
  });

  btnCloseBankApp.addEventListener('click', function () {
    screenBankApp.hidden = true;
  });

  // ACH portal flow, step 1: open simulated browser, auto-advance to login
  btnPayAchPortal.addEventListener('click', function () {
    if (paymentCompleted) {
      showAlreadyPaid();
      return;
    }
    screenBrowser.hidden = false;
    setTimeout(function () {
      if (screenBrowser.hidden) return;
      screenBrowser.hidden = true;
      screenAchLogin.hidden = false;
    }, 1000);
  });

  // ACH portal flow, step 2: login (no validation) -> portal
  btnAchLogin.addEventListener('click', function () {
    screenAchLogin.hidden = true;

    achPortalAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnConfirmAchPayment.disabled = true;
    selectedBank = null;

    screenAchPortal.hidden = false;
  });

  // ACH portal flow, step 3: account selection
  achPortalAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;

    achPortalAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    selectedBank = {
      name: 'Banco ' + item.getAttribute('data-bank').charAt(0).toUpperCase() + item.getAttribute('data-bank').slice(1),
      balance: item.getAttribute('data-balance')
    };

    btnConfirmAchPayment.disabled = false;
  });

  // ACH portal flow, step 3 -> biometric screen
  btnConfirmAchPayment.addEventListener('click', function () {
    screenAchPortal.hidden = true;
    screenBiometric.hidden = false;
  });

  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;
    hideAllSheets();
    paymentCompleted = true;

    receiptBubble.hidden = false;
    receiptTime.textContent = currentTime();
    receiptBankName.textContent = selectedBank ? selectedBank.name : '—';
    receiptDate.textContent = new Date().toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  fingerprintTap.addEventListener('click', completeBiometric);

  // Auto-complete biometric after a short simulated delay
  screenBiometric.addEventListener('transitionend', function () {});
  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(completeBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

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
