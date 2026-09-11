const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone number is required'],
      trim: true,
    },
    patientEmail: {
      type: String,
      trim: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: false,
    },
    doctorName: {
      type: String,
      default: '',
    },
    specialistType: {
      type: String,
      default: 'General Physician',
    },
    clinicOrHospitalName: {
      type: String,
      default: '',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: false,
    },
    dateTime: {
      type: String,
      required: [true, 'Appointment date/time is required'],
    },
    selectedSlot: {
      type: String,
      required: true,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'],
      default: 'CONFIRMED',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PAID', 'INSURANCE_COVERED', 'PAY_AT_CLINIC'],
      default: 'PAY_AT_CLINIC',
    },
    triageSummary: {
      urgencyLevel: {
        type: String,
        enum: ['EMERGENCY', 'URGENT', 'ROUTINE', 'UNKNOWN'],
        default: 'ROUTINE',
      },
      primaryCondition: {
        type: String,
        default: '',
      },
      confidence: {
        type: Number,
        default: 0,
      },
      symptoms: {
        type: String,
        default: '',
      },
      specialistRecommended: {
        type: String,
        default: 'General Physician',
      },
      recommendedAction: {
        type: String,
        default: '',
      },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
