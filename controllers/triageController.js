const { runMedicalTriage } = require('../utils/aiService');
const { resilientStore } = require('../utils/mockData');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { isConnected } = require('../config/db');

/**
 * Handle Multi-Modal Triage Analysis
 * POST /api/triage/analyze
 */
async function analyzeTriage(req, res) {
  try {
    const text = req.body.text || req.body.transcript || '';
    const lat = req.body.lat ? parseFloat(req.body.lat) : 40.7484;
    const lng = req.body.lng ? parseFloat(req.body.lng) : -73.9855;
    
    let chatHistory = [];
    if (req.body.chatHistory) {
      try {
        chatHistory = typeof req.body.chatHistory === 'string' 
          ? JSON.parse(req.body.chatHistory) 
          : req.body.chatHistory;
      } catch (e) {
        chatHistory = [];
      }
    }

    const file = req.file;
    const imageBuffer = file ? file.buffer : null;
    const mimeType = file ? file.mimetype : null;
    const fileName = file ? file.originalname : null;

    if (!text && !file) {
      return res.status(400).json({
        success: false,
        error: 'Please provide symptoms description, voice transcript, or upload a medical image.',
      });
    }

    // 1. Run AI Multi-modal Triage
    const triageResult = await runMedicalTriage({
      text,
      imageBuffer,
      mimeType,
      fileName,
      chatHistory,
    });

    // 2. Fetch Relevant Nearby Facilities up to 50 km
    const specialist = triageResult.requiredSpecialist || 'General Physician';
    let recommendedDoctors = resilientStore.getDoctors({
      specialist,
      lat,
      lng,
      maxDistanceKm: 50,
    });

    // If matching specialist produced few results, supplement with top doctors within 50 km
    if (recommendedDoctors.length < 3) {
      const allNearby = resilientStore.getDoctors({ lat, lng, maxDistanceKm: 50 });
      for (const doc of allNearby) {
        if (!recommendedDoctors.some((d) => d._id === doc._id)) {
          recommendedDoctors.push(doc);
        }
      }
    }

    // Fetch Nearby Hospitals within 50 km with diagnostic facilities
    const nearbyHospitals = resilientStore.getHospitals({ lat, lng, maxDistanceKm: 50 });

    return res.status(200).json({
      success: true,
      data: {
        triage: triageResult,
        providers: {
          urgencyRoute: triageResult.urgencyLevel,
          doctors: recommendedDoctors,
          hospitals: nearbyHospitals,
        },
        userLocation: { lat, lng },
        uploadedFile: fileName ? { name: fileName, size: file.size } : null,
      },
    });
  } catch (error) {
    console.error('Error in analyzeTriage:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during medical triage processing: ' + error.message,
    });
  }
}

/**
 * Handle Follow-up Triage Refinement
 * POST /api/triage/refine
 */
async function refineTriage(req, res) {
  try {
    const { originalTriage, answers, lat, lng } = req.body;

    if (!originalTriage || !answers) {
      return res.status(400).json({
        success: false,
        error: 'Missing original triage context or follow-up answers.',
      });
    }

    // Combine original symptoms and answers
    let combinedText = `Primary Initial Symptoms:\n${JSON.stringify(originalTriage.predictedConditions || [])}\n\nPatient Follow-up Answers:\n`;
    for (const [question, answer] of Object.entries(answers)) {
      combinedText += `- Q: ${question}\n  A: ${answer}\n`;
    }

    const updatedTriage = await runMedicalTriage({
      text: combinedText,
      chatHistory: [
        { role: 'assistant', content: JSON.stringify(originalTriage) },
        { role: 'user', content: combinedText },
      ],
    });

    const userLat = lat ? parseFloat(lat) : 40.7484;
    const userLng = lng ? parseFloat(lng) : -73.9855;

    const recommendedDoctors = resilientStore.getDoctors({
      specialist: updatedTriage.requiredSpecialist,
      lat: userLat,
      lng: userLng,
      maxDistanceKm: 50,
    });
    const nearbyHospitals = resilientStore.getHospitals({ lat: userLat, lng: userLng, maxDistanceKm: 50 });

    return res.status(200).json({
      success: true,
      data: {
        triage: updatedTriage,
        providers: {
          urgencyRoute: updatedTriage.urgencyLevel,
          doctors: recommendedDoctors,
          hospitals: nearbyHospitals,
        },
        userLocation: { lat: userLat, lng: userLng },
      },
    });
  } catch (error) {
    console.error('Error in refineTriage:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to refine triage: ' + error.message,
    });
  }
}

module.exports = {
  analyzeTriage,
  refineTriage,
};
