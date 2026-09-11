const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Hospital address is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    traumaLevel: {
      type: String,
      default: 'Level 1 Trauma Center',
    },
    erStatus: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      currentWaitMinutes: {
        type: Number,
        default: 15,
      },
      occupancyRate: {
        type: String,
        default: 'Normal', // 'Low', 'Normal', 'High', 'Critical'
      },
    },
    fees: {
      admissionFee: {
        type: Number,
        required: true,
        default: 350,
      },
      bedCostPerDay: {
        type: Number,
        required: true,
        default: 850,
      },
      icuRate: {
        type: Number,
        required: true,
        default: 2400,
      },
      erConsultation: {
        type: Number,
        required: true,
        default: 180,
      },
    },
    emergencyPhone: {
      type: String,
      default: '+1 (800) 911-HELP',
    },
    ambulanceHotline: {
      type: String,
      default: '911',
    },
    rating: {
      type: Number,
      default: 4.7,
    },
    totalBeds: {
      type: Number,
      default: 450,
    },
    availableBeds: {
      type: Number,
      default: 38,
    },
    icuBedsAvailable: {
      type: Number,
      default: 7,
    },
    specialtiesAvailable: {
      type: [String],
      default: ['Cardiology', 'Trauma Surgery', 'Neurology', 'Pediatrics', 'Burn Unit'],
    },
  },
  {
    timestamps: true,
  }
);

hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
