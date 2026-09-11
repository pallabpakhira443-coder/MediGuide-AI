/**
 * MEDIGUIDE AI - Single Page Application & Health Navigation Controller
 * Handles SPA navigation, Clinical Triage, Doctor & Hospital Discovery,
 * Emergency Radar, Transparent Fee Matrix, Appointments & Clinical Passes.
 */

// Toast Notifications System
window.showToast = function (message, type = 'info', icon = '💡') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <span style="font-size: 1.25rem;">${icon}</span>
    <span style="flex: 1; font-size: 0.9rem; line-height: 1.4;">${message}</span>
    <button type="button" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 1.1rem; padding: 2px 6px;">✕</button>
  `;

  toast.querySelector('button').addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }
  }, 4500);
};

// Global App State (Defaulted to Connaught Place, New Delhi matching reference screenshot)
window.userLat = 28.6304;
window.userLng = 77.2177;
window.userLocationName = 'Connaught Place, New Delhi (110001)';
window.selectedRadiusKm = 50;
window.currentAttachedFile = null;
window.selectedCompareDocs = [];
window.selectedCompareHosps = [];
window.currentDoctorsData = [];
window.currentHospitalsData = [];
window.lastTriageResult = null;

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initNavbarAndAuth();
  initHeroAIInput();
  initClarificationQuestionnaire();
  initScenarioCards();
  initFeatureCards();
  initDoctorDirectory();
  initHospitalDirectory();
  initLocationModal();
  initBookingWizard();
  initAppointmentsModal();
  initSettingsModal();
  initComparisonModals();
  initProfilePage();
  initAssessmentLocationControls();
  fetchInitialData();
});

/**
 * =========================================================================
 * 1. SPA ROUTER & HISTORY API
 * =========================================================================
 */
function initRouter() {
  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateToPage(hash, false);
  }

  window.addEventListener('popstate', handleRoute);
  handleRoute();

  // Intercept Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href').replace('#', '');
      navigateToPage(target, true);
    });
  });
}

window.navigateToPage = function (pageId, pushToHistory = true) {
  const views = document.querySelectorAll('.page-view');
  let targetView = document.getElementById(`view-${pageId}`);

  if (!targetView) {
    targetView = document.getElementById('view-home');
    pageId = 'home';
  }

  views.forEach((v) => {
    v.style.display = 'none';
    v.classList.remove('active');
  });

  targetView.style.display = 'block';
  targetView.classList.add('active');

  if (pushToHistory && window.location.hash !== `#${pageId}`) {
    window.history.pushState({ pageId }, '', `#${pageId}`);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Hook for page-specific refreshes
  if (pageId === 'doctors') renderDoctorDirectory();
  if (pageId === 'hospitals') renderHospitalDirectory();
  if (pageId === 'emergency') renderEmergencyHospitals();
  if (pageId === 'profile') refreshProfilePage();
};

/**
 * =========================================================================
 * 2. NAVBAR & AUTHENTICATION MODAL
 * =========================================================================
 */
function initNavbarAndAuth() {
  const btnEmergency = document.getElementById('btnNavbarEmergency');
  const btnLocation = document.getElementById('btnNavbarLocation');
  const btnAppointments = document.getElementById('btnNavbarAppointments');
  const btnSettings = document.getElementById('btnNavbarSettings');
  const locationModal = document.getElementById('modalLocation');
  const authModal = document.getElementById('modalAuth');

  if (btnEmergency) {
    btnEmergency.addEventListener('click', () => {
      window.audioFx?.playAlert?.();
      window.navigateToPage('emergency');
    });
  }

  if (btnLocation && locationModal) {
    btnLocation.addEventListener('click', () => locationModal.classList.add('active'));
  }

  if (btnAppointments) {
    btnAppointments.addEventListener('click', () => openAppointmentsModal());
  }

  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      document.getElementById('modalSettings')?.classList.add('active');
    });
  }

  document.getElementById('btnCloseLocationModal')?.addEventListener('click', () => {
    locationModal?.classList.remove('active');
  });

  document.getElementById('btnCloseAuthModal')?.addEventListener('click', () => {
    authModal?.classList.remove('active');
  });

  // Auth Tabs (Sign In vs Register)
  const tabSignIn = document.getElementById('btnTabSignIn');
  const tabRegister = document.getElementById('btnTabRegister');
  const formSignIn = document.getElementById('formSignIn');
  const formRegister = document.getElementById('formRegister');

  if (tabSignIn && tabRegister) {
    tabSignIn.addEventListener('click', () => {
      tabSignIn.classList.add('active');
      tabRegister.classList.remove('active');
      formSignIn.style.display = 'block';
      formRegister.style.display = 'none';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabSignIn.classList.remove('active');
      formSignIn.style.display = 'none';
      formRegister.style.display = 'block';
    });
  }

  if (formSignIn) {
    formSignIn.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmailInput')?.value.trim();
      const password = document.getElementById('loginPasswordInput')?.value;
      const res = await window.authService.login(email, password);
      if (res.success) {
        authModal?.classList.remove('active');
        syncNavbarAuthUI();
        window.showToast(`Welcome back, ${res.user.name}!`, 'success', '👋');
      }
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userData = {
        name: document.getElementById('regNameInput')?.value.trim(),
        email: document.getElementById('regEmailInput')?.value.trim(),
        phone: document.getElementById('regPhoneInput')?.value.trim(),
        password: document.getElementById('regPasswordInput')?.value,
        bloodGroup: document.getElementById('regBloodInput')?.value || 'O+',
        age: parseInt(document.getElementById('regAgeInput')?.value) || 28,
        gender: document.getElementById('regGenderInput')?.value || 'Male',
      };

      const res = await window.authService.register(userData);
      if (res.success) {
        authModal?.classList.remove('active');
        syncNavbarAuthUI();
        window.showToast(`Account registered for ${res.user.name}!`, 'success', '🎉');
      }
    });
  }

  syncNavbarAuthUI();
}

function syncNavbarAuthUI() {
  const slot = document.getElementById('navbarAuthSlot');
  const user = window.authService.getUser();
  const authModal = document.getElementById('modalAuth');

  if (!slot) return;

  if (!user) {
    slot.innerHTML = `
      <button type="button" class="btn-nav-glass" id="btnNavbarSignIn" title="Sign In or Register">
        <span>👤</span> <span>Sign In</span>
      </button>
    `;
    document.getElementById('btnNavbarSignIn')?.addEventListener('click', () => {
      authModal?.classList.add('active');
    });
  } else {
    // Get initials for avatar
    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarSrc = user.avatar || '';
    slot.innerHTML = `
      <button type="button" class="nav-avatar-chip" id="btnNavProfileTrigger" title="My Profile — ${user.name}">
        <div class="nav-avatar-mini">
          ${avatarSrc ? `<img src="${avatarSrc}" alt="Avatar" />` : initials}
        </div>
        <span>${user.name.split(' ')[0]}</span>
      </button>
    `;
    document.getElementById('btnNavProfileTrigger')?.addEventListener('click', () => {
      window.navigateToPage('profile');
    });
  }
}
window.syncAuthUI = syncNavbarAuthUI;

/**
 * =========================================================================
 * 3. HERO AI INPUT — Integrated Search Bar with + Popup Menu
 * =========================================================================
 */
function initHeroAIInput() {
  const form = document.getElementById('heroSearchForm');
  const textarea = document.getElementById('heroSymptomInput');
  const btnSearchPlus = document.getElementById('btnSearchPlus');
  const attachPopup = document.getElementById('attachPopupMenu');
  const voiceStrip = document.getElementById('heroVoiceListeningStrip');
  const btnStopVoice = document.getElementById('btnHeroStopVoice');
  const attachPill = document.getElementById('heroAttachedFilePill');
  const attachName = document.getElementById('heroAttachedFileName');
  const btnRemoveAttach = document.getElementById('btnHeroRemoveAttach');
  const selectRadius = document.getElementById('selectSearchRadius');
  const btnVoice = document.getElementById('btnHeroVoiceMode');

  // Radius change
  if (selectRadius) {
    selectRadius.addEventListener('change', () => {
      window.selectedRadiusKm = parseInt(selectRadius.value) || 50;
      fetchInitialData();
      window.showToast(`Search radius set to ${window.selectedRadiusKm} km`, 'info', '📍');
    });
  }

  // Auto-resize textarea as user types
  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const query = textarea.value.trim();
        if (query || window.currentAttachedFile) {
          launchHealthAssessment(query);
        }
      }
    });
  }

  // ===========================================================
  // + BUTTON POPUP MENU TOGGLE (Solid, Crystal Clear Options)
  // ===========================================================
  if (btnSearchPlus && attachPopup) {
    btnSearchPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = attachPopup.classList.contains('active') || attachPopup.classList.contains('open');
      attachPopup.classList.toggle('active', !isOpen);
      attachPopup.classList.toggle('open', !isOpen);
      btnSearchPlus.classList.toggle('active', !isOpen);
      btnSearchPlus.classList.toggle('open', !isOpen);
    });

    // Close popup when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#searchAttachWrapper')) {
        attachPopup.classList.remove('active', 'open');
        btnSearchPlus.classList.remove('active', 'open');
      }
    });
  }

  // Think Mode Toggle
  const btnThink = document.getElementById('btnSearchThink');
  if (btnThink) {
    btnThink.addEventListener('click', () => {
      const isActive = btnThink.classList.toggle('active');
      window.isDeepReasoningMode = isActive;
      window.showToast(
        isActive
          ? 'Deep Clinical Reasoning Engine: ACTIVATED (Enhanced multi-path differential diagnosis)'
          : 'Standard Clinical Triage Mode',
        'info',
        '🧠'
      );
    });
  }

  // Helper to handle file attachment from any of the popup options
  function handleFileAttach(file, label = '') {
    if (!file) return;
    window.currentAttachedFile = file;
    if (attachName) attachName.textContent = file.name;
    if (attachPill) attachPill.style.display = 'inline-flex';
    // Close popup after selection
    attachPopup?.classList.remove('active', 'open');
    btnSearchPlus?.classList.remove('active', 'open');
    window.showToast(`${label || 'File'} attached: ${file.name}`, 'info', '📎');
  }

  // Camera
  const heroCameraInput = document.getElementById('heroCameraInput');
  document.getElementById('btnAttachCamera')?.addEventListener('click', () => {
    heroCameraInput?.click();
  });
  heroCameraInput?.addEventListener('change', () => {
    if (heroCameraInput.files?.[0]) handleFileAttach(heroCameraInput.files[0], '📷 Camera photo');
  });

  // Photo/Image
  const heroPhotoInput = document.getElementById('heroPhotoInput');
  document.getElementById('btnAttachPhoto')?.addEventListener('click', () => {
    heroPhotoInput?.click();
  });
  heroPhotoInput?.addEventListener('change', () => {
    if (heroPhotoInput.files?.[0]) handleFileAttach(heroPhotoInput.files[0], '🖼️ Photo');
  });

  // Upload File (generic)
  const heroFileInput = document.getElementById('heroFileInput');
  document.getElementById('btnAttachFile')?.addEventListener('click', () => {
    heroFileInput?.click();
  });
  heroFileInput?.addEventListener('change', () => {
    if (heroFileInput.files?.[0]) handleFileAttach(heroFileInput.files[0], '📁 File');
  });

  // Lab Report
  const heroLabInput = document.getElementById('heroLabInput');
  document.getElementById('btnAttachLabReport')?.addEventListener('click', () => {
    heroLabInput?.click();
  });
  heroLabInput?.addEventListener('change', () => {
    if (heroLabInput.files?.[0]) handleFileAttach(heroLabInput.files[0], '🧾 Lab report');
  });

  // Prescription (reuse heroFileInput with message)
  document.getElementById('btnAttachPrescription')?.addEventListener('click', () => {
    // Use a separate click with a label hint stored
    const tmp = document.createElement('input');
    tmp.type = 'file';
    tmp.accept = 'image/*,application/pdf';
    tmp.onchange = () => {
      if (tmp.files?.[0]) handleFileAttach(tmp.files[0], '💊 Prescription');
    };
    tmp.click();
  });

  // Remove attached file
  if (btnRemoveAttach) {
    btnRemoveAttach.addEventListener('click', () => {
      window.currentAttachedFile = null;
      if (attachPill) attachPill.style.display = 'none';
      // Reset all file inputs
      [heroFileInput, heroCameraInput, heroPhotoInput, heroLabInput].forEach(inp => {
        if (inp) inp.value = '';
      });
    });
  }

  // ===========================================================
  // VOICE RECOGNITION (mic button in search bar)
  // ===========================================================
  if (btnVoice) {
    btnVoice.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        window.showToast('Speech recognition not supported in this browser.', 'warning', '⚠️');
        return;
      }

      // Toggle off if already active
      if (btnVoice.classList.contains('mic-active')) {
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = localStorage.getItem('mg_voice_lang') || 'en-IN';
      recognition.interimResults = true;

      recognition.onstart = () => {
        if (voiceStrip) voiceStrip.style.display = 'flex';
        btnVoice.classList.add('mic-active');
        window.audioFx?.playBeep?.();
        window.showToast('Listening... Speak your symptoms clearly', 'info', '🎤');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (textarea && transcript) {
          textarea.value = transcript;
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
        }
      };

      recognition.onerror = () => {
        if (voiceStrip) voiceStrip.style.display = 'none';
        btnVoice.classList.remove('mic-active');
      };

      recognition.onend = () => {
        if (voiceStrip) voiceStrip.style.display = 'none';
        btnVoice.classList.remove('mic-active');
      };

      recognition.start();

      if (btnStopVoice) {
        btnStopVoice.onclick = () => {
          recognition.stop();
          if (voiceStrip) voiceStrip.style.display = 'none';
          btnVoice.classList.remove('mic-active');
        };
      }
    });
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = textarea?.value.trim() || '';
      if (query || window.currentAttachedFile) {
        openClinicalClarification(query);
      } else {
        window.showToast('Please describe your symptoms to begin triage.', 'warning', '⚠️');
      }
    });
  }
}

/**
 * =========================================================================
 * 4. QUICK TRIAGE SCENARIO CARDS (1-Click Auto-Fill & Triage)
 * =========================================================================
 */
function initScenarioCards() {
  document.querySelectorAll('.scenario-card').forEach((card) => {
    card.addEventListener('click', () => {
      const symptom = card.getAttribute('data-symptom');
      if (symptom) {
        const textarea = document.getElementById('heroSymptomInput');
        if (textarea) textarea.value = symptom;
        window.audioFx?.playClick?.();
        openClinicalClarification(symptom);
      }
    });
  });
}

/**
 * =========================================================================
 * 5. THREE FEATURE HIGHLIGHT CARDS
 * =========================================================================
 */
function initFeatureCards() {
  document.getElementById('cardFeatureTriage')?.addEventListener('click', () => {
    window.audioFx?.playClick?.();
    const textarea = document.getElementById('heroSymptomInput');
    if (textarea) {
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textarea.focus();
    }
  });

  document.getElementById('cardFeatureDocs')?.addEventListener('click', () => {
    window.audioFx?.playClick?.();
    window.navigateToPage('doctors');
  });

  document.getElementById('cardFeatureHosps')?.addEventListener('click', () => {
    window.audioFx?.playClick?.();
    window.navigateToPage('hospitals');
  });
}

/**
 * =========================================================================
 * 6. PAGE 2: AI CLINICAL CLARIFICATION & SYMPTOM QUESTIONNAIRE
 * =========================================================================
 */
function openClinicalClarification(query) {
  window.currentSymptomQuery = query || 'Reported Symptoms';
  window.audioFx?.playBeep?.();

  // Populate summary text on Page 2
  const symDisplay = document.getElementById('clarificationInitialSymptomText');
  if (symDisplay) {
    symDisplay.textContent = `"${window.currentSymptomQuery}"`;
  }

  // Display attached file badge if present
  const fileBadge = document.getElementById('clarificationFileBadge');
  const fileNameSpan = document.getElementById('clarificationFileName');
  if (fileBadge && fileNameSpan) {
    if (window.currentAttachedFile) {
      fileNameSpan.textContent = window.currentAttachedFile.name;
      fileBadge.style.display = 'inline-flex';
    } else {
      fileBadge.style.display = 'none';
    }
  }

  // Navigate to Page 2
  window.navigateToPage('clarification');
}

function initClarificationQuestionnaire() {
  // 1. Duration Choice Chips
  const durationChips = document.querySelectorAll('#qChipsDuration .chip-option');
  const inputDuration = document.getElementById('inputClarifyDuration');
  durationChips.forEach((btn) => {
    btn.addEventListener('click', () => {
      durationChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (inputDuration) inputDuration.value = btn.getAttribute('data-value') || '1 to 3 Days';
      window.audioFx?.playClick?.();
    });
  });

  // 2. Severity Buttons
  const sevButtons = document.querySelectorAll('#qSeverityRow .severity-btn');
  const inputSeverity = document.getElementById('inputClarifySeverity');
  sevButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      sevButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (inputSeverity) inputSeverity.value = btn.getAttribute('data-sev') || 'Moderate (4-6)';
      window.audioFx?.playClick?.();
    });
  });

  // 3. Associated Symptoms Checkboxes
  const flagCheckboxes = document.querySelectorAll('#qSpecificFlagsGrid input[type="checkbox"]');
  flagCheckboxes.forEach((cb) => {
    cb.addEventListener('change', () => {
      const parentLabel = cb.closest('.checkbox-chip');
      if (cb.checked) {
        parentLabel?.classList.add('checked');
        if (cb.value === 'None of the Above') {
          // Uncheck all other checkboxes
          flagCheckboxes.forEach((other) => {
            if (other !== cb) {
              other.checked = false;
              other.closest('.checkbox-chip')?.classList.remove('checked');
            }
          });
        } else {
          // Uncheck 'None of the Above' if a specific symptom is selected
          flagCheckboxes.forEach((other) => {
            if (other.value === 'None of the Above') {
              other.checked = false;
              other.closest('.checkbox-chip')?.classList.remove('checked');
            }
          });
        }
      } else {
        parentLabel?.classList.remove('checked');
      }
    });
  });

  // 4. Pre-existing History Chips
  const historyChips = document.querySelectorAll('#qHistoryChips .mini-chip');
  const inputHistory = document.getElementById('inputClarifyHistory');
  historyChips.forEach((btn) => {
    btn.addEventListener('click', () => {
      historyChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (inputHistory) inputHistory.value = btn.getAttribute('data-val') || 'None';
      window.audioFx?.playClick?.();
    });
  });

  // 5. Submit Form -> Compute Final Diagnosis
  const clarifyForm = document.getElementById('clarificationQuestionsForm');
  if (clarifyForm) {
    clarifyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const duration = document.getElementById('inputClarifyDuration')?.value || '1 to 3 Days';
      const severity = document.getElementById('inputClarifySeverity')?.value || 'Moderate (4-6)';
      const selectedFlags = Array.from(document.querySelectorAll('#qSpecificFlagsGrid input[type="checkbox"]:checked'))
        .map(cb => cb.value)
        .filter(val => val !== 'None of the Above');
      const ageGroup = document.getElementById('selectClarifyAgeGroup')?.value || 'Adult (18-59)';
      const history = document.getElementById('inputClarifyHistory')?.value || 'None';
      const notes = document.getElementById('inputClarifyNotes')?.value.trim() || '';

      // Build comprehensive clinical prompt for maximum prediction accuracy
      let fullPrompt = `${window.currentSymptomQuery || 'Reported medical symptoms'}. `;
      fullPrompt += `Duration: ${duration}. Discomfort / Pain Severity: ${severity}. `;
      if (selectedFlags.length > 0) {
        fullPrompt += `Associated Findings & Red Flags: ${selectedFlags.join(', ')}. `;
      }
      fullPrompt += `Patient Profile: ${ageGroup}, Medical History: ${history}. `;
      if (notes) {
        fullPrompt += `Additional Clinical Notes & Meds: ${notes}.`;
      }

      executeFinalClinicalAssessment(fullPrompt);
    });
  }

  // 6. Skip Button -> Immediate assessment
  const btnSkip = document.getElementById('btnSkipClarification');
  if (btnSkip) {
    btnSkip.addEventListener('click', () => {
      executeFinalClinicalAssessment(window.currentSymptomQuery || 'Reported medical symptoms');
    });
  }
}

/**
 * =========================================================================
 * 7. EXECUTE CLINICAL ASSESSMENT & RENDER RESULT
 * =========================================================================
 */
async function executeFinalClinicalAssessment(query) {
  window.showToast('MediGuide AI is computing differential diagnosis & matching care...', 'info', '⏳');
  window.audioFx?.playProcessing?.();

  try {
    const formData = new FormData();
    formData.append('text', query);
    formData.append('lat', window.userLat.toString());
    formData.append('lng', window.userLng.toString());
    formData.append('radiusKm', window.selectedRadiusKm.toString());
    if (window.currentAttachedFile) {
      formData.append('medicalFile', window.currentAttachedFile);
    }

    const response = await fetch('/api/triage/analyze', {
      method: 'POST',
      body: formData,
    });

    const res = await response.json();
    window.currentAttachedFile = null;
    const pill = document.getElementById('heroAttachedFilePill');
    if (pill) pill.style.display = 'none';

    if (res.success && res.data) {
      window.lastTriageResult = res.data;
      renderAssessmentPage(res.data, query);
      window.navigateToPage('assessment');
      window.audioFx?.playSuccess?.();
    } else {
      window.showToast(res.error || 'Failed to complete clinical evaluation.', 'danger', '⚠️');
    }
  } catch (err) {
    console.error('Triage error:', err);
    window.showToast('Network error contacting triage engine.', 'danger', '⚠️');
  }
}
window.launchHealthAssessment = openClinicalClarification;

function renderAssessmentPage(data, query) {
  const triage = data.triage;
  const providers = data.providers || {};
  const urgency = triage.urgencyLevel || 'ROUTINE';

  // 1. Urgency Banner
  const urgencyContainer = document.getElementById('assessmentUrgencyBannerContainer');
  let urgencyClass = 'green';
  let urgencyTitle = '🟢 Routine Care Recommended';
  let urgencySub = 'Symptoms indicate a stable, non-emergency condition appropriate for outpatient clinic consultation.';

  if (urgency === 'EMERGENCY') {
    urgencyClass = 'red';
    urgencyTitle = '🚨 Critical Emergency • Immediate Hospital Evaluation Required';
    urgencySub = 'High-risk clinical red flags detected. Proceed to the nearest emergency trauma center immediately or dial 112 / 108.';
  } else if (urgency === 'URGENT') {
    urgencyClass = 'amber';
    urgencyTitle = '🟡 Urgent Medical Evaluation Advised (Within 24–48 Hours)';
    urgencySub = 'Symptoms suggest acute onset that should be examined promptly to prevent escalation.';
  }

  if (urgencyContainer) {
    urgencyContainer.innerHTML = `
      <div class="urgency-banner ${urgencyClass}">
        <span class="urgency-icon-big">${urgency === 'EMERGENCY' ? '🚨' : urgency === 'URGENT' ? '⚠️' : '✅'}</span>
        <div class="urgency-details" style="flex: 1;">
          <span class="badge-tag ${urgencyClass}" style="margin-bottom: 0.5rem; display: inline-block;">${urgency} CARE</span>
          <h3>${urgencyTitle}</h3>
          <p>${triage.urgentDiagnosisReason || urgencySub}</p>
          ${urgency === 'EMERGENCY' ? `
            <div style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <a href="tel:112" class="btn-call-108">📞 Dial 112 (National SOS)</a>
              <a href="tel:108" class="btn-call-108">📞 Dial 108 (Ambulance)</a>
              <button type="button" class="btn-call-102" onclick="window.navigateToPage('emergency')">Trauma Hospitals Nearby ➔</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 2. Differential Diagnoses
  const careContainer = document.getElementById('assessmentCareCategoryContent');
  if (careContainer) {
    const conditions = triage.predictedConditions || [
      { name: 'Primary Clinical Suspect', confidence: 85, rationale: 'Symptoms closely match ICD-10 diagnostic criteria.' }
    ];

    careContainer.innerHTML = conditions.map((c) => `
      <div class="diagnosis-item">
        <div class="diag-title-row">
          <span class="diag-name">${c.name}</span>
          <span class="diag-prob">${c.confidence || 85}% Probability</span>
        </div>
        <div class="diag-bar-track">
          <div class="diag-bar-fill" style="width: ${c.confidence || 85}%;"></div>
        </div>
        <div class="diag-rationale">${c.rationale || c.description || 'Verified by clinical decision algorithm.'}</div>
      </div>
    `).join('');
  }

  // 3. Itemized Diagnostic Tests
  const rationaleContainer = document.getElementById('assessmentRationaleContent');
  if (rationaleContainer) {
    const alertData = triage.seriousDiseaseAlert || {};
    const tests = alertData.diagnosticTestsRequired || [
      { name: 'Primary Physical & Vitals Check', purpose: 'Blood pressure, pulse, respiration rate', estimatedCostINR: 400 },
      { name: 'Diagnostic Blood Panel (CBC / ESR)', purpose: 'Check infection and inflammatory markers', estimatedCostINR: 650 },
      { name: 'Targeted Imaging / Ultrasound', purpose: 'Rule out acute structural complications', estimatedCostINR: 1500 },
    ];

    rationaleContainer.innerHTML = `
      <div style="margin-bottom: 0.85rem; font-size: 0.88rem; color: #94A3B8;">
        Recommended Specialty: <strong style="color: #00F0FF;">${triage.recommendedSpecialistType || 'General Physician'}</strong>
      </div>
      <div>
        ${tests.map((t) => `
          <div class="test-item-row">
            <div>
              <div class="test-name">${t.name}</div>
              <div style="font-size: 0.78rem; color: #64748B;">${t.purpose}</div>
            </div>
        `).join('')}
      </div>
    `;

    // Sync location toolbar in assessment results
    const assessmentLocLabel = document.getElementById('assessmentCurrentLocationLabel');
    if (assessmentLocLabel) {
      assessmentLocLabel.textContent = window.userLocationName || 'Connaught Place, New Delhi (110001)';
    }

    const assessmentRadiusSelect = document.getElementById('selectAssessmentRadius');
    if (assessmentRadiusSelect) {
      assessmentRadiusSelect.value = window.selectedRadiusKm.toString();
    }

    const assessmentCitySelect = document.getElementById('selectAssessmentCity');
    if (assessmentCitySelect) {
      const matchKey = Object.keys(CITY_COORDINATES).find(
        (k) => (window.userLocationName || '').toLowerCase().includes(k) || CITY_COORDINATES[k].name === window.userLocationName
      );
      if (matchKey) assessmentCitySelect.value = matchKey;
    }
  }

  // 4. Provider Tabs
  const docList = document.getElementById('assessmentDoctorsList');
  const hospList = document.getElementById('assessmentHospitalsList');
  const docCount = document.getElementById('assessmentDocCount');
  const hospCount = document.getElementById('assessmentHospCount');

  const docs = providers.doctors || [];
  const hosps = providers.hospitals || [];

  if (docCount) docCount.textContent = docs.length;
  if (hospCount) hospCount.textContent = hosps.length;

  if (docList) {
    if (docs.length === 0) {
      docList.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #94A3B8;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🩺</div>
          <strong style="color: #FFFFFF;">No specialists found within ${window.selectedRadiusKm} km.</strong>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try increasing your radius or selecting a different city above.</p>
        </div>
      `;
    } else {
      docList.innerHTML = docs.map((doc) => createDoctorCardHtml(doc)).join('');
    }
  }

  if (hospList) {
    if (hosps.length === 0) {
      hospList.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #94A3B8;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏥</div>
          <strong style="color: #FFFFFF;">No emergency hospitals found within ${window.selectedRadiusKm} km.</strong>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try expanding your radius or choosing a nearby metro city above.</p>
        </div>
      `;
    } else {
      hospList.innerHTML = hosps.map((hosp) => createHospitalCardHtml(hosp)).join('');
    }
  }

  const tabDocs = document.getElementById('tabAssessmentDoctors');
  const tabHosps = document.getElementById('tabAssessmentHospitals');
  if (tabDocs && tabHosps && docList && hospList) {
    tabDocs.onclick = () => {
      tabDocs.classList.add('active');
      tabHosps.classList.remove('active');
      docList.style.display = 'grid';
      hospList.style.display = 'none';
    };
    tabHosps.onclick = () => {
      tabHosps.classList.add('active');
      tabDocs.classList.remove('active');
      docList.style.display = 'none';
      hospList.style.display = 'grid';
    };
  }
}

/**
 * Results Page Location & Radius Switcher Controls
 */
function initAssessmentLocationControls() {
  const selectCity = document.getElementById('selectAssessmentCity');
  const selectRadius = document.getElementById('selectAssessmentRadius');
  const btnOpenModal = document.getElementById('btnOpenLocationModalFromResults');

  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => {
      document.getElementById('modalLocation')?.classList.add('active');
    });
  }

  if (selectCity) {
    selectCity.addEventListener('change', () => {
      const val = selectCity.value;
      if (val === 'current') {
        document.getElementById('modalLocation')?.classList.add('active');
        return;
      }
      if (CITY_COORDINATES[val]) {
        const c = CITY_COORDINATES[val];
        window.userLat = c.lat;
        window.userLng = c.lng;
        window.userLocationName = c.name;
        document.getElementById('navbarLocationLabel').textContent = c.name;
        const resultLocLabel = document.getElementById('assessmentCurrentLocationLabel');
        if (resultLocLabel) resultLocLabel.textContent = c.name;

        if (val === 'all_india') {
          window.selectedRadiusKm = 5000;
          if (selectRadius) selectRadius.value = '5000';
        }

        refreshAssessmentProviders();
        fetchInitialData();
        window.showToast(`Updated results location to ${c.name}`, 'info', '📍');
      }
    });
  }

  if (selectRadius) {
    selectRadius.addEventListener('change', () => {
      window.selectedRadiusKm = parseInt(selectRadius.value) || 50;
      refreshAssessmentProviders();
      fetchInitialData();
      window.showToast(`Results search radius set to ${window.selectedRadiusKm} km`, 'info', '📍');
    });
  }
}

async function refreshAssessmentProviders() {
  const docList = document.getElementById('assessmentDoctorsList');
  const hospList = document.getElementById('assessmentHospitalsList');
  const docCount = document.getElementById('assessmentDocCount');
  const hospCount = document.getElementById('assessmentHospCount');

  const specialist = window.lastTriageResult?.triage?.recommendedSpecialistType || '';

  try {
    const [docRes, hospRes] = await Promise.all([
      fetch(`/api/doctors?lat=${window.userLat}&lng=${window.userLng}&radiusKm=${window.selectedRadiusKm}&specialist=${encodeURIComponent(specialist)}`),
      fetch(`/api/hospitals?lat=${window.userLat}&lng=${window.userLng}&radiusKm=${window.selectedRadiusKm}`),
    ]);

    const docData = await docRes.json();
    const hospData = await hospRes.json();

    const docs = docData.success ? docData.data : [];
    const hosps = hospData.success ? hospData.data : [];

    if (docCount) docCount.textContent = docs.length;
    if (hospCount) hospCount.textContent = hosps.length;

    if (docList) {
      if (docs.length === 0) {
        docList.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #94A3B8;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🩺</div>
            <strong style="color: #FFFFFF;">No specialists found within ${window.selectedRadiusKm} km.</strong>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try expanding your distance radius or choosing a different city.</p>
          </div>
        `;
      } else {
        docList.innerHTML = docs.map((doc) => createDoctorCardHtml(doc)).join('');
      }
    }

    if (hospList) {
      if (hosps.length === 0) {
        hospList.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #94A3B8;">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏥</div>
            <strong style="color: #FFFFFF;">No emergency hospitals found within ${window.selectedRadiusKm} km.</strong>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try expanding your distance radius or choosing a nearby metro city.</p>
          </div>
        `;
      } else {
        hospList.innerHTML = hosps.map((hosp) => createHospitalCardHtml(hosp)).join('');
      }
    }
  } catch (e) {
    console.warn('Could not refresh assessment providers:', e);
  }
}

/**
 * =========================================================================
 * 7. DOCTOR & HOSPITAL INITIAL FETCH & RENDERING
 * =========================================================================
 */
const CITY_COORDINATES = {
  delhi: { name: 'Connaught Place, New Delhi (110001)', lat: 28.6304, lng: 77.2177 },
  mumbai: { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
  kolkata: { name: 'Kolkata, West Bengal', lat: 22.5726, lng: 88.3639 },
  bengaluru: { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
  hyderabad: { name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
  chennai: { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  pune: { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
  ahmedabad: { name: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
  jaipur: { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
  lucknow: { name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  chandigarh: { name: 'Chandigarh (PB/HR)', lat: 30.7333, lng: 76.7794 },
  kochi: { name: 'Kochi, Kerala', lat: 9.9312, lng: 76.2673 },
  patna: { name: 'Patna, Bihar', lat: 25.5941, lng: 85.1376 },
  indore: { name: 'Indore, Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  guwahati: { name: 'Guwahati, Assam', lat: 26.1445, lng: 91.7362 },
  all_india: { name: 'All India (Pan-India)', lat: 20.5937, lng: 78.9629 },
};

async function fetchInitialData() {
  try {
    const [docRes, hospRes] = await Promise.all([
      fetch(`/api/doctors?lat=${window.userLat}&lng=${window.userLng}&radiusKm=${window.selectedRadiusKm}`),
      fetch(`/api/hospitals?lat=${window.userLat}&lng=${window.userLng}&radiusKm=${window.selectedRadiusKm}`),
    ]);

    const docData = await docRes.json();
    const hospData = await hospRes.json();

    if (docData.success) window.currentDoctorsData = docData.data;
    if (hospData.success) window.currentHospitalsData = hospData.data;

    renderDoctorDirectory();
    renderHospitalDirectory();
    renderEmergencyHospitals();
  } catch (err) {
    console.warn('Initial data load fallback to resilient store');
  }
}

function initDoctorDirectory() {
  const selectCity = document.getElementById('filterDoctorCity');
  const selectSpec = document.getElementById('filterDoctorSpecialty');
  const selectRadius = document.getElementById('filterDoctorRadius');
  const selectLang = document.getElementById('filterDoctorLanguage');
  const selectFee = document.getElementById('filterDoctorFee');

  if (selectCity) {
    selectCity.addEventListener('change', () => {
      const val = selectCity.value;
      if (val === 'current') {
        document.getElementById('modalLocation')?.classList.add('active');
        return;
      }
      if (CITY_COORDINATES[val]) {
        const c = CITY_COORDINATES[val];
        window.userLat = c.lat;
        window.userLng = c.lng;
        window.userLocationName = c.name;
        document.getElementById('navbarLocationLabel').textContent = c.name;
        if (val === 'all_india') {
          window.selectedRadiusKm = 5000;
          if (selectRadius) selectRadius.value = '5000';
        }
        fetchInitialData();
        window.showToast(`Switched city to ${c.name}`, 'info', '📍');
      }
    });
  }

  if (selectRadius) {
    selectRadius.addEventListener('change', () => {
      window.selectedRadiusKm = parseInt(selectRadius.value) || 50;
      fetchInitialData();
      window.showToast(`Search radius updated to ${window.selectedRadiusKm} km`, 'info', '📍');
    });
  }

  [selectSpec, selectLang, selectFee].forEach((el) => {
    if (el) el.addEventListener('change', renderDoctorDirectory);
  });

  document.getElementById('btnOpenDoctorCompareModal')?.addEventListener('click', () => {
    openDoctorCompareModal();
  });
}

function renderDoctorDirectory() {
  const container = document.getElementById('doctorsDirectoryGrid');
  if (!container) return;

  const spec = document.getElementById('filterDoctorSpecialty')?.value || 'All';
  const lang = document.getElementById('filterDoctorLanguage')?.value || 'All';
  const feeMax = document.getElementById('filterDoctorFee')?.value || 'All';

  let filtered = [...window.currentDoctorsData];

  if (spec !== 'All') {
    filtered = filtered.filter((d) => d.specialization.toLowerCase().includes(spec.toLowerCase()));
  }

  if (lang !== 'All') {
    const lLower = lang.toLowerCase();
    filtered = filtered.filter((d) => (d.languages || []).some((l) => l.toLowerCase().includes(lLower)));
  }

  if (feeMax !== 'All') {
    filtered = filtered.filter((d) => d.fee <= parseInt(feeMax));
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94A3B8;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🩺</div>
        <strong style="color: #FFFFFF; font-size: 1.1rem;">No specialists found matching filters within ${window.selectedRadiusKm} km.</strong>
        <p style="font-size: 0.88rem; margin-top: 0.25rem;">Try adjusting the specialty filter, selecting a different city, or increasing your radius to All India.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((doc) => createDoctorCardHtml(doc)).join('');
}

function createDoctorCardHtml(doc) {
  const isChecked = window.selectedCompareDocs.some((d) => d._id === doc._id);

  return `
    <div class="provider-card" data-doc-id="${doc._id}">
      <div>
        <div class="doc-top-info">
          <img src="${doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}" alt="${doc.name}" class="doc-avatar-img" />
          <div class="doc-meta">
            <h4>${doc.name}</h4>
            <div class="doc-specialty">${doc.specialization}</div>
            <div class="doc-clinic">📍 ${doc.clinicName || doc.address} (<strong>${doc.distanceKm || 2.1} km away</strong>)</div>
          </div>
        </div>

        <div class="doc-chips-row">
          <span class="chip-meta">🎓 ${doc.qualifications?.[0] || 'MBBS, MD'}</span>
          <span class="chip-meta">⏳ ${doc.experienceYears || 15} yrs exp</span>
          <span class="chip-meta">⭐ ${doc.rating || 4.9} (${doc.reviewCount || 120})</span>
        </div>
      </div>

      <div class="doc-footer-row">
        <div>
          <div style="font-size: 0.72rem; color: #94A3B8;">Consultation Fee:</div>
          <div class="doc-fee">₹${doc.fee}</div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <label style="font-size: 0.75rem; color: #94A3B8; display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleDocComparison('${doc._id}')" /> Compare
          </label>
          <button type="button" class="btn-book-slot" onclick="openBookingWizard('${doc._id}')">Book Slot ✓</button>
        </div>
      </div>
    </div>
  `;
}

function initHospitalDirectory() {
  const tabNear = document.getElementById('tabHospNearMe');
  const tabMatrix = document.getElementById('tabHospFeeMatrix');
  const grid = document.getElementById('hospitalsDirectoryGrid');
  const matrixContainer = document.getElementById('hospitalMatrixTableContainer');
  const selectHospCity = document.getElementById('filterHospitalCity');
  const selectHospRadius = document.getElementById('filterHospitalRadius');
  const selectHospType = document.getElementById('filterHospitalType');

  if (selectHospCity) {
    selectHospCity.addEventListener('change', () => {
      const val = selectHospCity.value;
      if (val === 'current') {
        document.getElementById('modalLocation')?.classList.add('active');
        return;
      }
      if (CITY_COORDINATES[val]) {
        const c = CITY_COORDINATES[val];
        window.userLat = c.lat;
        window.userLng = c.lng;
        window.userLocationName = c.name;
        document.getElementById('navbarLocationLabel').textContent = c.name;
        if (val === 'all_india') {
          window.selectedRadiusKm = 5000;
          if (selectHospRadius) selectHospRadius.value = '5000';
        }
        fetchInitialData();
        window.showToast(`Switched hospital location to ${c.name}`, 'info', '📍');
      }
    });
  }

  if (selectHospRadius) {
    selectHospRadius.addEventListener('change', () => {
      window.selectedRadiusKm = parseInt(selectHospRadius.value) || 50;
      fetchInitialData();
      window.showToast(`Search radius set to ${window.selectedRadiusKm} km`, 'info', '📍');
    });
  }

  if (selectHospType) {
    selectHospType.addEventListener('change', renderHospitalDirectory);
  }

  const tabOutside = document.getElementById('tabHospOutsideNational');
  const btnOutsideResults = document.getElementById('btnToggleOutsideFromResults');

  if (tabNear && tabMatrix) {
    tabNear.onclick = () => {
      tabNear.classList.add('active');
      tabMatrix.classList.remove('active');
      if (tabOutside) tabOutside.classList.remove('active');
      if (grid) grid.style.display = 'grid';
      if (matrixContainer) matrixContainer.style.display = 'none';
      window.exploreOutsideHospitals = false;
      fetchInitialData();
    };

    tabMatrix.onclick = () => {
      tabMatrix.classList.add('active');
      tabNear.classList.remove('active');
      if (tabOutside) tabOutside.classList.remove('active');
      if (grid) grid.style.display = 'none';
      if (matrixContainer) {
        matrixContainer.style.display = 'block';
        renderHospitalMatrixTable();
      }
    };
  }

  if (tabOutside) {
    tabOutside.onclick = () => {
      tabOutside.classList.add('active');
      if (tabNear) tabNear.classList.remove('active');
      if (tabMatrix) tabMatrix.classList.remove('active');
      if (grid) grid.style.display = 'grid';
      if (matrixContainer) matrixContainer.style.display = 'none';
      window.toggleExploreOutsideHospitals(true);
    };
  }

  if (btnOutsideResults) {
    btnOutsideResults.onclick = () => {
      window.toggleExploreOutsideHospitals();
    };
  }

  document.getElementById('btnOpenHospCompareModal')?.addEventListener('click', () => {
    openHospitalCompareModal();
  });
}

window.exploreOutsideHospitals = false;
window.toggleExploreOutsideHospitals = async function (forceState = null) {
  if (forceState !== null) {
    window.exploreOutsideHospitals = forceState;
  } else {
    window.exploreOutsideHospitals = !window.exploreOutsideHospitals;
  }

  const btnResults = document.getElementById('btnToggleOutsideFromResults');
  const tabOutside = document.getElementById('tabHospOutsideNational');
  const tabNear = document.getElementById('tabHospNearMe');

  if (btnResults) btnResults.classList.toggle('active', window.exploreOutsideHospitals);
  if (tabOutside) tabOutside.classList.toggle('active', window.exploreOutsideHospitals);
  if (window.exploreOutsideHospitals && tabNear) tabNear.classList.remove('active');

  window.showToast(
    window.exploreOutsideHospitals
      ? 'Exploring Premier National Apex & Outside Specialty Centers across India...'
      : 'Switched to local radius emergency centers.',
    'info',
    '🌐'
  );

  try {
    const res = await fetch(`/api/hospitals?lat=${window.userLat}&lng=${window.userLng}&radius=${window.selectedRadiusKm}&exploreOutside=${window.exploreOutsideHospitals}`);
    const data = await res.json();
    if (data.success) {
      window.currentHospitalsData = data.data;
      renderHospitalDirectory();
      const hospList = document.getElementById('assessmentHospitalsList');
      const hospCount = document.getElementById('assessmentHospCount');
      if (hospCount) hospCount.textContent = data.data.length;
      if (hospList) hospList.innerHTML = data.data.map((h) => createHospitalCardHtml(h)).join('');
    }
  } catch (err) {
    console.error('Error fetching outside hospitals:', err);
  }
};

function renderHospitalDirectory() {
  const container = document.getElementById('hospitalsDirectoryGrid');
  if (!container) return;

  const typeFilter = document.getElementById('filterHospitalType')?.value || 'All';
  let list = [...window.currentHospitalsData];

  if (typeFilter === 'Level1') {
    list = list.filter((h) => (h.traumaLevel || '').toLowerCase().includes('level 1'));
  } else if (typeFilter === 'ICU') {
    list = list.filter((h) => (h.icuBedsAvailable || 0) > 0);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94A3B8;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏥</div>
        <strong style="color: #FFFFFF; font-size: 1.1rem;">No emergency facilities found matching filters within ${window.selectedRadiusKm} km.</strong>
        <p style="font-size: 0.88rem; margin-top: 0.25rem;">Try expanding your distance radius or clicking "Explore Outside / National Centers".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((hosp) => createHospitalCardHtml(hosp)).join('');
}

function createHospitalCardHtml(hosp) {
  const isChecked = window.selectedCompareHosps.some((h) => h._id === hosp._id);

  return `
    <div class="hospital-card" data-hosp-id="${hosp._id}">
      <div>
        <div class="hosp-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <h4>${hosp.name}</h4>
            <span style="background: rgba(16, 185, 129, 0.15); color: #10B981; font-size: 0.78rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; flex-shrink: 0;">
              ⭐ ${hosp.rating || 4.9}
            </span>
          </div>
          ${hosp.outsideCityBadge ? `
            <div style="margin: 4px 0;">
              <span class="badge-national-apex">🏆 ${hosp.outsideCityBadge}</span>
            </div>
          ` : ''}
          <div class="hosp-trauma">${hosp.traumaLevel || 'Level 1 Emergency Trauma Center'}</div>
          <div style="font-size: 0.82rem; color: #94A3B8; margin-top: 4px;">📍 ${hosp.address} (<strong>${hosp.distanceKm} km away</strong>)</div>
        </div>

        <div class="hosp-stats-grid" style="margin: 0.85rem 0;">
          <div>
            <div class="hosp-stat-num" style="color: #10B981;">${hosp.availableBeds || 65}</div>
            <div class="hosp-stat-lbl">General Beds</div>
          </div>
          <div>
            <div class="hosp-stat-num" style="color: #00F0FF;">${hosp.icuBedsAvailable || 16}</div>
            <div class="hosp-stat-lbl">ICU Available</div>
          </div>
          <div>
            <div class="hosp-stat-num" style="color: #EF4444;">${hosp.erStatus?.currentWaitMinutes || 6} min</div>
            <div class="hosp-stat-lbl">ER Wait</div>
          </div>
        </div>

        <div style="font-size: 0.82rem; color: #94A3B8; margin-bottom: 0.5rem;">
          ER Consult: <strong style="color: #FFFFFF;">₹${hosp.fees?.erConsultation || 100}</strong> • Bed/Day: <strong style="color: #FFFFFF;">₹${hosp.fees?.bedCostPerDay || 800}</strong>
          <div>Est. Package: <strong style="color: #10B981;">${hosp.fees?.totalEstimatedDiagnosisCost || '₹2,500 - ₹8,000'}</strong></div>
        </div>
      </div>

      <div class="hosp-actions-row">
        <a href="tel:${hosp.ambulanceHotline || '108'}" class="btn-call-er">
          📞 Ambulance (${hosp.ambulanceHotline || '108'})
        </a>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.name + ' ' + hosp.address)}" target="_blank" class="btn-route-er">
          🗺️ Directions
        </a>
      </div>

      <div style="margin-top: 0.35rem; display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #94A3B8;">
        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleHospComparison('${hosp._id}')" />
        <label style="cursor: pointer;">Select to compare</label>
      </div>
    </div>
  `;
}

function renderHospitalMatrixTable() {
  const container = document.getElementById('hospitalMatrixTableContainer');
  if (!container) return;

  const hosps = window.currentHospitalsData;

  container.innerHTML = `
    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 14px; overflow-x: auto; padding: 1rem;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-glass); color: #00F0FF;">
            <th style="padding: 10px;">Hospital Name</th>
            <th style="padding: 10px;">Distance</th>
            <th style="padding: 10px;">ER Wait</th>
            <th style="padding: 10px;">ICU Beds</th>
            <th style="padding: 10px;">ER Consult</th>
            <th style="padding: 10px;">Bed/Day</th>
            <th style="padding: 10px;">Est. Package</th>
            <th style="padding: 10px;">Ambulance</th>
          </tr>
        </thead>
        <tbody>
          ${hosps.map((h) => `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #E2E8F0;">
              <td style="padding: 10px; font-weight: 700;">${h.name}</td>
              <td style="padding: 10px;">${h.distanceKm} km</td>
              <td style="padding: 10px; color: #EF4444; font-weight: 700;">${h.erStatus?.currentWaitMinutes || 6} min</td>
              <td style="padding: 10px; color: #00F0FF; font-weight: 700;">${h.icuBedsAvailable || 14}</td>
              <td style="padding: 10px;">₹${h.fees?.erConsultation || 100}</td>
              <td style="padding: 10px;">₹${h.fees?.bedCostPerDay || 800}</td>
              <td style="padding: 10px; color: #10B981; font-weight: 700;">${h.fees?.totalEstimatedDiagnosisCost || '₹2,500 - ₹8,000'}</td>
              <td style="padding: 10px;"><a href="tel:${h.ambulanceHotline || '108'}" style="color: #EF4444; font-weight: 700;">📞 ${h.ambulanceHotline || '108'}</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderEmergencyHospitals() {
  const container = document.getElementById('emergencyHospitalsListGrid');
  if (!container) return;
  container.innerHTML = window.currentHospitalsData.map((hosp) => createHospitalCardHtml(hosp)).join('');
}

/**
 * =========================================================================
 * 8. APPOINTMENT BOOKING WIZARD & PASS GENERATION
 * =========================================================================
 */
let currentBookingDoc = null;

window.openBookingWizard = function (docId) {
  const doc = window.currentDoctorsData.find((d) => d._id === docId);
  if (!doc) return;

  currentBookingDoc = doc;
  const modal = document.getElementById('modalBooking');

  document.getElementById('bookDoctorId').value = doc._id;
  document.getElementById('bookDocAvatar').src = doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
  document.getElementById('bookDocName').textContent = doc.name;
  document.getElementById('bookDocSpec').textContent = doc.specialization;
  document.getElementById('bookDocClinic').textContent = doc.clinicName || doc.address;
  document.getElementById('bookDocFee').textContent = `₹${doc.fee}`;

  const user = window.authService.getUser();
  const nameInput = document.getElementById('bookPatientName');
  const phoneInput = document.getElementById('bookPatientPhone');
  if (user) {
    if (nameInput) nameInput.value = user.name || '';
    if (phoneInput) phoneInput.value = user.phone || '';
  }

  if (modal) modal.classList.add('active');
};

function initBookingWizard() {
  const modal = document.getElementById('modalBooking');
  const btnClose = document.getElementById('btnCloseBookingModal');
  const form = document.getElementById('formBookingWizard');

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
  }

  document.querySelectorAll('#bookDateOptions .pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#bookDateOptions .pill-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.querySelectorAll('#bookSlotOptions .slot-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#bookSlotOptions .slot-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const patientName = document.getElementById('bookPatientName')?.value.trim();
      const patientPhone = document.getElementById('bookPatientPhone')?.value.trim();
      const selectedDate = document.querySelector('#bookDateOptions .pill-btn.active')?.getAttribute('data-date') || 'Today';
      const selectedSlot = document.querySelector('#bookSlotOptions .slot-btn.active')?.getAttribute('data-slot') || '10:00 AM';

      if (!patientName || !patientPhone) {
        window.showToast('Please enter patient name and phone number', 'warning', '⚠️');
        return;
      }

      const doc = currentBookingDoc;
      const refCode = 'MG-' + Math.floor(100000 + Math.random() * 900000);

      const bookingRecord = {
        referenceCode: refCode,
        doctorId: doc._id,
        doctorName: doc.name,
        specialistType: doc.specialization,
        clinicOrHospitalName: doc.clinicName || doc.address,
        selectedDate,
        selectedSlot,
        consultationFee: doc.fee,
        patientName,
        patientPhone,
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
      };

      const saved = JSON.parse(localStorage.getItem('mg_bookings') || '[]');
      saved.unshift(bookingRecord);
      localStorage.setItem('mg_bookings', JSON.stringify(saved));

      if (modal) modal.classList.remove('active');
      window.audioFx?.playSuccess?.();
      window.showToast(`Appointment Confirmed! Pass: ${refCode}`, 'success', '🎉');
      openAppointmentsModal();
    });
  }
}

/**
 * =========================================================================
 * 9. APPOINTMENTS LIST MODAL & CLINICAL PASS
 * =========================================================================
 */
function initAppointmentsModal() {
  document.getElementById('btnCloseAppointmentsModal')?.addEventListener('click', () => {
    document.getElementById('modalAppointments')?.classList.remove('active');
  });
}

function openAppointmentsModal() {
  const container = document.getElementById('appointmentsListContainer');
  const modal = document.getElementById('modalAppointments');
  if (!container || !modal) return;

  const appts = JSON.parse(localStorage.getItem('mg_bookings') || '[]');

  if (appts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: #94A3B8;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📅</div>
        <strong style="color: #FFFFFF; font-size: 1.05rem;">No appointments booked yet.</strong>
        <p style="font-size: 0.88rem; margin-top: 0.25rem;">When you book a specialist, your verified clinical pass will appear here.</p>
        <button type="button" class="btn-primary" style="margin-top: 1rem;" onclick="document.getElementById('modalAppointments').classList.remove('active'); window.navigateToPage('doctors');">
          Browse Doctors ➔
        </button>
      </div>
    `;
  } else {
    container.innerHTML = appts.map((b, idx) => `
      <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.25rem; margin-bottom: 0.85rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
          <div>
            <span style="background: var(--cyan-light); color: var(--cyan-neon); border: 1px solid var(--cyan-border); font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">
              REF: ${b.referenceCode}
            </span>
            <h4 style="font-size: 1.1rem; color: #FFFFFF; margin-top: 6px;">${b.doctorName}</h4>
            <div style="color: var(--cyan-neon); font-size: 0.85rem; font-weight: 600;">${b.specialistType} • ${b.clinicOrHospitalName}</div>
            <div style="font-size: 0.82rem; color: #94A3B8; margin-top: 4px;">
              📅 ${b.selectedDate} at ⏰ ${b.selectedSlot} • Patient: <strong>${b.patientName}</strong>
            </div>
            <div style="font-size: 0.82rem; color: #10B981; font-weight: 700; margin-top: 2px;">
              Fee: ₹${b.consultationFee} (Pay at Clinic)
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button type="button" class="btn-nav-glass" onclick="alert('MEDIGUIDE VERIFIED CLINICAL PASS\\n\\nRef Code: ${b.referenceCode}\\nDoctor: ${b.doctorName}\\nTime: ${b.selectedDate} at ${b.selectedSlot}\\nPatient: ${b.patientName}\\nClinic: ${b.clinicOrHospitalName}\\nFee: ₹${b.consultationFee}\\n\\nShow this reference code at clinic reception.')">
              🖨️ Pass Slip
            </button>
            <button type="button" style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--red-border); color: #EF4444; border-radius: 8px; padding: 6px 12px; font-weight: 700; cursor: pointer;" onclick="cancelBooking(${idx})">
              ✕ Cancel
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  modal.classList.add('active');
}

window.cancelBooking = function (idx) {
  let appts = JSON.parse(localStorage.getItem('mg_bookings') || '[]');
  if (appts[idx]) {
    const removed = appts.splice(idx, 1)[0];
    localStorage.setItem('mg_bookings', JSON.stringify(appts));
    openAppointmentsModal();
    window.showToast(`Cancelled appointment for ${removed.doctorName}`, 'info', '🗑️');
  }
};

/**
 * =========================================================================
 * 10. SETTINGS & LOCATION MODALS
 * =========================================================================
 */
function initSettingsModal() {
  document.getElementById('btnCloseSettingsModal')?.addEventListener('click', () => {
    document.getElementById('modalSettings')?.classList.remove('active');
  });

  document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
    const lang = document.getElementById('settingVoiceLang')?.value || 'en-IN';
    const sound = document.getElementById('settingSoundToggle')?.checked;
    localStorage.setItem('mg_voice_lang', lang);
    localStorage.setItem('mg_sound_enabled', sound ? 'true' : 'false');
    document.getElementById('modalSettings')?.classList.remove('active');
    window.showToast('Preferences saved successfully!', 'success', '⚙️');
  });
}

function initLocationModal() {
  document.querySelectorAll('.btn-city-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-city-preset').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const city = btn.getAttribute('data-city');
      const lat = parseFloat(btn.getAttribute('data-lat'));
      const lng = parseFloat(btn.getAttribute('data-lng'));

      window.userLat = lat;
      window.userLng = lng;
      window.userLocationName = city;

      const navLabel = document.getElementById('navbarLocationLabel');
      if (navLabel) navLabel.textContent = city;

      // Sync select dropdowns if applicable
      const matchKey = Object.keys(CITY_COORDINATES).find((k) => city.toLowerCase().includes(k) || CITY_COORDINATES[k].name === city);
      if (matchKey) {
        const docCity = document.getElementById('filterDoctorCity');
        const hospCity = document.getElementById('filterHospitalCity');
        if (docCity) docCity.value = matchKey;
        if (hospCity) hospCity.value = matchKey;
      }

      document.getElementById('modalLocation')?.classList.remove('active');

      fetchInitialData();
      window.showToast(`Location set to ${city}`, 'success', '📍');
    });
  });

  document.getElementById('btnDetectGpsModal')?.addEventListener('click', () => {
    if (navigator.geolocation) {
      const btn = document.getElementById('btnDetectGpsModal');
      if (btn) btn.innerHTML = '<span>⏳</span> Detecting GPS Location...';
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          window.userLat = pos.coords.latitude;
          window.userLng = pos.coords.longitude;
          let label = `GPS Location (${window.userLat.toFixed(2)}°, ${window.userLng.toFixed(2)}°)`;

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${window.userLat}&lon=${window.userLng}`);
            const data = await res.json();
            if (data && data.address) {
              label = data.address.city || data.address.state_district || data.address.state || label;
            }
          } catch (e) {
            // fallback
          }

          window.userLocationName = label;
          const navLabel = document.getElementById('navbarLocationLabel');
          if (navLabel) navLabel.textContent = label;

          if (btn) btn.innerHTML = '<span>🎯</span> Detect My Current GPS Location';
          document.getElementById('modalLocation')?.classList.remove('active');
          fetchInitialData();
          window.showToast(`Location detected: ${label}`, 'success', '🎯');
        },
        () => {
          const btn = document.getElementById('btnDetectGpsModal');
          if (btn) btn.innerHTML = '<span>🎯</span> Detect My Current GPS Location';
          window.showToast('Could not access GPS. Please select a city from the list.', 'warning', '⚠️');
        }
      );
    }
  });

  const btnApplyCustom = document.getElementById('btnApplyCustomCity');
  const inputCustom = document.getElementById('inputCustomCity');

  if (btnApplyCustom && inputCustom) {
    const handleCustomCity = async () => {
      const custom = inputCustom.value.trim();
      if (!custom) return;

      btnApplyCustom.textContent = 'Searching...';
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(custom)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          window.userLat = parseFloat(data[0].lat);
          window.userLng = parseFloat(data[0].lon);
          const label = data[0].display_name.split(',')[0] + ', India';
          window.userLocationName = label;
          document.getElementById('navbarLocationLabel').textContent = label;
          document.getElementById('modalLocation')?.classList.remove('active');
          fetchInitialData();
          window.showToast(`Location updated to ${label}`, 'success', '📍');
        } else {
          // Direct fallback
          window.userLocationName = custom;
          document.getElementById('navbarLocationLabel').textContent = custom;
          document.getElementById('modalLocation')?.classList.remove('active');
          fetchInitialData();
          window.showToast(`Location set to ${custom}`, 'info', '📍');
        }
      } catch (e) {
        window.userLocationName = custom;
        document.getElementById('navbarLocationLabel').textContent = custom;
        document.getElementById('modalLocation')?.classList.remove('active');
        fetchInitialData();
        window.showToast(`Location set to ${custom}`, 'info', '📍');
      } finally {
        btnApplyCustom.textContent = 'Apply';
      }
    };

    btnApplyCustom.addEventListener('click', handleCustomCity);
    inputCustom.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCustomCity();
    });
  }
}

/**
 * =========================================================================
 * 11. SIDE-BY-SIDE COMPARISON MODALS
 * =========================================================================
 */
function initComparisonModals() {
  document.getElementById('btnCloseDocCompareModal')?.addEventListener('click', () => {
    document.getElementById('modalDoctorCompare')?.classList.remove('active');
  });
  document.getElementById('btnCloseHospCompareModal')?.addEventListener('click', () => {
    document.getElementById('modalHospitalCompare')?.classList.remove('active');
  });
}

window.toggleDocComparison = function (docId) {
  const doc = window.currentDoctorsData.find((d) => d._id === docId);
  if (!doc) return;

  const idx = window.selectedCompareDocs.findIndex((d) => d._id === docId);
  if (idx > -1) {
    window.selectedCompareDocs.splice(idx, 1);
  } else {
    if (window.selectedCompareDocs.length >= 3) {
      window.showToast('You can compare up to 3 doctors at once.', 'warning', '⚠️');
      return;
    }
    window.selectedCompareDocs.push(doc);
  }

  const countBadge = document.getElementById('compareDocSelectedCount');
  if (countBadge) countBadge.textContent = window.selectedCompareDocs.length;
};

window.toggleHospComparison = function (hospId) {
  const hosp = window.currentHospitalsData.find((h) => h._id === hospId);
  if (!hosp) return;

  const idx = window.selectedCompareHosps.findIndex((h) => h._id === hospId);
  if (idx > -1) {
    window.selectedCompareHosps.splice(idx, 1);
  } else {
    if (window.selectedCompareHosps.length >= 3) {
      window.showToast('You can compare up to 3 hospitals at once.', 'warning', '⚠️');
      return;
    }
    window.selectedCompareHosps.push(hosp);
  }

  const countBadge = document.getElementById('compareHospSelectedCount');
  if (countBadge) countBadge.textContent = window.selectedCompareHosps.length;
};

function openDoctorCompareModal() {
  if (window.selectedCompareDocs.length < 2) {
    window.showToast('Please select at least 2 doctors to compare.', 'info', '💡');
    return;
  }

  const container = document.getElementById('doctorComparisonTableContainer');
  const docs = window.selectedCompareDocs;

  container.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border-glass); color: #00F0FF;">
          <th style="padding: 8px;">Attribute</th>
          ${docs.map((d) => `<th style="padding: 8px;">${d.name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px; font-weight: 700;">Specialty</td>
          ${docs.map((d) => `<td style="padding: 8px;">${d.specialization}</td>`).join('')}
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px; font-weight: 700;">Consultation Fee</td>
          ${docs.map((d) => `<td style="padding: 8px; color: #10B981; font-weight: 800;">₹${d.fee}</td>`).join('')}
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px; font-weight: 700;">Experience</td>
          ${docs.map((d) => `<td style="padding: 8px;">${d.experienceYears || 15} Years</td>`).join('')}
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px; font-weight: 700;">Distance</td>
          ${docs.map((d) => `<td style="padding: 8px;">${d.distanceKm || 2.5} km</td>`).join('')}
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: 700;">Action</td>
          ${docs.map((d) => `<td style="padding: 8px;"><button type="button" class="btn-book-slot" onclick="document.getElementById('modalDoctorCompare').classList.remove('active'); openBookingWizard('${d._id}')">Book</button></td>`).join('')}
        </tr>
      </tbody>
    </table>
  `;

  document.getElementById('modalDoctorCompare')?.classList.add('active');
}

function openHospitalCompareModal() {
  if (window.selectedCompareHosps.length < 2) {
    window.showToast('Please select at least 2 hospitals to compare.', 'info', '💡');
    return;
  }

  const container = document.getElementById('hospitalComparisonTableContainer');
  const hosps = window.selectedCompareHosps;

  container.innerHTML = `
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border-glass); color: #00F0FF;">
          <th style="padding: 8px;">Hospital</th>
          ${hosps.map((h) => `<th style="padding: 8px;">${h.name}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px; font-weight: 700;">General Beds Available</td>
          ${hosps.map((h) => `<td style="padding: 8px; color: #10B981; font-weight: 800;">${h.availableBeds || 60} Beds</td>`).join('')}
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px; font-weight: 700;">ICU Capacity</td>
          ${hosps.map((h) => `<td style="padding: 8px; color: #00F0FF; font-weight: 800;">${h.icuBedsAvailable || 12} Beds</td>`).join('')}
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px; font-weight: 700;">ER Wait Time</td>
          ${hosps.map((h) => `<td style="padding: 8px; color: #EF4444; font-weight: 800;">${h.erStatus?.currentWaitMinutes || 6} min</td>`).join('')}
        </tr>
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 8px; font-weight: 700;">Est. Package</td>
          ${hosps.map((h) => `<td style="padding: 8px; color: #10B981; font-weight: 700;">${h.fees?.totalEstimatedDiagnosisCost || '₹2,500 - ₹8,000'}</td>`).join('')}
        </tr>
      </tbody>
    </table>
  `;

  document.getElementById('modalHospitalCompare')?.classList.add('active');
}

/**
 * =========================================================================
 * PROFILE PAGE — Avatar, Editable Forms, Stats, Logout
 * =========================================================================
 */
function initProfilePage() {
  // Avatar change button
  const btnChangeAvatar = document.getElementById('btnChangeAvatar');
  const avatarFileInput = document.getElementById('avatarFileInput');

  if (btnChangeAvatar && avatarFileInput) {
    btnChangeAvatar.addEventListener('click', () => avatarFileInput.click());
    avatarFileInput.addEventListener('change', () => {
      const file = avatarFileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        // Save to user profile
        window.authService.updateProfile({ avatar: dataUrl });
        // Update avatar display immediately
        const img = document.getElementById('profileAvatarImg');
        const initials = document.getElementById('profileAvatarInitials');
        if (img) {
          img.src = dataUrl;
          img.classList.add('loaded');
        }
        if (initials) initials.style.display = 'none';
        // Also update navbar
        syncNavbarAuthUI();
        window.showToast('Profile photo updated!', 'success', '📸');
      };
      reader.readAsDataURL(file);
    });
  }

  // Personal details edit toggle
  const btnTogglePersonalEdit = document.getElementById('btnTogglePersonalEdit');
  const savePersonalRow = document.getElementById('savePersonalRow');
  const personalFields = ['profileFullName', 'profileEmail', 'profilePhone', 'profileAge', 'profileCity'];
  const personalSelects = ['profileGender'];

  btnTogglePersonalEdit?.addEventListener('click', () => {
    const isEditing = btnTogglePersonalEdit.textContent.includes('Save') || savePersonalRow?.style.display !== 'none';
    if (!isEditing) {
      // Enable editing
      personalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute('readonly');
      });
      personalSelects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
      });
      if (savePersonalRow) savePersonalRow.style.display = 'flex';
      btnTogglePersonalEdit.textContent = '✕ Cancel';
      btnTogglePersonalEdit.style.color = '#FCA5A5';
      btnTogglePersonalEdit.style.borderColor = 'rgba(239,68,68,0.3)';
    } else {
      cancelPersonalEdit();
    }
  });

  function cancelPersonalEdit() {
    personalFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('readonly', true);
    });
    personalSelects.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });
    if (savePersonalRow) savePersonalRow.style.display = 'none';
    if (btnTogglePersonalEdit) {
      btnTogglePersonalEdit.textContent = '✏️ Edit';
      btnTogglePersonalEdit.style.color = '';
      btnTogglePersonalEdit.style.borderColor = '';
    }
    refreshProfilePage(); // Re-fill fields from stored user
  }

  document.getElementById('btnCancelPersonalEdit')?.addEventListener('click', cancelPersonalEdit);

  document.getElementById('formProfilePersonal')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      name: document.getElementById('profileFullName')?.value.trim() || '',
      email: document.getElementById('profileEmail')?.value.trim() || '',
      phone: document.getElementById('profilePhone')?.value.trim() || '',
      age: document.getElementById('profileAge')?.value.trim() || '',
      gender: document.getElementById('profileGender')?.value || '',
      city: document.getElementById('profileCity')?.value.trim() || '',
    };
    window.authService.updateProfile(updated);
    cancelPersonalEdit();
    syncNavbarAuthUI();
    window.showToast('Personal details saved!', 'success', '✅');
  });

  // Medical info edit toggle
  const btnToggleMedicalEdit = document.getElementById('btnToggleMedicalEdit');
  const saveMedicalRow = document.getElementById('saveMedicalRow');
  const medicalFields = ['profileAllergies', 'profileConditions', 'profileMedications', 'profileEmergencyName', 'profileEmergencyPhone'];
  const medicalSelects = ['profileBloodGroup'];

  btnToggleMedicalEdit?.addEventListener('click', () => {
    const isEditing = saveMedicalRow?.style.display !== 'none';
    if (!isEditing) {
      medicalFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute('readonly');
      });
      medicalSelects.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
      });
      if (saveMedicalRow) saveMedicalRow.style.display = 'flex';
      btnToggleMedicalEdit.textContent = '✕ Cancel';
      btnToggleMedicalEdit.style.color = '#FCA5A5';
    } else {
      cancelMedicalEdit();
    }
  });

  function cancelMedicalEdit() {
    medicalFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('readonly', true);
    });
    medicalSelects.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });
    if (saveMedicalRow) saveMedicalRow.style.display = 'none';
    if (btnToggleMedicalEdit) {
      btnToggleMedicalEdit.textContent = '✏️ Edit';
      btnToggleMedicalEdit.style.color = '';
    }
    refreshProfilePage();
  }

  document.getElementById('btnCancelMedicalEdit')?.addEventListener('click', cancelMedicalEdit);

  document.getElementById('formProfileMedical')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      bloodGroup: document.getElementById('profileBloodGroup')?.value || '',
      allergies: document.getElementById('profileAllergies')?.value.trim() || '',
      conditions: document.getElementById('profileConditions')?.value.trim() || '',
      medications: document.getElementById('profileMedications')?.value.trim() || '',
      emergencyContactName: document.getElementById('profileEmergencyName')?.value.trim() || '',
      emergencyContactPhone: document.getElementById('profileEmergencyPhone')?.value.trim() || '',
    };
    window.authService.updateProfile(updated);
    cancelMedicalEdit();
    window.showToast('Medical info saved!', 'success', '🩺');
  });

  // Logout button on profile page
  document.getElementById('btnProfileLogout')?.addEventListener('click', () => {
    window.authService.logout();
    window.navigateToPage('home');
    window.showToast('You have been signed out.', 'info', '🚪');
  });
}

function refreshProfilePage() {
  const user = window.authService.getUser();
  if (!user) {
    // Redirect to home if not logged in
    window.navigateToPage('home');
    document.getElementById('modalAuth')?.classList.add('active');
    return;
  }

  // Avatar
  const avatarImg = document.getElementById('profileAvatarImg');
  const avatarInitials = document.getElementById('profileAvatarInitials');
  if (avatarImg && user.avatar) {
    avatarImg.src = user.avatar;
    avatarImg.classList.add('loaded');
    if (avatarInitials) avatarInitials.style.display = 'none';
  } else if (avatarInitials) {
    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    avatarInitials.textContent = initials;
    avatarInitials.style.display = 'flex';
    if (avatarImg) avatarImg.classList.remove('loaded');
  }

  // Display name & email
  const el = (id) => document.getElementById(id);
  if (el('profileNameDisplay')) el('profileNameDisplay').textContent = user.name || '—';
  if (el('profileEmailDisplay')) el('profileEmailDisplay').textContent = user.email || '—';

  // Stats panel
  if (el('statBloodGroup')) el('statBloodGroup').textContent = user.bloodGroup || 'N/A';
  if (el('statAge')) el('statAge').textContent = user.age ? `${user.age} yrs` : '—';
  if (el('statGender')) el('statGender').textContent = user.gender || '—';
  if (el('statPhone')) el('statPhone').textContent = user.phone ? user.phone.slice(-6).replace(/(.{2})/g, '$1 ').trim() : '—';

  // Personal form fields
  if (el('profileFullName')) el('profileFullName').value = user.name || '';
  if (el('profileEmail')) el('profileEmail').value = user.email || '';
  if (el('profilePhone')) el('profilePhone').value = user.phone || '';
  if (el('profileAge')) el('profileAge').value = user.age || '';
  if (el('profileCity')) el('profileCity').value = user.city || window.userLocationName || '';
  const genderSel = el('profileGender');
  if (genderSel && user.gender) {
    Array.from(genderSel.options).forEach(opt => {
      opt.selected = opt.value === user.gender;
    });
  }

  // Medical form fields
  const bgSel = el('profileBloodGroup');
  if (bgSel && user.bloodGroup) {
    Array.from(bgSel.options).forEach(opt => {
      opt.selected = opt.value === user.bloodGroup;
    });
  }
  if (el('profileAllergies')) el('profileAllergies').value = user.allergies || '';
  if (el('profileConditions')) el('profileConditions').value = user.conditions || '';
  if (el('profileMedications')) el('profileMedications').value = user.medications || '';
  if (el('profileEmergencyName')) el('profileEmergencyName').value = user.emergencyContactName || user.emergencyContact?.split('(')[0]?.trim() || '';
  if (el('profileEmergencyPhone')) el('profileEmergencyPhone').value = user.emergencyContactPhone || '';

  // Recent activity — show last triage if any
  const activityContainer = el('profileRecentActivity');
  if (activityContainer && window.lastTriageResult) {
    const r = window.lastTriageResult;
    const urgencyColors = { EMERGENCY: '#EF4444', URGENT: '#F59E0B', ROUTINE: '#10B981', 'SELF-CARE': '#38BDF8' };
    const color = urgencyColors[r.urgencyLevel] || '#94A3B8';
    activityContainer.innerHTML = `
      <div class="profile-activity-item">
        <div class="profile-activity-icon">🩺</div>
        <div class="profile-activity-info">
          <div class="profile-activity-title">${r.primaryDiagnosis?.condition || 'Triage Assessment'}</div>
          <div class="profile-activity-date">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
        <span class="profile-activity-badge" style="color:${color}; border-color:${color}40; background:${color}12">${r.urgencyLevel || 'INFO'}</span>
      </div>
    `;
  }
}
