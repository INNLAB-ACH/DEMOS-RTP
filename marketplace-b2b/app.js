(function () {
  const screenOrder = document.getElementById('screenOrder');
  const orderBody = document.getElementById('orderBody');
  const screenPayment = document.getElementById('screenPayment');
  const paymentBody = document.getElementById('paymentBody');
  const paymentWaiting = document.getElementById('paymentWaiting');
  const screenRoleSelector = document.getElementById('screenRoleSelector');
  const screenBankApp = document.getElementById('screenBankApp');
  const screenApproverConfirm = document.getElementById('screenApproverConfirm');
  const screenBiometric = document.getElementById('screenBiometric');
  const confirmationBanner = document.getElementById('confirmationBanner');

  const btnGoToPay = document.getElementById('btnGoToPay');
  const btnBackToCart = document.getElementById('btnBackToCart');

  const paymentMethodList = document.getElementById('paymentMethodList');
  const btnGoToPayFinal = document.getElementById('btnGoToPayFinal');

  const btnBackToPaymentFromRole = document.getElementById('btnBackToPaymentFromRole');
  const roleCompanyName = document.getElementById('roleCompanyName');
  const btnConfirmRole = document.getElementById('btnConfirmRole');

  const screenBankPicker = document.getElementById('screenBankPicker');
  const btnBackToRole = document.getElementById('btnBackToRole');
  const bankFavorites = document.getElementById('bankFavorites');

  const screenIdentityVerification = document.getElementById('screenIdentityVerification');
  const btnBackToBankPicker = document.getElementById('btnBackToBankPicker');
  const identityBankName = document.getElementById('identityBankName');
  const authMethodList = document.getElementById('authMethodList');
  const authFieldEmail = document.getElementById('authFieldEmail');
  const authFieldPhone = document.getElementById('authFieldPhone');
  const authFieldId = document.getElementById('authFieldId');
  const identityEmailInput = document.getElementById('identityEmailInput');
  const identityPhoneInput = document.getElementById('identityPhoneInput');
  const identityIdTypeSelect = document.getElementById('identityIdTypeSelect');
  const identityIdNumberInput = document.getElementById('identityIdNumberInput');
  const btnStartPayment = document.getElementById('btnStartPayment');

  const screenPushNotification = document.getElementById('screenPushNotification');
  const pushNotificationCard = document.getElementById('pushNotificationCard');
  const pushNotificationIcon = document.getElementById('pushNotificationIcon');
  const pushNotificationTitle = document.getElementById('pushNotificationTitle');

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

  let selectedMethod = null;
  let selectedBank = null;
  let selectedAccount = null;
  let authMethod = 'email';

  roleCompanyName.textContent = BUYER_COMPANY;

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

  // Step 2 -> selector de rol empresarial: solo "Cóbrame con ACH" dispara el flujo
  btnGoToPayFinal.addEventListener('click', function () {
    if (selectedMethod !== 'ach') return;
    screenRoleSelector.hidden = false;
  });

  btnBackToPaymentFromRole.addEventListener('click', function () {
    screenRoleSelector.hidden = true;
  });

  // Selector de rol -> confirma "comprando en nombre de" y sigue al banco
  btnConfirmRole.addEventListener('click', function () {
    bankFavorites.querySelectorAll('.bank-favorite').forEach(function (el) {
      el.classList.remove('selected');
    });
    selectedBank = null;

    screenRoleSelector.hidden = true;
    screenBankPicker.hidden = false;
  });

  // Bank picker -> volver al selector de rol
  btnBackToRole.addEventListener('click', function () {
    screenBankPicker.hidden = true;
    screenRoleSelector.hidden = false;
  });

  // Step 3: elegir banco favorito abre la verificación de identidad
  bankFavorites.addEventListener('click', function (e) {
    const favorite = e.target.closest('.bank-favorite');
    if (!favorite) return;

    const bankKey = favorite.getAttribute('data-bank');
    const bankName = favorite.getAttribute('data-name');

    selectedBank = {
      key: bankKey,
      name: bankName,
      initials: favorite.querySelector('.bank-logo').textContent
    };

    identityBankName.textContent = selectedBank.name;
    identityEmailInput.value = '';
    identityPhoneInput.value = '';
    identityIdTypeSelect.value = '';
    identityIdNumberInput.value = '';
    selectAuthMethod('email');

    screenBankPicker.hidden = true;
    screenIdentityVerification.hidden = false;
  });

  // Identity verification -> volver al selector de banco
  btnBackToBankPicker.addEventListener('click', function () {
    screenIdentityVerification.hidden = true;
    screenBankPicker.hidden = false;
  });

  // Identity verification, step: elegir cómo autenticarse (correo, celular o cédula)
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

  // Identity verification, step: habilita "Iniciar pago" cuando el campo activo es válido
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
    btnStartPayment.disabled = !valid;
  }

  identityEmailInput.addEventListener('input', updateStartPaymentState);
  identityPhoneInput.addEventListener('input', updateStartPaymentState);
  identityIdTypeSelect.addEventListener('change', updateStartPaymentState);
  identityIdNumberInput.addEventListener('input', updateStartPaymentState);

  // Identity verification -> notificación push simulada del banco
  btnStartPayment.addEventListener('click', function () {
    screenIdentityVerification.hidden = true;

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

  // Step: la huella da acceso a la app del banco -> pantalla de cobro y cuentas empresariales
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

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

  // Step: selección de cuenta empresarial a debitar
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
  });
})();
