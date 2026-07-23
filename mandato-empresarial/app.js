(function () {
  // =====================================================================
  // Enabler compartido: motor de mandatos/recurrencia (B2 · empresarial)
  //
  // Estructura de datos común a mandato-empresarial/ y mandato-domestico/:
  // { mandatoId, beneficiario, montoPactado, frecuencia, vigencia, tope,
  //   estadoMandato, ciclos: [{ fecha, monto, estado }] }
  //
  // estadoMandato recorre 5 estados explícitos:
  // 'propuesta' -> 'autorizacion_unica' -> 'activo' -> 'cobro_ciclo' -> 'cancelado'
  // (durante un ciclo puntual el estado del mandato en sí sigue siendo
  // 'activo'; 'cobro_ciclo' se registra a nivel del ciclo individual)
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
  const statusTime = document.getElementById('statusTime');
  const pushTime = document.getElementById('pushTime');

  const screenProvider = document.getElementById('screenProvider');
  const btnSendMandate = document.getElementById('btnSendMandate');

  const screenMandateRequest = document.getElementById('screenMandateRequest');
  const btnGoAuthorize = document.getElementById('btnGoAuthorize');

  const screenBiometric = document.getElementById('screenBiometric');
  const fingerprintTap = document.getElementById('fingerprintTap');

  const screenMandateActive = document.getElementById('screenMandateActive');
  const nextCycleDate = document.getElementById('nextCycleDate');
  const btnSimulateCycle = document.getElementById('btnSimulateCycle');
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

  const allScreens = [
    screenProvider, screenMandateRequest, screenBiometric, screenMandateActive,
    screenCycleNotification, screenCycleConfirmFull, screenCycleConfirmLight,
    screenCycleDone, screenManagement,
  ];

  function showScreen(screen) {
    allScreens.forEach(function (s) { s.hidden = s !== screen; });
  }

  statusTime.textContent = currentTime();

  // ===================== Paso 1: propuesta de mandato (proveedor) =====================
  btnSendMandate.addEventListener('click', function () {
    mandato.estadoMandato = 'propuesta';
    showScreen(screenMandateRequest);
  });

  // ===================== Paso 2: solicitud de autorización =====================
  btnGoAuthorize.addEventListener('click', function () {
    mandato.estadoMandato = 'autorizacion_unica';
    showScreen(screenBiometric);
  });

  // ===================== Paso 3: autorización única (firma + biometría) =====================
  function completeBiometric() {
    if (screenBiometric.hidden) return;
    screenBiometric.hidden = true;

    mandato.estadoMandato = 'activo';
    nextCycleDate.textContent = mandato.ciclos[0].fecha;
    showScreen(screenMandateActive);
  }

  fingerprintTap.addEventListener('click', completeBiometric);

  const biometricObserver = new MutationObserver(function () {
    if (!screenBiometric.hidden) {
      setTimeout(completeBiometric, 1500);
    }
  });
  biometricObserver.observe(screenBiometric, { attributes: true, attributeFilter: ['hidden'] });

  // ===================== Paso 4: mandato activo -> simular ciclos =====================
  btnSimulateCycle.addEventListener('click', function () {
    triggerCycleNotification(currentCycleIndex);
  });

  btnGoManageFromActive.addEventListener('click', function () {
    renderManagement();
    showScreen(screenManagement);
  });

  // ===================== Paso 5: notificación de cobro por ciclo =====================
  function triggerCycleNotification(index) {
    const ciclo = mandato.ciclos[index];
    pushTime.textContent = currentTime();
    pushNotificationText.textContent =
      'Ciclo ' + (index + 1) + ' del mandato con ' + mandato.beneficiario +
      ' por ' + formatCOP(ciclo.monto) + '. Toca para confirmar.';
    showScreen(screenCycleNotification);
  }

  pushNotificationCard.addEventListener('click', function () {
    const ciclo = mandato.ciclos[currentCycleIndex];

    if (currentCycleIndex === 0) {
      // Primer ciclo: confirmación más completa (muestra tope, cuenta, mandato).
      cycleFullEyebrow.textContent = 'Ciclo 1 · Confirmación de cobro';
      cycleFullTag.textContent = 'Ciclo 1 de ' + mandato.ciclos.length;
      cycleFullAmount.textContent = formatCOP(ciclo.monto);
      showScreen(screenCycleConfirmFull);
    } else {
      // Ciclos siguientes: confirmación ligera de un toque, sin biometría.
      cycleLightEyebrow.textContent = 'Ciclo ' + (currentCycleIndex + 1) + ' · Confirmación ligera';
      cycleLightAmount.textContent = formatCOP(ciclo.monto);
      showScreen(screenCycleConfirmLight);
    }
  });

  function completeCurrentCycle() {
    const ciclo = mandato.ciclos[currentCycleIndex];
    ciclo.estado = 'confirmado';

    cycleDoneAmount.textContent = formatCOP(ciclo.monto);
    cycleDoneLabel.textContent = 'Ciclo ' + (currentCycleIndex + 1) + ' confirmado y pagado';
    showScreen(screenCycleDone);
  }

  btnConfirmCycleFull.addEventListener('click', completeCurrentCycle);
  btnConfirmCycleLight.addEventListener('click', completeCurrentCycle);

  btnAfterCycle.addEventListener('click', function () {
    if (currentCycleIndex < mandato.ciclos.length - 1) {
      currentCycleIndex += 1;
      nextCycleDate.textContent = mandato.ciclos[currentCycleIndex].fecha;
      showScreen(screenMandateActive);
    } else {
      renderManagement();
      showScreen(screenManagement);
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
    showScreen(screenMandateActive);
  });

  btnCancelMandate.addEventListener('click', function () {
    mandato.estadoMandato = 'cancelado';
    renderManagement();
  });
})();
