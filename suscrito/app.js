(function () {
  const overlayBackdrop = document.getElementById('overlayBackdrop');

  const sheetPendingPayment = document.getElementById('sheetPendingPayment');
  const sheetBankSelection = document.getElementById('sheetBankSelection');
  const sheetAccountSelection = document.getElementById('sheetAccountSelection');
  const sheetPaymentConfirmed = document.getElementById('sheetPaymentConfirmed');

  const btnAuthorizePayment = document.getElementById('btnAuthorizePayment');
  const btnCancelPayment = document.getElementById('btnCancelPayment');
  const btnGoToPay = document.getElementById('btnGoToPay');
  const btnConfirmPayment = document.getElementById('btnConfirmPayment');
  const btnCloseConfirmation = document.getElementById('btnCloseConfirmation');

  const bankGrid = document.getElementById('bankGrid');
  const bankItemOther = document.getElementById('bankItemOther');
  const otherBanksSelect = document.getElementById('otherBanksSelect');

  const accountList = document.getElementById('accountList');
  const accountSelectionBankLabel = document.getElementById('accountSelectionBankLabel');

  const confirmBankName = document.getElementById('confirmBankName');
  const confirmAccountName = document.getElementById('confirmAccountName');
  const confirmDate = document.getElementById('confirmDate');

  let selectedBank = null;
  let selectedAccount = null;

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
  }

  function hideAllSheets() {
    [sheetPendingPayment, sheetBankSelection, sheetAccountSelection, sheetPaymentConfirmed].forEach(hideSheet);
    hideOverlay();
  }

  function resetFlow() {
    selectedBank = null;
    selectedAccount = null;

    bankGrid.querySelectorAll('.bank-item').forEach((item) => item.classList.remove('selected'));
    otherBanksSelect.hidden = true;
    otherBanksSelect.selectedIndex = 0;
    btnGoToPay.disabled = true;

    accountList.querySelectorAll('.account-item').forEach((item) => item.classList.remove('selected'));
    btnConfirmPayment.disabled = true;
  }

  // Show pending payment modal on load
  showSheet(sheetPendingPayment);

  btnCancelPayment.addEventListener('click', () => {
    hideAllSheets();
  });

  btnAuthorizePayment.addEventListener('click', () => {
    hideSheet(sheetPendingPayment);
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
    accountSelectionBankLabel.textContent = `Cuentas inscritas en ${selectedBank.name}`;
    hideSheet(sheetBankSelection);
    showSheet(sheetAccountSelection);
  });

  accountList.addEventListener('click', (event) => {
    const item = event.target.closest('.account-item');
    if (!item) return;

    accountList.querySelectorAll('.account-item').forEach((el) => el.classList.remove('selected'));
    item.classList.add('selected');

    selectedAccount = {
      key: item.dataset.account,
      type: item.querySelector('.account-type').textContent,
      number: item.querySelector('.account-number').textContent,
      balance: item.dataset.balance,
    };

    btnConfirmPayment.disabled = false;
  });

  btnConfirmPayment.addEventListener('click', () => {
    if (!selectedBank || !selectedAccount) return;

    confirmBankName.textContent = selectedBank.name;
    confirmAccountName.textContent = `${selectedAccount.type} ${selectedAccount.number}`;
    confirmDate.textContent = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    hideSheet(sheetAccountSelection);
    showSheet(sheetPaymentConfirmed);
  });

  btnCloseConfirmation.addEventListener('click', () => {
    hideAllSheets();
    resetFlow();
  });
})();
