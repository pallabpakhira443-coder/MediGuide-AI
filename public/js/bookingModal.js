/**
 * MediGuide AI - Booking Modal & Appointment Slot Picker Service
 * Formats fees in ₹ INR / $ USD and manages client-side appointment passes.
 */

class BookingModalService {
  constructor() {
    this.currentDoctor = null;
    this.selectedDate = 'Today';
    this.selectedSlot = '10:00 AM';
    this.initEventListeners();
  }

  initEventListeners() {
    const modal = document.getElementById('bookingModal');
    const btnClose = document.getElementById('btnCloseBookingModal');
    const bookingForm = document.getElementById('bookingSlotForm');

    if (btnClose && modal) {
      btnClose.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    // Date Chips Selection
    const dateButtons = document.querySelectorAll('#bookingDateOptions .radius-pill-btn');
    dateButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        dateButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedDate = btn.getAttribute('data-date') || 'Today';
      });
    });

    // Slot Chips Selection
    const slotButtons = document.querySelectorAll('#bookingSlotOptions .body-area-btn');
    slotButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        slotButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSlot = btn.getAttribute('data-slot') || '10:00 AM';
      });
    });

    // Form Submission
    if (bookingForm) {
      bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitAppointment();
      });
    }
  }

  async openBookingModal(doctorId) {
    let doc = (window.currentDoctorsData || []).find((d) => d._id === doctorId || String(d._id) === String(doctorId));

    if (!doc) {
      try {
        const res = await fetch(`/api/doctors/${doctorId}`);
        const data = await res.json();
        if (data.success) doc = data.data;
      } catch (e) {
        console.warn('Could not fetch doctor by ID');
      }
    }

    if (!doc) {
      doc = {
        _id: doctorId,
        name: 'Dr. Subhashis Mukherjee, MD',
        specialization: 'Cardiologist',
        clinicName: 'Kolkata Heart & Vascular Clinic',
        fee: 800,
        currency: 'INR',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
        availableSlots: ['10:00 AM', '11:30 AM', '05:00 PM', '07:15 PM'],
      };
    }

    this.currentDoctor = doc;
    const modal = document.getElementById('bookingModal');
    const nameElem = document.getElementById('bookingDocName');
    const specElem = document.getElementById('bookingDocSpec');
    const clinicElem = document.getElementById('bookingDocClinic');
    const feeElem = document.getElementById('bookingFeeDisplay');
    const avatarElem = document.getElementById('bookingDocAvatar');
    const docIdInput = document.getElementById('bookingDocId');

    const sym = doc.currency === 'INR' ? '₹' : '$';

    if (nameElem) nameElem.textContent = doc.name;
    if (specElem) specElem.textContent = doc.specialization;
    if (clinicElem) clinicElem.textContent = doc.clinicName || doc.address || 'Specialist Clinic';
    if (feeElem) feeElem.textContent = `${sym}${doc.fee}`;
    if (avatarElem) avatarElem.src = doc.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
    if (docIdInput) docIdInput.value = doc._id;

    // Load current authenticated user profile
    const user = window.authService ? window.authService.getUser() : null;
    const nameInput = document.getElementById('bookingPatientName');
    const phoneInput = document.getElementById('bookingPatientPhone');
    if (user) {
      if (nameInput) nameInput.value = user.name || '';
      if (phoneInput) phoneInput.value = user.phone || '';
    } else {
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
    }

    if (modal) modal.classList.add('active');
    if (window.audioFx) window.audioFx.playClick();
  }

  async submitAppointment() {
    const user = window.authService ? window.authService.getUser() : null;
    const patientName = document.getElementById('bookingPatientName')?.value.trim() || user?.name || 'Patient';
    const patientPhone = document.getElementById('bookingPatientPhone')?.value.trim() || user?.phone || '+91 98300 00000';
    const doc = this.currentDoctor;

    const sym = doc.currency === 'INR' ? '₹' : '$';
    const refCode = 'MG-' + Math.floor(100000 + Math.random() * 900000);

    const bookingRecord = {
      referenceCode: refCode,
      doctorId: doc._id,
      doctorName: doc.name,
      specialistType: doc.specialization,
      clinicOrHospitalName: doc.clinicName || doc.address,
      selectedDate: this.selectedDate,
      selectedSlot: this.selectedSlot,
      consultationFee: doc.fee,
      currency: doc.currency || 'INR',
      patientName,
      patientPhone,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
    };

    // Save in local storage
    const saved = JSON.parse(localStorage.getItem('mg_bookings') || '[]');
    saved.unshift(bookingRecord);
    localStorage.setItem('mg_bookings', JSON.stringify(saved));

    // Try posting to backend API
    try {
      await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingRecord),
      });
    } catch (e) {
      // Offline fallback
    }

    // Close booking modal
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');

    // Update bookings badge, patient profile, and doctor queue
    if (window.syncMyBookingsCount) window.syncMyBookingsCount();
    if (window.syncDoctorProfileUI) window.syncDoctorProfileUI();

    window.showToast(`Appointment Confirmed with ${doc.name}!`, 'success', '🎉');
    if (window.audioFx) window.audioFx.playSuccess();

    // Show Confirmation Pass
    this.showConfirmationPass(bookingRecord);
  }

  showConfirmationPass(appt) {
    const sym = appt.currency === 'INR' ? '₹' : '$';
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
      <div class="modal-card" style="text-align: center; max-width: 480px;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
        <h2 style="color: var(--color-routine); margin-bottom: 4px;">Appointment Confirmed!</h2>
        <p class="modal-sub">Please show this clinical pass at the reception counter.</p>

        <div style="background: var(--bg-surface-subtle); border: 2px dashed var(--border-primary); border-radius: var(--radius-lg); padding: 1.25rem; text-align: left; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.6rem; margin-bottom: 0.6rem;">
            <span style="font-size: 0.82rem; color: var(--text-muted);">Booking Reference:</span>
            <strong style="font-family: monospace; font-size: 1rem; color: var(--primary);">${appt.referenceCode}</strong>
          </div>
          <div style="margin-bottom: 0.4rem;">
            <strong style="font-size: 1.05rem; color: var(--text-main);">${appt.doctorName}</strong>
            <div style="color: var(--primary); font-size: 0.88rem;">${appt.specialistType} • ${appt.clinicOrHospitalName}</div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-body); margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid var(--border-subtle);">
            <span>📅 ${appt.selectedDate} • ⏰ ${appt.selectedSlot}</span>
            <strong style="color: var(--text-main); font-size: 1rem;">${sym}${appt.consultationFee}</strong>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.4rem;">
            👤 Patient: ${appt.patientName} (${appt.patientPhone})
          </div>
        </div>

        <div style="display: flex; gap: 0.65rem;">
          <button type="button" class="btn-primary-block" onclick="window.print()" style="flex: 1;">
            🖨️ Print Pass
          </button>
          <button type="button" class="btn-primary-block" id="btnClosePassModal" style="background: var(--bg-surface-subtle); border: 1px solid var(--border-subtle); color: var(--text-body); flex: 1;">
            Done ✓
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btnClosePassModal').addEventListener('click', () => {
      overlay.remove();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.bookingModal = new BookingModalService();
});
