(function () {
  // ===================== Estado del trámite (mock) =====================
  // Esquema mínimo de metadata del trámite, según spec:
  // { tipoTramite, entidadEmisora, numeroRadicado, nombreCiudadano, fechaLimite,
  //   monto, paid }
  const tramite = {
    tipoTramite: 'Copago consulta médica · Medicina General',
    entidadEmisora: 'EPS Sanitas',
    entidadCodigo: 'SANITAS',
    numeroRadicado: 'RAD-2026-71042',
    nombreCiudadano: 'María Fernanda Ríos',
    fechaLimite: '30/07/2026',
    monto: 45000,
    paid: false
  };

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  function trazabilidadId(entidadCodigo, numeroRadicado) {
    // Referencia de trazabilidad simulada, cruzada con el radicado del trámite.
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return 'TRZ-' + entidadCodigo + '-' + numeroRadicado.replace('RAD-', '') + '-' + suffix;
  }

  // ===================== Referencias a elementos =====================
  const screenPushNotification = document.getElementById('screenPushNotification');
  const pushNotificationCard = document.getElementById('pushNotificationCard');
  const pushNotificationIcon = document.getElementById('pushNotificationIcon');
  const pushNotificationTitle = document.getElementById('pushNotificationTitle');
  const pushNotificationSubtitle = document.getElementById('pushNotificationSubtitle');
  const pushNotificationAmount = document.getElementById('pushNotificationAmount');

  const screenTramiteDetail = document.getElementById('screenTramiteDetail');
  const btnBackToNotification = document.getElementById('btnBackToNotification');
  const detailTipoTramite = document.getElementById('detailTipoTramite');
  const detailEntidadEmisora = document.getElementById('detailEntidadEmisora');
  const detailNumeroRadicado = document.getElementById('detailNumeroRadicado');
  const detailNombreCiudadano = document.getElementById('detailNombreCiudadano');
  const detailFechaLimite = document.getElementById('detailFechaLimite');
  const detailMonto = document.getElementById('detailMonto');
  const btnPayTramite = document.getElementById('btnPayTramite');

  const screenBankApp = document.getElementById('screenBankApp');
  const btnCloseBankApp = document.getElementById('btnCloseBankApp');
  const bankAppPaymentView = document.getElementById('bankAppPaymentView');
  const bankAppTipoTramite = document.getElementById('bankAppTipoTramite');
  const bankAppAmount = document.getElementById('bankAppAmount');
  const bankAppEntidad = document.getElementById('bankAppEntidad');
  const bankAppTramiteMeta = document.getElementById('bankAppTramiteMeta');
  const bankAppAccountList = document.getElementById('bankAppAccountList');
  const btnAuthorizePayment = document.getElementById('btnAuthorizePayment');
  const bankAppConfirmView = document.getElementById('bankAppConfirmView');
  const bankAppConfirmAmount = document.getElementById('bankAppConfirmAmount');
  const bankAppConfirmConcept = document.getElementById('bankAppConfirmConcept');
  const bankAppConfirmAccount = document.getElementById('bankAppConfirmAccount');
  const btnReturnToNotification = document.getElementById('btnReturnToNotification');

  const screenBiometric = document.getElementById('screenBiometric');
  const fingerprintTap = document.getElementById('fingerprintTap');

  const screenTrazabilidad = document.getElementById('screenTrazabilidad');
  const trazabilidadSub = document.getElementById('trazabilidadSub');
  const trazTipoTramite = document.getElementById('trazTipoTramite');
  const trazNumeroRadicado = document.getElementById('trazNumeroRadicado');
  const trazMonto = document.getElementById('trazMonto');
  const trazAccount = document.getElementById('trazAccount');
  const trazTrazabilidadId = document.getElementById('trazTrazabilidadId');
  const btnCloseTrazabilidad = document.getElementById('btnCloseTrazabilidad');

  let selectedAccount = null;

  // ===================== Paso 1: notificación del trámite (sin pedir datos) =====================
  function renderNotification() {
    pushNotificationTitle.textContent = tramite.entidadEmisora;
    pushNotificationSubtitle.textContent = tramite.tipoTramite;
    pushNotificationAmount.textContent = formatCOP(tramite.monto);
  }

  renderNotification();

  pushNotificationCard.addEventListener('click', function () {
    openTramiteDetail();
  });

  // ===================== Paso 2: detalle del trámite con datos precargados =====================
  function openTramiteDetail() {
    detailTipoTramite.textContent = tramite.tipoTramite;
    detailEntidadEmisora.textContent = tramite.entidadEmisora;
    detailNumeroRadicado.textContent = tramite.numeroRadicado;
    detailNombreCiudadano.textContent = tramite.nombreCiudadano;
    detailFechaLimite.textContent = tramite.fechaLimite;
    detailMonto.textContent = formatCOP(tramite.monto);

    screenPushNotification.hidden = true;
    screenTramiteDetail.hidden = false;
  }

  btnBackToNotification.addEventListener('click', function () {
    screenTramiteDetail.hidden = true;
    screenPushNotification.hidden = false;
  });

  // ===================== Paso 2 -> 3: pagar con RTP (abre la app del banco directamente) =====================
  btnPayTramite.addEventListener('click', function () {
    bankAppTipoTramite.textContent = tramite.tipoTramite;
    bankAppAmount.textContent = formatCOP(tramite.monto);
    bankAppEntidad.textContent = tramite.entidadEmisora;
    bankAppTramiteMeta.textContent = 'Radicado ' + tramite.numeroRadicado + ' · Límite ' + tramite.fechaLimite;

    screenTramiteDetail.hidden = true;
    screenBiometric.hidden = false;
  });

  // ===================== Biometría -> app del banco con selección de cuenta =====================
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    bankAppAccountList.querySelectorAll('.account-item').forEach(function (el) {
      el.classList.remove('selected');
    });
    btnAuthorizePayment.disabled = true;
    selectedAccount = null;

    bankAppPaymentView.hidden = false;
    btnAuthorizePayment.hidden = false;
    bankAppConfirmView.hidden = true;
    btnReturnToNotification.hidden = true;

    screenBankApp.hidden = false;
  }

  fingerprintTap.addEventListener('click', completeBiometric);

  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(completeBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  btnCloseBankApp.addEventListener('click', function () {
    screenBankApp.hidden = true;
    screenTramiteDetail.hidden = false;
  });

  // ===================== Selección de cuenta a debitar =====================
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

  // ===================== Autorización desde el banco =====================
  btnAuthorizePayment.addEventListener('click', function () {
    bankAppPaymentView.hidden = true;
    btnAuthorizePayment.hidden = true;

    bankAppConfirmAmount.textContent = formatCOP(tramite.monto);
    bankAppConfirmConcept.textContent = tramite.tipoTramite;
    bankAppConfirmAccount.textContent = selectedAccount
      ? selectedAccount.name + ' · Saldo: ' + selectedAccount.balance
      : '—';
    bankAppConfirmView.hidden = false;
    btnReturnToNotification.hidden = false;
  });

  // ===================== Continuar -> confirmación final con trazabilidad =====================
  btnReturnToNotification.addEventListener('click', function () {
    screenBankApp.hidden = true;

    // Marca el trámite como pagado en el estado.
    tramite.paid = true;

    trazTipoTramite.textContent = tramite.tipoTramite;
    trazNumeroRadicado.textContent = tramite.numeroRadicado;
    trazMonto.textContent = formatCOP(tramite.monto);
    trazAccount.textContent = selectedAccount ? selectedAccount.name : '—';
    trazabilidadSub.textContent = 'Trámite pagado — trazabilidad enviada a ' + tramite.entidadEmisora + '.';
    trazTrazabilidadId.textContent = trazabilidadId(tramite.entidadCodigo, tramite.numeroRadicado);

    screenTrazabilidad.hidden = false;
  });

  // ===================== Cerrar confirmación -> volver a la notificación inicial =====================
  btnCloseTrazabilidad.addEventListener('click', function () {
    screenTrazabilidad.hidden = true;
    screenTramiteDetail.hidden = true;

    selectedAccount = null;

    screenPushNotification.hidden = false;
  });
})();
