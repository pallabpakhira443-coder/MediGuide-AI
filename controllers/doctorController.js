const { resilientStore } = require('../utils/mockData');
const Doctor = require('../models/Doctor');
const { isConnected } = require('../config/db');

/**
 * Get Doctors with filtering, language matching and radius calculation
 * GET /api/doctors
 */
async function getDoctors(req, res) {
  try {
    const { specialist, search, language, lat, lng, radius, maxDistanceKm } = req.query;
    const userLat = lat ? parseFloat(lat) : 22.5726; // Default to Kolkata center
    const userLng = lng ? parseFloat(lng) : 88.3639;
    const distanceLimit = parseFloat(radius || maxDistanceKm) || 50;

    const doctors = resilientStore.getDoctors({
      specialist,
      search,
      language,
      lat: userLat,
      lng: userLng,
      maxDistanceKm: distanceLimit,
    });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    console.error('Error in getDoctors:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve doctors list: ' + error.message,
    });
  }
}

/**
 * Get Doctor by ID
 * GET /api/doctors/:id
 */
async function getDoctorById(req, res) {
  try {
    const { id } = req.params;

    const doctor = resilientStore.getDoctorById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    return res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve doctor profile: ' + error.message,
    });
  }
}

module.exports = {
  getDoctors,
  getDoctorById,
};
