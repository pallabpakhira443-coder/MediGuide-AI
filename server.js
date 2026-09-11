require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDBStatus } = require('./config/db');

// Route imports
const triageRoutes = require('./routes/triageRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database connection
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static Assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);

// System Health & Engine Diagnostics
app.get('/api/system/status', (req, res) => {
  const dbStatus = getDBStatus();
  const geminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const openaiConfigured = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

  let activeAiEngine = 'MediGuide Clinical Diagnostic Engine (Offline CDSS)';
  if (geminiConfigured) activeAiEngine = 'Google Gemini 1.5/2.0 Flash';
  else if (openaiConfigured) activeAiEngine = 'OpenAI GPT-4o Vision';

  res.status(200).json({
    status: 'HEALTHY',
    service: 'MediGuide AI: Automated Triage & Local Healthcare Engine',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    aiEngine: {
      activeProvider: activeAiEngine,
      geminiConfigured,
      openaiConfigured,
    },
    serverTime: new Date().toISOString(),
  });
});

// Single Page Application Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Central Error Handling
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
    ================================================================
    🏥  MediGuide AI: Automated Triage & Local Healthcare Engine
    ================================================================
    🌐  Server running at:  http://localhost:${PORT}
    🩺  Triage API:         http://localhost:${PORT}/api/triage/analyze
    📍  Doctors API:        http://localhost:${PORT}/api/doctors
    🚑  Hospitals API:      http://localhost:${PORT}/api/hospitals
    📅  Appointments API:   http://localhost:${PORT}/api/appointments
    ⚙️   System Status:      http://localhost:${PORT}/api/system/status
    ================================================================
    `);
  });
}

module.exports = app;
