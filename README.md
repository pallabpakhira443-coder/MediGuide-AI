# 🩺 MediGuide AI - Automated Medical Triage & Local Healthcare Engine

An intelligent clinical decision support system (CDSS) and local healthcare discovery engine that analyzes patient symptoms via text, voice, or medical images, determines urgent diagnosis requirements, matches verified specialists within a 50 km radius with live consultation fees, and calculates comprehensive emergency hospital diagnosis packages.

---

## 🌟 Key Features

### 1. 🎤 Multi-Modal Symptom Input & Clinical Triage
- **Live Voice Search**: Speak symptoms using browser speech recognition with real-time audio waveform visualizers.
- **Visual Body Area Selector**: 1-click interactive body area navigator (Head & Brain, Chest & Heart, Lungs, Stomach, Joints, Skin, ENT, Fever) that suggests clinically relevant symptoms.
- **Multi-Modal Image & Scan Upload**: Upload medical photos, rash images, or lab reports for multimodal analysis.
- **1-Click Clinical Scenarios**: Instant demo presets for Emergency Chest Pain, Acute Appendicitis, Severe Migraine, Knee Trauma, Contact Dermatitis, and High Fever.

### 2. 🚨 Urgency & Diagnosis Determination
- **Urgent Care Flagging**: Instant categorisation into `EMERGENCY` (Red), `URGENT` (Orange), `ROUTINE` (Green), or `SELF-CARE` (Blue).
- **Ranked Differential Diagnoses**: AI disease prediction with clinical confidence percentages, ICD-10 codes, and clinical rationale.
- **Interactive Follow-Up Questionnaire**: Dynamic patient Q&A to refine diagnostic confidence.
- **Voice Readout (TTS)**: Built-in text-to-speech to listen to triage recommendations and home care steps aloud.
- **Simple vs Clinical View**: Toggle between plain-English patient terms and detailed clinical medical terminology.

### 3. 🏥 Emergency Hospital Diagnostics & Cost Engine
- **Dedicated Trauma Center Matching**: Locates capable Level 1 trauma and emergency diagnostic centers for serious conditions.
- **Itemized Diagnostic Tests**: Detailed breakdown of emergency tests required (e.g. ECG, Troponin I/T, CT Angiography, Echocardiogram, Appendiceal Ultrasound) with individual price tags.
- **Total Diagnostic Cost Packages**: Low-to-high cost estimates for initial stabilization and emergency workup.
- **Instant Emergency Actions**: 1-click "Call 911 / ER" and GPS navigation directions.

### 4. 📍 50 km Specialist Doctor Directory & Appointment Booking
- **Custom Radial Distance Filtering**: Filter specialists within 5 km, 15 km, 25 km, or 50 km.
- **Transparent Consultation Fees**: Clear pricing display for every physician.
- **Interactive Leaflet Map**: Map with custom pins, radius circles, and doctor highlighting.
- **Multi-Factor Sorting**: Sort by closest distance, highest rating, lowest fee, or years of experience.
- **Real-Time Appointment Slot Booking**: Interactive modal with date picker, morning/afternoon/evening slots, patient history autofill, and printable confirmation pass with reference code (e.g. `MG-832461`).

### 5. 🛠️ User Preferences & Offline Resilience
- **Location Switcher Modal**: Live GPS geolocation or 1-click selection of major global cities (New York, London, Toronto, Sydney, Tokyo, Mumbai, Berlin, Paris).
- **Hospital Fee Comparison Matrix**: Compare trauma facilities and urgent care centers side-by-side.
- **Theme & Font Scaler**: Dark Mode / Clean Medical Light theme toggle, and normal/large/extra-large font scalers.
- **Offline / Resilient Fallback Engine**: Works out-of-the-box without requiring external MongoDB or paid API keys. Optional Gemini API or OpenAI API integration can be enabled via `.env`.

---

## 🚀 Quick Start Guide

### 1. Installation
Ensure [Node.js](https://nodejs.org/) (v16 or newer) is installed:
```bash
git clone <repo-url>
cd mediguide-ai
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The system works completely offline with its built-in CDSS clinical rules engine. You can optionally add `GEMINI_API_KEY` or `MONGODB_URI` if desired).*

### 3. Start the Server
```bash
npm start
```
Open your browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🧪 Automated Testing

Run the full end-to-end integration test suite:
```bash
npm test
```

The test suite validates:
1. System Status & Health Diagnostics API
2. User Authentication (Register & Login)
3. Routine Triage Analysis (e.g. Contact Dermatitis)
4. Emergency Triage Analysis & Serious Disease Alert (e.g. Acute Myocardial Infarction)
5. Global Geolocation Radar (e.g. 50 km Doctor Search in London, UK)
6. Hospital Fee Comparison Matrix
7. Appointment Booking with Specific Date & Time Slot

---

## 📁 Project Architecture

```
mediguide-ai/
├── config/
│   └── db.js                 # MongoDB connection with In-Memory fallback
├── controllers/
│   ├── appointmentController.js # Appointment scheduling & cancellation
│   ├── authController.js        # User auth & profile management
│   ├── doctorController.js      # 50km doctor radial query & sorting
│   ├── hospitalController.js    # Hospital emergency facilities & fee matrix
│   └── triageController.js      # Symptom analysis & urgency determination
├── models/
│   ├── Appointment.js        # Appointment schema
│   ├── Doctor.js             # Doctor schema with geospatial index
│   ├── Hospital.js           # Hospital & ER facility schema
│   └── User.js               # User & medical profile schema
├── public/
│   ├── css/
│   │   ├── style.css         # Responsive medical UI design system
│   │   └── animations.css    # Micro-animations, pulses & transitions
│   ├── js/
│   │   ├── app.js            # App orchestrator & navigation
│   │   ├── audioFx.js        # Web Audio API sound synthesizers
│   │   ├── authService.js    # Client authentication controller
│   │   ├── bookingModal.js   # Appointment slot picker & pass generator
│   │   ├── imageUpload.js    # Image attachment handler
│   │   ├── locationModal.js  # Geolocation & city picker modal
│   │   ├── mapService.js     # Leaflet interactive map service
│   │   ├── triageUI.js       # Diagnosis renderer & dynamic questionnaires
│   │   └── voiceRecorder.js  # Voice recognition & visualizer
│   └── index.html            # Main Single Page Application interface
├── routes/
│   ├── appointmentRoutes.js  # Appointment API endpoints
│   ├── authRoutes.js         # Authentication API endpoints
│   ├── doctorRoutes.js       # Doctor search & filter endpoints
│   ├── hospitalRoutes.js     # Hospital & fee matrix endpoints
│   └── triageRoutes.js       # Triage analysis endpoint
├── test/
│   └── api.test.js           # Automated integration test suite
├── utils/
│   ├── aiService.js          # Hybrid AI engine (Gemini + Local CDSS)
│   ├── mockData.js           # Seed data for doctors and trauma centers
│   └── storageFallback.js    # In-memory database fallback
├── server.js                 # Express application entrypoint
└── package.json              # Dependencies and scripts
```

---

## 🌐 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/system/status` | System health, uptime & active AI engine |
| `POST` | `/api/triage/analyze` | Multi-modal symptom triage & urgency rating |
| `GET` | `/api/doctors` | Find doctors up to 50 km with fee and specialty filters |
| `GET` | `/api/hospitals` | Find nearest trauma & emergency centers |
| `GET` | `/api/hospitals/compare-fees` | Compare hospital emergency diagnostic fees |
| `POST` | `/api/appointments/book` | Book a doctor appointment with date/slot |
| `GET` | `/api/appointments/my-bookings` | Retrieve user booked appointments |
| `POST` | `/api/auth/register` | Register a new patient account |
| `POST` | `/api/auth/login` | Patient login |

---

## 📄 License
MIT License. Created with ❤️ for healthcare accessibility.
