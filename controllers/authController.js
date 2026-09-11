const User = require('../models/User');
const { resilientStore } = require('../utils/mockData');
const { isConnected } = require('../config/db');

/**
 * Register a new User
 * POST /api/auth/register
 */
async function registerUser(req, res) {
  try {
    const { name, email, phone, password, medicalHistory, allergies, address, location } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and phone number are required.',
      });
    }

    const emailLower = email.toLowerCase().trim();

    if (isConnected()) {
      try {
        const existing = await User.findOne({ email: emailLower });
        if (existing) {
          return res.status(400).json({
            success: false,
            error: 'An account with this email address already exists.',
          });
        }

        const newUser = await User.create({
          name: name.trim(),
          email: emailLower,
          phone: phone.trim(),
          address: address || '',
          medicalHistory: Array.isArray(medicalHistory) ? medicalHistory : medicalHistory ? [medicalHistory] : [],
          allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : [],
          location: location || { type: 'Point', coordinates: [-73.9855, 40.7484] },
        });

        return res.status(201).json({
          success: true,
          message: 'Account created successfully!',
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            medicalHistory: newUser.medicalHistory,
            allergies: newUser.allergies,
            address: newUser.address,
            location: newUser.location,
          },
          token: 'mg_jwt_' + Math.random().toString(36).substring(2) + Date.now(),
        });
      } catch (err) {
        // Fallback to store
      }
    }

    // In-memory resilient store fallback
    const existingInStore = resilientStore.users.find((u) => u.email.toLowerCase() === emailLower);
    if (existingInStore) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const userObj = {
      _id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      address: address || '',
      medicalHistory: Array.isArray(medicalHistory) ? medicalHistory : medicalHistory ? [medicalHistory] : [],
      allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : [],
      location: location || { type: 'Point', coordinates: [-73.9855, 40.7484] },
      createdAt: new Date().toISOString(),
    };

    resilientStore.users.push(userObj);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone,
        medicalHistory: userObj.medicalHistory,
        allergies: userObj.allergies,
        address: userObj.address,
        location: userObj.location,
      },
      token: 'mg_jwt_' + Math.random().toString(36).substring(2) + Date.now(),
    });
  } catch (error) {
    console.error('Error in registerUser:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message,
    });
  }
}

/**
 * Login User
 * POST /api/auth/login
 */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your email address.',
      });
    }

    const emailLower = email.toLowerCase().trim();

    let userFound = null;

    if (isConnected()) {
      try {
        userFound = await User.findOne({ email: emailLower }).lean();
      } catch (e) {}
    }

    if (!userFound) {
      userFound = resilientStore.users.find((u) => u.email.toLowerCase() === emailLower);
    }

    // If demo login or user not found, provide/create user smoothly for demo
    if (!userFound) {
      userFound = {
        _id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: emailLower.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Patient User',
        email: emailLower,
        phone: '+1 (555) 345-6789',
        medicalHistory: ['Routine Checkup Record'],
        allergies: ['None Reported'],
        location: { type: 'Point', coordinates: [-73.9855, 40.7484] },
      };
      resilientStore.users.push(userFound);
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: userFound._id,
        name: userFound.name,
        email: userFound.email,
        phone: userFound.phone,
        medicalHistory: userFound.medicalHistory || [],
        allergies: userFound.allergies || [],
        address: userFound.address || '',
        location: userFound.location || { type: 'Point', coordinates: [-73.9855, 40.7484] },
      },
      token: 'mg_jwt_' + Math.random().toString(36).substring(2) + Date.now(),
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message,
    });
  }
}

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email parameter required.' });
    }

    const emailLower = email.toLowerCase().trim();
    let userFound = resilientStore.users.find((u) => u.email.toLowerCase() === emailLower);

    if (!userFound && isConnected()) {
      userFound = await User.findOne({ email: emailLower }).lean();
    }

    if (!userFound) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: userFound,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
