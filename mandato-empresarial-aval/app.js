(function () {
  // =====================================================================
  // Enabler compartido: motor de mandatos/recurrencia (B2 · empresarial)
  // Vista dividida en dos teléfonos: Proveedor (izquierda) y Cliente
  // corporativo en su banca empresarial Banco Rojo de las Villas (derecha).
  // Cada acción del proveedor refleja un cambio en el teléfono del cliente
  // y viceversa, simulando ambos lados del mismo proceso a la vez.
  //
  // estadoMandato recorre 5 estados explícitos:
  // 'propuesta' -> 'autorizacion_unica' -> 'activo' -> 'cobro_ciclo' -> 'cancelado'
  // =====================================================================

  function formatCOP(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  function currentTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  const mandato = {
    mandatoId: 'MND-EMP-00482',
    beneficiario: 'Andina Insumos S.A.S.',
    montoPactado: 18500000,
    frecuencia: 'Mensual',
    vigencia: '12 meses / hasta cancelar',
    tope: 21000000,
    estadoMandato: 'propuesta',
    ciclos: [
      { fecha: '15 ago 2026', monto: 18500000, estado: 'pendiente' },
      { fecha: '15 sep 2026', monto: 18500000, estado: 'pendiente' },
    ],
  };

  let currentCycleIndex = 0; // ciclo que se está confirmando en este momento

  // ===================== Elements =====================
  const statusTimeProvider = document.getElementById('statusTimeProvider');
  const statusTimeClient = document.getElementById('statusTimeClient');
  const pushTime = document.getElementById('pushTime');

  // -- Proveedor --
  const screenProviderConfig = document.getElementById('screenProviderConfig');
  const btnSendMandate = document.getElementById('btnSendMandate');

  const screenProviderWaiting = document.getElementById('screenProviderWaiting');

  const screenProviderActive = document.getElementById('screenProviderActive');
  const providerActiveSub = document.getElementById('providerActiveSub');
  const providerNextCycleDate = document.getElementById('providerNextCycleDate');
  const btnSimulateCycle = document.getElementById('btnSimulateCycle');

  const screenProviderCycleWaiting = document.getElementById('screenProviderCycleWaiting');
  const providerCycleWaitingLabel = document.getElementById('providerCycleWaitingLabel');
  const providerCycleWaitingAmount = document.getElementById('providerCycleWaitingAmount');

  const screenProviderCycleDone = document.getElementById('screenProviderCycleDone');
  const providerCycleDoneAmount = document.getElementById('providerCycleDoneAmount');
  const providerCycleDoneLabel = document.getElementById('providerCycleDoneLabel');
  const btnProviderContinue = document.getElementById('btnProviderContinue');

  const screenProviderCancelled = document.getElementById('screenProviderCancelled');

  const providerScreens = [
    screenProviderConfig, screenProviderWaiting, screenProviderActive,
    screenProviderCycleWaiting, screenProviderCycleDone, screenProviderCancelled,
  ];

  // -- Cliente corporativo (banca empresarial) --
  const screenMandateRequest = document.getElementById('screenMandateRequest');
  const screenClientIdle = document.getElementById('screenClientIdle');
  const btnGoAuthorize = document.getElementById('btnGoAuthorize');

  const screenBiometric = document.getElementById('screenBiometric');
  const fingerprintTap = document.getElementById('fingerprintTap');

  const screenMandateActive = document.getElementById('screenMandateActive');
  const nextCycleDate = document.getElementById('nextCycleDate');
  const btnGoManageFromActive = document.getElementById('btnGoManageFromActive');

  const screenCycleNotification = document.getElementById('screenCycleNotification');
  const pushNotificationCard = document.getElementById('pushNotificationCard');
  const pushNotificationText = document.getElementById('pushNotificationText');

  const screenCycleConfirmFull = document.getElementById('screenCycleConfirmFull');
  const cycleFullEyebrow = document.getElementById('cycleFullEyebrow');
  const cycleFullTag = document.getElementById('cycleFullTag');
  const cycleFullAmount = document.getElementById('cycleFullAmount');
  const btnConfirmCycleFull = document.getElementById('btnConfirmCycleFull');

  const screenCycleConfirmLight = document.getElementById('screenCycleConfirmLight');
  const cycleLightEyebrow = document.getElementById('cycleLightEyebrow');
  const cycleLightAmount = document.getElementById('cycleLightAmount');
  const btnConfirmCycleLight = document.getElementById('btnConfirmCycleLight');

  const screenCycleDone = document.getElementById('screenCycleDone');
  const cycleDoneAmount = document.getElementById('cycleDoneAmount');
  const cycleDoneLabel = document.getElementById('cycleDoneLabel');
  const btnAfterCycle = document.getElementById('btnAfterCycle');

  const screenManagement = document.getElementById('screenManagement');
  const btnBackFromManagement = document.getElementById('btnBackFromManagement');
  const mgmtEstadoTag = document.getElementById('mgmtEstadoTag');
  const cycleHistory = document.getElementById('cycleHistory');
  const btnCancelMandate = document.getElementById('btnCancelMandate');
  const cancelConfirmBanner = document.getElementById('cancelConfirmBanner');

  const clientScreens = [
    screenMandateRequest, screenClientIdle, screenBiometric, screenMandateActive,
    screenCycleNotification, screenCycleConfirmFull, screenCycleConfirmLight,
    screenCycleDone, screenManagement,
  ];

  function showProviderScreen(screen) {
    providerScreens.forEach(function (s) { s.hidden = s !== screen; });
  }

  function showClientScreen(screen) {
    clientScreens.forEach(function (s) { s.hidden = s !== screen; });
  }

  statusTimeProvider.textContent = currentTime();
  statusTimeClient.textContent = currentTime();

  // Al iniciar, el cliente aún no tiene ninguna solicitud pendiente de este
  // proveedor; se pone en pantalla "idle" y la solicitud real llega al
  // enviar el mandato desde el proveedor.
  showClientScreen(screenClientIdle);

  // ===================== Paso 1: propuesta de mandato (proveedor) =====================
  btnSendMandate.addEventListener('click', function () {
    mandato.estadoMandato = 'propuesta';
    showProviderScreen(screenProviderWaiting);
    showClientScreen(screenMandateRequest);
  });

  // ===================== Paso 2: solicitud de autorización (cliente) =====================
  btnGoAuthorize.addEventListener('click', function () {
    mandato.estadoMandato = 'autorizacion_unica';
    showClientScreen(screenBiometric);
  });

  // ===================== Paso 3: autorización única (firma + biometría) =====================
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    mandato.estadoMandato = 'activo';
    nextCycleDate.textContent = mandato.ciclos[0].fecha;
    showClientScreen(screenMandateActive);

    providerActiveSub.textContent = 'El cliente autorizó el cobro recurrente. Puedes generar el cobro de cada ciclo cuando corresponda.';
    providerNextCycleDate.textContent = mandato.ciclos[0].fecha;
    showProviderScreen(screenProviderActive);
  }

  fingerprintTap.addEventListener('click', completeBiometric);

  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(completeBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  // ===================== Paso 4: proveedor genera el cobro del ciclo =====================
  btnSimulateCycle.addEventListener('click', function () {
    triggerCycleNotification(currentCycleIndex);
  });

  btnGoManageFromActive.addEventListener('click', function () {
    renderManagement();
    showClientScreen(screenManagement);
  });

  function triggerCycleNotification(index) {
    const ciclo = mandato.ciclos[index];
    pushTime.textContent = currentTime();
    pushNotificationText.textContent =
      'Ciclo ' + (index + 1) + ' del mandato con ' + mandato.beneficiario +
      ' por ' + formatCOP(ciclo.monto) + '. Toca para confirmar.';
    showClientScreen(screenCycleNotification);

    providerCycleWaitingLabel.textContent =
      'El cliente recibió una notificación en su banca empresarial para confirmar el cobro del ciclo ' + (index + 1) + '.';
    providerCycleWaitingAmount.textContent = formatCOP(ciclo.monto);
    showProviderScreen(screenProviderCycleWaiting);
  }

  // ===================== Paso 5: cliente confirma el cobro del ciclo =====================
  pushNotificationCard.addEventListener('click', function () {
    const ciclo = mandato.ciclos[currentCycleIndex];

    if (currentCycleIndex === 0) {
      // Primer ciclo: confirmación más completa (muestra tope, cuenta, mandato).
      cycleFullEyebrow.textContent = 'Ciclo 1 · Confirmación de cobro';
      cycleFullTag.textContent = 'Ciclo 1 de ' + mandato.ciclos.length;
      cycleFullAmount.textContent = formatCOP(ciclo.monto);
      showClientScreen(screenCycleConfirmFull);
    } else {
      // Ciclos siguientes: confirmación ligera de un toque, sin biometría.
      cycleLightEyebrow.textContent = 'Ciclo ' + (currentCycleIndex + 1) + ' · Confirmación ligera';
      cycleLightAmount.textContent = formatCOP(ciclo.monto);
      showClientScreen(screenCycleConfirmLight);
    }
  });

  function completeCurrentCycle() {
    const ciclo = mandato.ciclos[currentCycleIndex];
    ciclo.estado = 'confirmado';

    cycleDoneAmount.textContent = formatCOP(ciclo.monto);
    cycleDoneLabel.textContent = 'Ciclo ' + (currentCycleIndex + 1) + ' confirmado y pagado';
    showClientScreen(screenCycleDone);

    providerCycleDoneAmount.textContent = formatCOP(ciclo.monto);
    providerCycleDoneLabel.textContent = 'El cliente confirmó y pagó el ciclo ' + (currentCycleIndex + 1) + '.';
    showProviderScreen(screenProviderCycleDone);
  }

  btnConfirmCycleFull.addEventListener('click', completeCurrentCycle);
  btnConfirmCycleLight.addEventListener('click', completeCurrentCycle);

  btnAfterCycle.addEventListener('click', function () {
    if (currentCycleIndex < mandato.ciclos.length - 1) {
      currentCycleIndex += 1;
      nextCycleDate.textContent = mandato.ciclos[currentCycleIndex].fecha;
      showClientScreen(screenMandateActive);
    } else {
      renderManagement();
      showClientScreen(screenManagement);
    }
  });

  btnProviderContinue.addEventListener('click', function () {
    if (currentCycleIndex < mandato.ciclos.length - 1) {
      providerNextCycleDate.textContent = mandato.ciclos[currentCycleIndex + 1].fecha;
      providerActiveSub.textContent = 'El cliente autorizó el cobro recurrente. Puedes generar el cobro de cada ciclo cuando corresponda.';
      showProviderScreen(screenProviderActive);
    } else {
      providerActiveSub.textContent = 'Todos los ciclos programados ya fueron cobrados. El mandato sigue vigente para próximos ciclos.';
      showProviderScreen(screenProviderActive);
      btnSimulateCycle.disabled = true;
      btnSimulateCycle.textContent = 'Sin ciclos pendientes';
    }
  });

  // ===================== Paso 6: gestión / cancelación de mandato =====================
  function renderManagement() {
    mgmtEstadoTag.textContent = mandato.estadoMandato === 'cancelado' ? 'Mandato cancelado' : 'Mandato activo';
    mgmtEstadoTag.className = 'mandate-tag ' + (mandato.estadoMandato === 'cancelado' ? 'mandate-tag--cancelled' : 'mandate-tag--active');

    cycleHistory.innerHTML = '';
    mandato.ciclos.forEach(function (ciclo, i) {
      const item = document.createElement('div');
      item.className = 'cycle-history-item';

      const statusLabel = ciclo.estado === 'confirmado' ? 'Confirmado' : 'Pendiente';
      const statusClass = ciclo.estado === 'confirmado' ? '' : 'style="background:#fff3cd;color:#8a6d00"';

      item.innerHTML =
        '<span class="cycle-history-item__meta">' +
          '<span class="cycle-history-item__amount">Ciclo ' + (i + 1) + ' · ' + formatCOP(ciclo.monto) + '</span>' +
          '<span class="cycle-history-item__date">' + ciclo.fecha + '</span>' +
        '</span>' +
        '<span class="cycle-history-item__status" ' + statusClass + '>' + statusLabel + '</span>';

      cycleHistory.appendChild(item);
    });

    btnCancelMandate.hidden = mandato.estadoMandato === 'cancelado';
    cancelConfirmBanner.hidden = mandato.estadoMandato !== 'cancelado';
  }

  btnBackFromManagement.addEventListener('click', function () {
    showClientScreen(screenMandateActive);
  });

  btnCancelMandate.addEventListener('click', function () {
    mandato.estadoMandato = 'cancelado';
    renderManagement();
    showProviderScreen(screenProviderCancelled);
  });
})();
