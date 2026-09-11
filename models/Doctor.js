const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Doctor specialization is required'],
      trim: true,
      index: true,
    },
    clinicName: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Clinic address is required'],
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
    fee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 120,
    },
    experienceYears: {
      type: Number,
      default: 10,
    },
    avatar: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    availableSlots: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: [String],
      default: ['MD', 'Board Certified'],
    },
    languages: {
      type: [String],
      default: ['English', 'Spanish'],
    },
    acceptsInsurance: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ location: '2dsphere' });
doctorSchema.index({ specialization: 1, fee: 1 });

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
