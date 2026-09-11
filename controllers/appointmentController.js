const { resilientStore } = require('../utils/mockData');
const Appointment = require('../models/Appointment');
const { isConnected } = require('../config/db');

/**
 * Generate a unique reference code
 */
function generateRefCode() {
  return 'MG-' + Math.floor(100000 + Math.random() * 900000);
}

/**
 * Book an Appointment
 * POST /api/appointments/book
 */
async function bookAppointment(req, res) {
  try {
    const {
      patientName,
      patientPhone,
      patientEmail,
      doctorId,
      doctorName,
      specialistType,
      hospitalId,
      clinicOrHospitalName,
      dateTime,
      selectedSlot,
      consultationFee,
      paymentStatus,
      triageSummary,
      notes,
    } = req.body;

    if (!patientName || !patientPhone || !selectedSlot) {
      return res.status(400).json({
        success: false,
        error: 'Please provide patient name, phone number, and a selected appointment time slot.',
      });
    }

    const referenceCode = generateRefCode();

    const appointmentPayload = {
      referenceCode,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail ? patientEmail.trim() : '',
      doctorId: doctorId || null,
      doctorName: doctorName || 'Attending Physician',
      specialistType: specialistType || 'General Physician',
      hospitalId: hospitalId || null,
      clinicOrHospitalName: clinicOrHospitalName || 'MediGuide Partner Clinic',
      dateTime: dateTime || new Date().toLocaleDateString('en-US'),
      selectedSlot,
      consultationFee: consultationFee ? parseFloat(consultationFee) : 0,
      paymentStatus: paymentStatus || 'PAY_AT_CLINIC',
      status: 'CONFIRMED',
      triageSummary: triageSummary || {},
      notes: notes || '',
    };

    if (isConnected()) {
      try {
        const appointment = new Appointment(appointmentPayload);
        await appointment.save();
        return res.status(201).json({
          success: true,
          message: 'Appointment successfully confirmed and saved to database.',
          data: appointment,
        });
      } catch (err) {
        console.warn('Mongoose save failed, using resilient store fallback:', err.message);
      }
    }

    // Save to resilient store
    const saved = resilientStore.createAppointment(appointmentPayload);
    return res.status(201).json({
      success: true,
      message: 'Appointment successfully confirmed.',
      data: saved,
    });
  } catch (error) {
    console.error('Error in bookAppointment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete appointment booking: ' + error.message,
    });
  }
}

/**
 * Get Patient Appointments
 * GET /api/appointments
 */
async function getAppointments(req, res) {
  try {
    const { phone, email } = req.query;

    if (isConnected()) {
      try {
        const query = {};
        if (phone) query.patientPhone = phone;
        if (email) query.patientEmail = email;

        const appointments = await Appointment.find(query).sort({ createdAt: -1 }).lean();
        return res.status(200).json({
          success: true,
          count: appointments.length,
          data: appointments,
        });
      } catch (e) {
        // Fallback
      }
    }

    const appointments = resilientStore.getAppointments({ phone, email });
    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointments: ' + error.message,
    });
  }
}

/**
 * Get Appointment by Reference Code
 * GET /api/appointments/ref/:refCode
 */
async function getAppointmentByRef(req, res) {
  try {
    const { refCode } = req.params;

    if (isConnected()) {
      try {
        const appointment = await Appointment.findOne({ referenceCode: refCode }).lean();
        if (appointment) {
          return res.status(200).json({ success: true, data: appointment });
        }
      } catch (e) {
        // Fallback
      }
    }

    const appointment = resilientStore.getAppointmentByRef(refCode);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment reference not found' });
    }

    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to find appointment: ' + error.message,
    });
  }
}

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentByRef,
};
