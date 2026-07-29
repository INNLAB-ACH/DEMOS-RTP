(function () {
  const screenOrder = document.getElementById('screenOrder');
  const orderBody = document.getElementById('orderBody');
  const screenPayment = document.getElementById('screenPayment');
  const paymentBody = document.getElementById('paymentBody');
  const paymentWaiting = document.getElementById('paymentWaiting');
  const screenBankApp = document.getElementById('screenBankApp');
  const screenApproverConfirm = document.getElementById('screenApproverConfirm');
  const screenBiometric = document.getElementById('screenBiometric');
  const confirmationBanner = document.getElementById('confirmationBanner');

  const btnGoToPay = document.getElementById('btnGoToPay');
  const btnBackToCart = document.getElementById('btnBackToCart');

  const paymentMethodList = document.getElementById('paymentMethodList');
  const btnGoToPayFinal = document.getElementById('btnGoToPayFinal');

  const screenIdentityVerification = document.getElementById('screenIdentityVerification');
  const btnBackToPayment = document.getElementById('btnBackToPayment');
  const identityIdTypeSelect = document.getElementById('identityIdTypeSelect');
  const identityIdNumberInput = document.getElementById('identityIdNumberInput');
  const btnStartPayment = document.getElementById('btnStartPayment');

  const screenBankDefault = document.getElementById('screenBankDefault');
  const btnBackToIdentity = document.getElementById('btnBackToIdentity');
  const bankSelectedCard = document.getElementById('bankSelectedCard');
  const bankSelectedLogo = document.getElementById('bankSelectedLogo');
  const bankSelectedName = document.getElementById('bankSelectedName');
  const bankFavorites = document.getElementById('bankFavorites');
  const btnConfirmBankDefault = document.getElementById('btnConfirmBankDefault');

  const screenPushNotification = document.getElementById('screenPushNotification');
  const pushNotificationCard = document.getElementById('pushNotificationCard');
  const pushNotificationIcon = document.getElementById('pushNotificationIcon');
  const pushNotificationTitle = document.getElementById('pushNotificationTitle');

  const bankAppHeader = document.getElementById('bankAppHeader');
  const bankAppName = document.getElementById('bankAppName');
  const btnCloseBankApp = document.getElementById('btnCloseBankApp');
  const bankAppPaymentView = document.getElementById('bankAppPaymentView');
  const accountSelectedCard = document.getElementById('accountSelectedCard');
  const accountSelectedDot = document.getElementById('accountSelectedDot');
  const accountSelectedName = document.getElementById('accountSelectedName');
  const accountSelectedBalance = document.getElementById('accountSelectedBalance');
  const btnChangeAccount = document.getElementById('btnChangeAccount');
  const bankAppAccountList = document.getElementById('bankAppAccountList');
  const btnAuthorizePayment = document.getElementById('btnAuthorizePayment');
  const bankAppConfirmView = document.getElementById('bankAppConfirmView');
  const bankAppConfirmAmount = document.getElementById('bankAppConfirmAmount');
  const bankAppConfirmAccount = document.getElementById('bankAppConfirmAccount');
  const btnReturnToMerchant = document.getElementById('btnReturnToMerchant');

  const approverAmount = document.getElementById('approverAmount');
  const approverCompanyName = document.getElementById('approverCompanyName');
  const approverOrderRef = document.getElementById('approverOrderRef');
  const approverCheckbox = document.getElementById('approverCheckbox');
  const btnConfirmApproval = document.getElementById('btnConfirmApproval');

  const fingerprintTap = document.getElementById('fingerprintTap');

  const confirmationAmount = document.getElementById('confirmationAmount');
  const confirmationAccount = document.getElementById('confirmationAccount');
  const confirmationOrderRef = document.getElementById('confirmationOrderRef');
  const btnCloseConfirmation = document.getElementById('btnCloseConfirmation');

  const TOTAL_AMOUNT = '$18.450.000';
  const ORDER_NUMBER = 'OC-48213';
  const BUYER_COMPANY = 'Distribuidora ANDES S.A.S.';

  // Banco y cuenta configurados por defecto en el proceso de configuración inicial (onboarding)
  // asociado a la cédula del comprador. Se preseleccionan para que el usuario no tenga que
  // volver a elegirlos en cada pago, con la opción de cambiarlos si lo necesita.
  const DEFAULT_BANK = { key: 'amarillo', name: 'Banco Amarillo', initials: 'BA' };
  const DEFAULT_ACCOUNT_NAME = 'Cuenta Corriente Empresarial';

  let selectedMethod = null;
  let selectedBank = null;
  let selectedAccount = null;

  // Step 1 -> 2: ir a pagar desde la orden de compra
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

  // Step 2 -> verificación de identidad: solo "Cóbrame con ACH" dispara el flujo
  btnGoToPayFinal.addEventListener('click', function () {
    if (selectedMethod !== 'ach') return;

    identityIdTypeSelect.value = '';
    identityIdNumberInput.value = '';
    updateStartPaymentState();

    screenIdentityVerification.hidden = false;
  });

  // Identity verification -> volver al método de pago
  btnBackToPayment.addEventListener('click', function () {
    screenIdentityVerification.hidden = true;
  });

  // Identity verification, step: habilita "Continuar" cuando la cédula es válida
  function updateStartPaymentState() {
    const valid = identityIdTypeSelect.value !== '' && identityIdNumberInput.value.trim().length >= 5;
    btnStartPayment.disabled = !valid;
  }

  identityIdTypeSelect.addEventListener('change', updateStartPaymentState);
  identityIdNumberInput.addEventListener('input', updateStartPaymentState);

  // Identity verification -> muestra el banco preconfigurado por defecto para esa cédula
  function selectBankForDefault(bank) {
    selectedBank = bank;
    bankSelectedLogo.className = 'bank-logo dot-' + bank.key;
    bankSelectedLogo.textContent = bank.initials;
    bankSelectedName.textContent = bank.name;

    bankFavorites.querySelectorAll('.bank-favorite').forEach(function (el) {
      el.classList.toggle('selected', el.getAttribute('data-bank') === bank.key);
    });
  }

  btnStartPayment.addEventListener('click', function () {
    screenIdentityVerification.hidden = true;
    selectBankForDefault(DEFAULT_BANK);
    screenBankDefault.hidden = false;
  });

  // Banco por defecto -> volver a la verificación de identidad
  btnBackToIdentity.addEventListener('click', function () {
    screenBankDefault.hidden = true;
    screenIdentityVerification.hidden = false;
  });

  // Banco por defecto, step: elegir un banco distinto del listado siempre visible
  bankFavorites.addEventListener('click', function (e) {
    const favorite = e.target.closest('.bank-favorite');
    if (!favorite) return;

    selectBankForDefault({
      key: favorite.getAttribute('data-bank'),
      name: favorite.getAttribute('data-name'),
      initials: favorite.querySelector('.bank-logo').textContent
    });
  });

  // Banco por defecto -> notificación push simulada del banco
  btnConfirmBankDefault.addEventListener('click', function () {
    screenBankDefault.hidden = true;

    pushNotificationIcon.className = 'push-notification-icon dot-' + selectedBank.key;
    pushNotificationIcon.textContent = selectedBank.initials;
    pushNotificationTitle.textContent = selectedBank.name;

    screenPushNotification.hidden = false;
  });

  // Tocar la notificación abre la app del banco simulada en su biometría
  pushNotificationCard.addEventListener('click', function () {
    screenPushNotification.hidden = true;
    screenBiometric.hidden = false;
  });

  // Step: selección de la cuenta empresarial a debitar (preselecciona la cuenta principal
  // definida por el usuario en el onboarding y colapsa el listado completo)
  function selectAccountForBankApp(item) {
    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    item.classList.add('selected');

    accountSelectedDot.className = item.querySelector('.account-dot').className;
    accountSelectedName.textContent = item.querySelector('.account-name').textContent;
    accountSelectedBalance.textContent = item.querySelector('.account-balance').textContent;

    selectedAccount = {
      name: item.querySelector('.account-name').textContent,
      balance: item.getAttribute('data-balance')
    };

    bankAppAccountList.hidden = true;
  }

  // Step: la huella da acceso a la app del banco -> pantalla de cobro y cuentas empresariales
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    bankAppHeader.className = 'bank-app-header theme-' + selectedBank.key;
    bankAppName.textContent = selectedBank.name;

    const accountItems = bankAppAccountList.querySelectorAll('.account-item');
    let matched = null;
    accountItems.forEach(function (el) {
      if (el.querySelector('.account-name').textContent === DEFAULT_ACCOUNT_NAME) matched = el;
    });
    selectAccountForBankApp(matched || accountItems[0]);

    bankAppPaymentView.hidden = false;
    btnAuthorizePayment.hidden = false;
    bankAppConfirmView.hidden = true;
    btnReturnToMerchant.hidden = true;

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

  btnCloseBankApp.addEventListener('click', function () {
    screenBankApp.hidden = true;
  });

  // Step: mostrar/ocultar el listado para elegir una cuenta distinta a la principal
  btnChangeAccount.addEventListener('click', function () {
    bankAppAccountList.hidden = !bankAppAccountList.hidden;
  });

  bankAppAccountList.addEventListener('click', function (e) {
    const item = e.target.closest('.account-item');
    if (!item) return;
    selectAccountForBankApp(item);
  });

  // Step: autorizar pago desde el banco -> confirmación separada del aprobador interno
  // (distinto de la biometría, igual que en B6/aprobacion-whatsapp)
  btnAuthorizePayment.addEventListener('click', function () {
    screenBankApp.hidden = true;

    approverAmount.textContent = TOTAL_AMOUNT;
    approverCompanyName.textContent = BUYER_COMPANY;
    approverOrderRef.textContent = ORDER_NUMBER;
    approverCheckbox.checked = false;
    btnConfirmApproval.disabled = true;

    screenApproverConfirm.hidden = false;
  });

  approverCheckbox.addEventListener('change', function () {
    btnConfirmApproval.disabled = !approverCheckbox.checked;
  });

  // Step: el aprobador confirma -> el banco muestra el pago exitoso
  btnConfirmApproval.addEventListener('click', function () {
    screenApproverConfirm.hidden = true;

    bankAppPaymentView.hidden = true;
    btnAuthorizePayment.hidden = true;

    bankAppConfirmAmount.textContent = TOTAL_AMOUNT;
    bankAppConfirmAccount.textContent = selectedAccount
      ? selectedAccount.name + ' · Saldo: ' + selectedAccount.balance
      : '—';
    bankAppConfirmView.hidden = false;
    btnReturnToMerchant.hidden = false;

    screenBankApp.hidden = false;
  });

  // Step: regresar a la app del comercio que abrió el banco, en estado de espera
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
      confirmationOrderRef.textContent = ORDER_NUMBER;

      orderBody.hidden = true;
      btnGoToPay.hidden = true;
      confirmationBanner.hidden = false;
    }, 3000);
  });

  // Step: continuar comprando y reiniciar el flujo
  btnCloseConfirmation.addEventListener('click', function () {
    confirmationBanner.hidden = true;
    orderBody.hidden = false;
    btnGoToPay.hidden = false;

    paymentMethodList.querySelectorAll('.payment-method-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnGoToPayFinal.disabled = true;
    selectedMethod = null;
    selectedBank = null;
    selectedAccount = null;

    bankAppAccountList.hidden = true;
  });
})();
