(function () {
  const screenCart = document.getElementById('screenCart');
  const cartBody = document.getElementById('cartBody');
  const screenPayment = document.getElementById('screenPayment');
  const paymentBody = document.getElementById('paymentBody');
  const paymentWaiting = document.getElementById('paymentWaiting');
  const overlayBackdrop = document.getElementById('overlayBackdrop');
  const sheetOpenWith = document.getElementById('sheetOpenWith');
  const screenBankApp = document.getElementById('screenBankApp');
  const screenBiometric = document.getElementById('screenBiometric');
  const confirmationBanner = document.getElementById('confirmationBanner');

  const btnGoToPay = document.getElementById('btnGoToPay');
  const btnBackToCart = document.getElementById('btnBackToCart');

  const paymentMethodList = document.getElementById('paymentMethodList');
  const btnGoToPayFinal = document.getElementById('btnGoToPayFinal');

  const bankAppList = document.getElementById('bankAppList');
  const btnOpenBankApp = document.getElementById('btnOpenBankApp');

  const bankAppHeader = document.getElementById('bankAppHeader');
  const bankAppName = document.getElementById('bankAppName');
  const btnCloseBankApp = document.getElementById('btnCloseBankApp');
  const bankAppPaymentView = document.getElementById('bankAppPaymentView');
  const bankAppAccountList = document.getElementById('bankAppAccountList');
  const btnAuthorizePayment = document.getElementById('btnAuthorizePayment');
  const bankAppConfirmView = document.getElementById('bankAppConfirmView');
  const bankAppConfirmAmount = document.getElementById('bankAppConfirmAmount');
  const bankAppConfirmAccount = document.getElementById('bankAppConfirmAccount');
  const btnReturnToMerchant = document.getElementById('btnReturnToMerchant');

  const fingerprintTap = document.getElementById('fingerprintTap');

  const confirmationAmount = document.getElementById('confirmationAmount');
  const confirmationAccount = document.getElementById('confirmationAccount');
  const btnCloseConfirmation = document.getElementById('btnCloseConfirmation');

  const TOTAL_AMOUNT = '$292.700';

  let selectedMethod = null;
  let selectedBank = null;
  let selectedAccount = null;

  function hideAllOverlays() {
    overlayBackdrop.hidden = true;
    sheetOpenWith.hidden = true;
    screenBankApp.hidden = true;
    screenBiometric.hidden = true;
  }

  // Step 1 -> 2: ir a pagar desde el carrito
  btnGoToPay.addEventListener('click', function () {
    screenPayment.hidden = false;
  });

  btnBackToCart.addEventListener('click', function () {
    screenPayment.hidden = true;
  });

  // Step 2: seleccionar método de pago
  paymentMethodList.addEventListener('click', function (e) {
    const item = e.target.closest('.payment-method-item');
    if (!item) return;

    paymentMethodList.querySelectorAll('.payment-method-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');
    selectedMethod = item.getAttribute('data-method');

    btnGoToPayFinal.disabled = false;
  });

  // Step 2 -> 3: abre el panel "Abrir con"
  btnGoToPayFinal.addEventListener('click', function () {
    bankAppList.querySelectorAll('.bank-app-pick').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnOpenBankApp.disabled = true;
    selectedBank = null;

    overlayBackdrop.hidden = false;
    sheetOpenWith.hidden = false;
  });

  // Step 3: selección de banco instalado
  bankAppList.addEventListener('click', function (e) {
    const item = e.target.closest('.bank-app-pick');
    if (!item) return;

    bankAppList.querySelectorAll('.bank-app-pick').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    selectedBank = {
      key: item.getAttribute('data-bank'),
      name: item.getAttribute('data-name')
    };

    btnOpenBankApp.disabled = false;
  });

  // Step 3 -> 4: abrir la app del banco elegido
  btnOpenBankApp.addEventListener('click', function () {
    if (!selectedBank) return;

    bankAppHeader.className = 'bank-app-header theme-' + selectedBank.key;
    bankAppName.textContent = selectedBank.name;

    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnAuthorizePayment.disabled = true;
    selectedAccount = null;

    bankAppPaymentView.hidden = false;
    btnAuthorizePayment.hidden = false;
    bankAppConfirmView.hidden = true;
    btnReturnToMerchant.hidden = true;

    sheetOpenWith.hidden = true;
    overlayBackdrop.hidden = true;
    screenBankApp.hidden = false;
  });

  btnCloseBankApp.addEventListener('click', function () {
    screenBankApp.hidden = true;
  });

  // Step 4: selección de cuenta a debitar
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

    btnAuthorizePayment.disabled = false;
  });

  // Step 4 -> 5: autorizar pago -> biometría
  btnAuthorizePayment.addEventListener('click', function () {
    screenBankApp.hidden = true;
    screenBiometric.hidden = false;
  });

  // Step 5 -> 6: la biometría se confirma dentro del contexto del banco
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    bankAppPaymentView.hidden = true;
    btnAuthorizePayment.hidden = true;
    bankAppConfirmAmount.textContent = TOTAL_AMOUNT;
    bankAppConfirmAccount.textContent = selectedAccount
      ? selectedAccount.name + ' · Saldo: ' + selectedAccount.balance
      : '—';
    bankAppConfirmView.hidden = false;
    btnReturnToMerchant.hidden = false;

    screenBankApp.hidden = false;
  }

  fingerprintTap.addEventListener('click', completeBiometric);

  // Auto-completa la biometría tras un breve retardo simulado
  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(completeBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  // Step 6 -> 7: regresar a la app del comercio que abrió el banco, en estado de espera
  btnReturnToMerchant.addEventListener('click', function () {
    screenBankApp.hidden = true;

    paymentBody.hidden = true;
    btnGoToPayFinal.hidden = true;
    paymentWaiting.hidden = false;
    screenPayment.hidden = false;

    setTimeout(function () {
      screenPayment.hidden = true;

      // Restaura la pantalla de pago para una próxima ejecución del flujo
      paymentWaiting.hidden = true;
      paymentBody.hidden = false;
      btnGoToPayFinal.hidden = false;

      confirmationAmount.textContent = TOTAL_AMOUNT;
      confirmationAccount.textContent = selectedBank && selectedAccount
        ? selectedBank.name + ' · ' + selectedAccount.name
        : '—';

      cartBody.hidden = true;
      btnGoToPay.hidden = true;
      confirmationBanner.hidden = false;
    }, 3000);
  });

  // Step 7: continuar comprando y reiniciar el flujo
  btnCloseConfirmation.addEventListener('click', function () {
    confirmationBanner.hidden = true;
    cartBody.hidden = false;
    btnGoToPay.hidden = false;

    paymentMethodList.querySelectorAll('.payment-method-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnGoToPayFinal.disabled = true;
    selectedMethod = null;
    selectedBank = null;
    selectedAccount = null;
  });

  overlayBackdrop.addEventListener('click', function () {
    hideAllOverlays();
  });
})();
