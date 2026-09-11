const { resilientStore } = require('../utils/mockData');
const Hospital = require('../models/Hospital');
const { isConnected } = require('../config/db');

/**
 * Get Emergency Hospitals & Facilities
 * GET /api/hospitals
 */
async function getHospitals(req, res) {
  try {
    const { lat, lng, radius, maxDistanceKm, exploreOutside } = req.query;
    const userLat = lat ? parseFloat(lat) : 28.6304;
    const userLng = lng ? parseFloat(lng) : 77.2177;
    const distanceLimit = parseFloat(radius || maxDistanceKm) || 50;
    const shouldExploreOutside = exploreOutside === 'true' || exploreOutside === true;

    const hospitals = resilientStore.getHospitals({
      lat: userLat,
      lng: userLng,
      maxDistanceKm: distanceLimit,
      exploreOutside: shouldExploreOutside,
    });

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    console.error('Error in getHospitals:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve hospitals list: ' + error.message,
    });
  }
}

/**
 * Get Hospital by ID
 * GET /api/hospitals/:id
 */
async function getHospitalById(req, res) {
  try {
    const { id } = req.params;

    const hospital = resilientStore.getHospitalById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    return res.status(200).json({ success: true, data: hospital });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve hospital details: ' + error.message,
    });
  }
}

/**
 * Get Hospital Fee & ICU Charge Comparison Matrix
 * GET /api/hospitals/compare-fees
 */
async function compareHospitalFees(req, res) {
  try {
    const { lat, lng, radius } = req.query;
    const userLat = lat ? parseFloat(lat) : 22.5726;
    const userLng = lng ? parseFloat(lng) : 88.3639;
    const distanceLimit = parseFloat(radius) || 50;

    const hospitals = resilientStore.getHospitals({ lat: userLat, lng: userLng, maxDistanceKm: distanceLimit });

    const comparisonTable = hospitals.map((h) => {
      const sym = h.currency === 'INR' ? '₹' : '$';
      return {
        id: h._id,
        name: h.name,
        address: h.address,
        distanceKm: h.distanceKm,
        distanceMiles: h.distanceMiles,
        currency: h.currency || 'USD',
        erWaitTime: `${h.erStatus.currentWaitMinutes} mins`,
        erConsultation: `${sym}${h.fees.erConsultation}`,
        admissionFee: `${sym}${h.fees.admissionFee}`,
        bedCostPerDay: `${sym}${h.fees.bedCostPerDay} / day`,
        icuRate: `${sym}${h.fees.icuRate} / day`,
        totalEstimatedDiagnosisCost: h.fees.totalEstimatedDiagnosisCost || `${sym}1,000 - ${sym}5,000`,
        availableBeds: h.availableBeds,
        icuBedsAvailable: h.icuBedsAvailable,
        emergencyPhone: h.emergencyPhone,
        ambulanceHotline: h.ambulanceHotline,
      };
    });

    return res.status(200).json({
      success: true,
      data: comparisonTable,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate fee comparison: ' + error.message,
    });
  }
}

module.exports = {
  getHospitals,
  getHospitalById,
  compareHospitalFees,
};
