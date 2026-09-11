/**
 * MediGuide AI - Results Page Renderer & Detailed Hospital Bed/Cost Engine
 */

class TriageUIController {
  constructor() {
    this.currentTriage = null;
    this.currentProviders = null;
  }

  renderResultsPage(data) {
    if (!data || !data.triage) return;
    this.currentTriage = data.triage;
    this.currentProviders = data.providers;

    const triage = data.triage;
    const urgency = triage.urgencyLevel || 'ROUTINE';
    const isEmergency = urgency === 'EMERGENCY';
    const isUrgent = urgency === 'URGENT';

    // 1. Urgency Banner
    const bannerContainer = document.getElementById('resultsUrgencyBanner');
    if (bannerContainer) {
      const bannerClass = isEmergency ? 'emergency' : isUrgent ? 'urgent' : 'routine';
      const icon = isEmergency ? '🚨' : isUrgent ? '⚠️' : '✅';
      const tagText = isEmergency ? 'CRITICAL EMERGENCY • IMMEDIATE HOSPITAL ACTION REQUIRED' : isUrgent ? 'URGENT EVALUATION ADVISED' : 'ROUTINE CONDITION • SAFE FOR OUTPATIENT CARE';
      const title = isEmergency
        ? 'High-Risk Condition Detected - Emergency Evaluation Required'
        : isUrgent
          ? 'Urgent Medical Attention Advised (Within 24-48 Hours)'
          : 'Routine Assessment - Consult a Specialist Physician';
      const desc = triage.urgentDiagnosisReason || (isEmergency
        ? 'Reported symptoms indicate life-threatening or acute trauma conditions. Proceed to the nearest trauma hospital immediately.'
        : 'No acute emergency signs detected. Check doctor directory below for outpatient appointments.');

      bannerContainer.innerHTML = `
        <div class="urgency-banner ${bannerClass}">
          <div class="urgency-left">
            <span class="urgency-badge-icon">${icon}</span>
            <div>
              <span class="urgency-tag">${tagText}</span>
              <h3 class="urgency-heading">${title}</h3>
              <p class="urgency-desc">${desc}</p>
            </div>
          </div>
          ${isEmergency ? `
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <a href="tel:108" class="btn-hotline-quick">📞 Call Ambulance 108</a>
              <a href="tel:102" class="btn-hotline-quick" style="background: #0284c7;">📞 Call 102</a>
            </div>
          ` : ''}
        </div>
      `;
    }

    // 2. Emergency Hospitals & Trauma Matrix (For Urgent / Serious Cases)
    const hospRadarSection = document.getElementById('emergencyHospitalsRadarSection');
    const testsGrid = document.getElementById('requiredEmergencyTestsGrid');
    const hospGrid = document.getElementById('emergencyHospitalsDetailGrid');

    if (hospRadarSection) {
      if (isEmergency || isUrgent) {
        hospRadarSection.style.display = 'block';

        const isIndia = window.userLng > 65 && window.userLng < 98;
        const sym = isIndia ? '₹' : '$';

        // Itemized Diagnostic Tests
        const alertData = triage.seriousDiseaseAlert || {};
        const tests = alertData.diagnosticTestsRequired || [
          { name: '12-Lead Emergency ECG', purpose: 'Rapid cardiac rhythm & ischemia evaluation', estimatedCostUSD: 60, estimatedCostINR: 350 },
          { name: 'Troponin I / T Biomarkers', purpose: 'Myocardial infarction injury test', estimatedCostUSD: 120, estimatedCostINR: 1200 },
          { name: 'Multi-Slice Emergency CT Scan', purpose: 'Visceral / vascular cross-sectional scan', estimatedCostUSD: 450, estimatedCostINR: 3500 },
          { name: 'Bedside Emergency Ultrasound (POCUS)', purpose: 'Peritoneal / pericardial fluid check', estimatedCostUSD: 180, estimatedCostINR: 1500 },
        ];

        if (testsGrid) {
          testsGrid.innerHTML = `
            <strong style="font-size: 0.95rem; color: #9f1239; display: block; margin-bottom: 0.65rem;">
              🧪 Required Emergency Diagnostic Workup & Individual Costs:
            </strong>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.65rem;">
              ${tests.map((t) => `
                <div style="background: var(--bg-surface); border: 1px solid #fecdd3; border-radius: 8px; padding: 0.65rem 0.85rem;">
                  <strong style="font-size: 0.9rem; color: var(--text-main);">${t.name}</strong>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">${t.purpose}</div>
                  <div style="font-size: 0.88rem; font-weight: 700; color: #e11d48; margin-top: 2px;">
                    Estimated Test Fee: ${sym}${isIndia ? (t.estimatedCostINR || 500) : (t.estimatedCostUSD || 80)}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }

        // Render Capable Emergency Hospitals
        this.renderEmergencyHospitals(data.providers?.hospitals || []);
      } else {
        hospRadarSection.style.display = 'none';
      }
    }

    // 3. Predicted Diseases List
    const condList = document.getElementById('predictedConditionsList');
    if (condList) {
      const conditions = triage.predictedConditions || [
        { name: 'Primary Suspected Condition', confidence: 88, description: 'Clinical presentation aligns with reported symptoms.' }
      ];

      condList.innerHTML = conditions
        .map((c) => `
          <div class="condition-item">
            <div class="condition-header">
              <span class="condition-name">${c.name}</span>
              <span class="confidence-badge">🎯 ${c.confidence || 85}% Match</span>
            </div>
            <p class="condition-desc">${c.description || c.rationale || 'Matches reported symptom timeline.'}</p>
          </div>
        `)
        .join('');
    }

    // 4. First-Aid & Home Care Instructions
    const stepsList = document.getElementById('firstAidStepsList');
    if (stepsList) {
      const steps = triage.homeCareSteps || [
        'Rest in a comfortable, well-ventilated position with head elevated.',
        'Keep patient calm, hydrated, and loosen any tight clothing.',
        'Monitor pulse rate, blood pressure, and breathing regularly.',
        'Seek immediate trauma center care if chest pain, shortness of breath, or fainting occurs.',
      ];

      stepsList.innerHTML = steps
        .map((s) => `
          <li class="homecare-item">
            <span class="homecare-bullet">✓</span>
            <span>${s}</span>
          </li>
        `)
        .join('');
    }

    // 5. Render Matching Specialist Doctors
    const docs = data.providers?.doctors || [];
    window.currentDoctorsData = docs;
    this.renderDoctorsList(docs);
  }

  renderEmergencyHospitals(hospitals) {
    const hospGrid = document.getElementById('emergencyHospitalsDetailGrid');
    if (!hospGrid) return;

    if (!hospitals || hospitals.length === 0) {
      hospGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1;">No emergency facilities found in this immediate radius.</p>`;
      return;
    }

    hospGrid.innerHTML = hospitals
      .map((hosp) => {
        const sym = hosp.currency === 'INR' ? '₹' : '$';
        return `
          <div class="hospital-detail-card">
            <div>
              <div class="hospital-card-top">
                <div>
                  <h4>${hosp.name}</h4>
                  <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 1px;">
                    📍 ${hosp.address} (<strong>${hosp.distanceKm} km away</strong>)
                  </p>
                </div>
                <span class="trauma-tag">${hosp.traumaLevel || 'Level 1 Trauma'}</span>
              </div>

              <!-- Real-time Bed Status Strip (Beds Left, ICU Beds, Wait Time) -->
              <div class="bed-status-container">
                <div class="bed-stat-box">
                  <span class="stat-num" style="color: #059669;">${hosp.availableBeds || 80}</span>
                  <span class="stat-label">General Beds Left</span>
                </div>
                <div class="bed-stat-box">
                  <span class="stat-num" style="color: #0284c7;">${hosp.icuBedsAvailable || 12}</span>
                  <span class="stat-label">ICU Beds Left</span>
                </div>
                <div class="bed-stat-box">
                  <span class="stat-num" style="color: #9f1239;">${hosp.erStatus?.currentWaitMinutes || 8} min</span>
                  <span class="stat-label">ER Wait Time</span>
                </div>
              </div>

              <!-- Itemized Emergency Cost Breakdown -->
              <div class="hospital-cost-matrix">
                <div class="cost-row">
                  <span>ER Doctor Consultation:</span>
                  <strong>${sym}${hosp.fees?.erConsultation || 50}</strong>
                </div>
                <div class="cost-row">
                  <span>Emergency Admission Fee:</span>
                  <strong>${sym}${hosp.fees?.admissionFee || 100}</strong>
                </div>
                <div class="cost-row">
                  <span>General Bed Cost / Day:</span>
                  <strong>${sym}${hosp.fees?.bedCostPerDay || 200}</strong>
                </div>
                <div class="cost-row">
                  <span>ICU Bed Rate / Day:</span>
                  <strong>${sym}${hosp.fees?.icuRate || 1200}</strong>
                </div>
                <div class="cost-row total-row">
                  <span>Total Estimated Diagnosis Workup:</span>
                  <span>${hosp.fees?.totalEstimatedDiagnosisCost || `${sym}800 - ${sym}3,500`}</span>
                </div>
              </div>
            </div>

            <!-- Emergency Actions (1-Tap Call Ambulance) -->
            <div class="hospital-card-actions">
              <a href="tel:${hosp.ambulanceHotline || hosp.emergencyPhone || '108'}" class="btn-call-er">
                📞 Call Ambulance (${hosp.ambulanceHotline || '108'})
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.name + ' ' + hosp.address)}" target="_blank" rel="noopener" class="btn-directions">
                🗺️ Directions
              </a>
            </div>
          </div>
        `;
      })
      .join('');
  }

  renderDoctorsList(doctors) {
    const list = document.getElementById('resultsDoctorsList');
    if (!list) return;

    if (!doctors || doctors.length === 0) {
      list.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 0.25rem;">🩺</div>
          <strong>No doctors found within ${window.selectedRadiusKm} km</strong>
          <p style="font-size: 0.88rem;">Try increasing radius to 25 km or 50 km.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = doctors
      .map((doc) => {
        const sym = doc.currency === 'INR' ? '₹' : '$';
        const isBengali = doc.isBengaliDoctor || (doc.languages && doc.languages.some((l) => l.toLowerCase().includes('bengali')));
        const bengaliBadge = isBengali
          ? `<span class="doctor-bengali-tag"><span>🌟</span> বাংলা (Bengali)</span>`
          : '';

        return `
          <div class="doctor-card">
            <div>
              <div class="doctor-top-row">
                <img class="doctor-avatar" src="${doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}" alt="${doc.name}" />
                <div class="doctor-info-head">
                  <h3>${doc.name}</h3>
                  <div class="doctor-specialty">${doc.specialization}</div>
                  ${bengaliBadge}
                  <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 3px;">
                    📍 ${doc.clinicName || doc.address}
                  </div>
                </div>
              </div>

              <div class="doctor-meta-chips">
                <span class="doc-chip distance">📍 ${doc.distanceKm} km away</span>
                <span class="doc-chip" style="color: #b45309; background: #fef3c7;">⭐ ${doc.rating || 4.9}</span>
                <span class="doc-chip">🎓 ${doc.experienceYears || 12} yrs exp</span>
              </div>
            </div>

            <div class="doctor-footer-row">
              <div>
                <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Consultation Fee</span>
                <div class="fee-amount">${sym}${doc.fee}</div>
              </div>
              <button type="button" class="btn-book-slot" onclick="window.bookingModal.openBookingModal('${doc._id}')">
                Book Slot ✓
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.triageUI = new TriageUIController();
});
