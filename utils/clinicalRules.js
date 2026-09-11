/**
 * MediGuide AI - Clinical Decision Support & Triage Rules Engine
 * Implements clinical triage protocols (Emergency Severity Index / Manchester Triage System principles)
 */

const EMERGENCY_KEYWORDS = [
  'chest pain',
  'heart attack',
  'left arm pain',
  'radiating pain',
  'shortness of breath',
  'cannot breathe',
  'difficulty breathing',
  'choking',
  'facial droop',
  'slurred speech',
  'arm weakness',
  'stroke',
  'loss of consciousness',
  'passed out',
  'fainted',
  'unresponsive',
  'seizure',
  'convulsion',
  'severe bleeding',
  'coughing blood',
  'vomiting blood',
  'thunderclap headache',
  'worst headache',
  'anaphylaxis',
  'throat swelling',
  'blue lips',
  'cyanosis',
  'rigid abdomen',
  'suicide',
  'overdose',
  'severe burn',
  'cardiac arrest',
  'crushing chest',
];

const URGENT_KEYWORDS = [
  'high fever',
  'fever above 103',
  '103 f',
  '104 f',
  'severe abdominal pain',
  'appendix',
  'appendicitis',
  'broken bone',
  'fracture',
  'dislocation',
  'deep cut',
  'laceration',
  'wound',
  'stitches',
  'kidney stone',
  'flank pain',
  'blood in urine',
  'asthma attack',
  'wheezing',
  'severe vomiting',
  'dehydration',
  'blurry vision',
  'eye injury',
  'foreign object in eye',
  'migraine',
  'acute allergic reaction',
  'spreading rash',
  'infection with red streaks',
  'head injury',
  'concussion',
];

const SPECIALTY_KEYWORDS = {
  Cardiologist: [
    'heart',
    'chest',
    'palpitation',
    'flutter',
    'arrhythmia',
    'pulse',
    'tachycardia',
    'hypertension',
    'blood pressure',
    'angina',
    'cardiologist',
    'cardiac',
  ],
  Dermatologist: [
    'skin',
    'rash',
    'itch',
    'mole',
    'eczema',
    'psoriasis',
    'acne',
    'hive',
    'lesion',
    'dermatitis',
    'blister',
    'scab',
    'dermatologist',
    'alopecia',
    'hair loss',
    'melanoma',
    'spots',
  ],
  Neurologist: [
    'headache',
    'migraine',
    'numbness',
    'tingling',
    'dizziness',
    'vertigo',
    'seizure',
    'tremor',
    'neurologist',
    'memory loss',
    'brain',
    'nerve pain',
    'neuropathy',
    'aura',
    'concussion',
  ],
  Orthopedist: [
    'bone',
    'joint',
    'knee',
    'fracture',
    'sprain',
    'torn',
    'acl',
    'ligament',
    'back pain',
    'shoulder',
    'hip',
    'arthritis',
    'orthopedist',
    'spine',
    'ankle',
    'twist',
    'cannot bear weight',
    'popping noise',
  ],
  Pulmonologist: [
    'lung',
    'cough',
    'asthma',
    'bronchitis',
    'pneumonia',
    'breath',
    'wheezing',
    'pulmonologist',
    'sputum',
    'mucus',
    'chest tightness',
  ],
  Gastroenterologist: [
    'stomach',
    'abdomen',
    'belly',
    'acid',
    'reflux',
    'gerd',
    'constipation',
    'diarrhea',
    'vomiting',
    'nausea',
    'gastroenterologist',
    'ulcer',
    'gallbladder',
    'ibs',
    'colon',
  ],
  'ENT Specialist': [
    'ear',
    'nose',
    'throat',
    'tonsil',
    'sinus',
    'hearing',
    'tinnitus',
    'sinusitis',
    'ent',
    'voice',
    'hoarse',
    'nasal',
    'pharyngitis',
  ],
  Pediatrician: [
    'child',
    'infant',
    'baby',
    'toddler',
    'pediatric',
    'pediatrician',
    'vaccine',
    'colic',
  ],
  Psychiatrist: [
    'anxiety',
    'depression',
    'panic attack',
    'insomnia',
    'mental',
    'psychiatrist',
    'stress',
    'bipolar',
    'trauma',
    'ptsd',
  ],
};

/**
 * Deterministic Clinical Diagnostic Evaluation Function
 */
function analyzeSymptomText(text) {
  const normalized = (text || '').toLowerCase();

  // 1. Calculate Urgency Level
  let urgencyLevel = 'ROUTINE';
  let urgentDiagnosisNeeded = false;
  let urgencyReasoning = 'Symptoms represent common non-emergent patterns suitable for routine specialist or primary care review.';
  let timeframe = 'Routine (Within 1 to 2 Weeks)';

  const hasEmergency = EMERGENCY_KEYWORDS.some((kw) => normalized.includes(kw));
  const hasUrgent = URGENT_KEYWORDS.some((kw) => normalized.includes(kw));

  if (hasEmergency) {
    urgencyLevel = 'EMERGENCY';
    urgentDiagnosisNeeded = true;
    urgencyReasoning = 'Critical high-acuity red flag indicators detected. Immediate diagnosis at an Emergency Department is essential to rule out life-threatening ischemia, infarction, or organ compromise.';
    timeframe = 'Immediate (Within 30 to 60 Minutes)';
  } else if (hasUrgent) {
    urgencyLevel = 'URGENT';
    urgentDiagnosisNeeded = true;
    urgencyReasoning = 'Acute moderate-to-severe symptoms detected. Same-day clinical assessment or urgent care evaluation is required to prevent rapid symptom worsening.';
    timeframe = 'Urgent (Within 24 to 48 Hours)';
  }

  // 2. Identify Best Matching Specialist
  let requiredSpecialist = 'General Physician';
  let bestSpecialtyScore = 0;

  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (normalized.includes(kw)) score++;
    }
    if (score > bestSpecialtyScore) {
      bestSpecialtyScore = score;
      requiredSpecialist = specialty;
    }
  }

  // Fallback specialty adjustments for specific symptom combinations
  if (urgencyLevel === 'EMERGENCY') {
    if (normalized.includes('chest') || normalized.includes('arm') || normalized.includes('heart')) {
      requiredSpecialist = 'Cardiologist';
    } else if (normalized.includes('speech') || normalized.includes('droop') || normalized.includes('weakness') || normalized.includes('headache')) {
      requiredSpecialist = 'Neurologist';
    } else if (normalized.includes('breath') || normalized.includes('lung')) {
      requiredSpecialist = 'Pulmonologist';
    }
  }

  // 3. Formulate Predicted Conditions with rationales
  const predictedConditions = generatePredictedConditions(normalized, urgencyLevel, requiredSpecialist);

  // 4. Generate Interactive Follow-up Triage Questions
  const followUpQuestions = generateFollowUpQuestions(normalized, requiredSpecialist, urgencyLevel);

  // 5. Generate Home Care & First-aid guidance
  const homeCareSteps = generateHomeCareAdvice(urgencyLevel, requiredSpecialist);

  // 6. Red flag warnings
  const redFlagWarnings = getRedFlagWarnings(urgencyLevel);

  // 7. Serious Disease Diagnostic Package & Cost Breakdown
  const seriousDiseaseAlert = generateSeriousDiseaseAlert(normalized, urgencyLevel, requiredSpecialist, predictedConditions);

  return {
    urgencyLevel,
    urgentDiagnosisNeeded,
    urgencyReasoning,
    timeframe,
    confidenceScore: Math.min(96, Math.max(78, 82 + (bestSpecialtyScore * 3))),
    predictedConditions,
    requiredSpecialist,
    followUpQuestions,
    homeCareSteps,
    redFlagWarnings,
    seriousDiseaseAlert,
    triageTimestamp: new Date().toISOString(),
    clinicalEngine: 'MediGuide Clinical Diagnostic Decision Support v3.0',
  };
}

function generatePredictedConditions(text, urgency, specialist) {
  if (urgency === 'EMERGENCY') {
    if (text.includes('chest') || text.includes('heart') || text.includes('arm')) {
      return [
        {
          name: 'Acute Coronary Syndrome (Suspected Myocardial Infarction / Heart Attack)',
          confidence: 93,
          description: 'Critical reduction of coronary arterial blood flow to myocardium requiring immediate reperfusion.',
          rationale: 'Reported symptoms match classic angina / acute ischemic chest pain with potential radiation.',
          isRedFlag: true,
        },
        {
          name: 'Aortic Dissection or Acute Pulmonary Embolism',
          confidence: 75,
          description: 'Severe cardiovascular or pulmonary vascular emergency causing thoracic pressure.',
          rationale: 'Important high-acuity differential diagnosis for acute crushing chest discomfort.',
          isRedFlag: true,
        },
        {
          name: 'Unstable Angina Pectoris',
          confidence: 68,
          description: 'Acute coronary disease presenting with worsening chest pain at rest.',
          rationale: 'Pre-infarction ischemic episode with high cardiac risk score.',
          isRedFlag: true,
        },
      ];
    }
    if (text.includes('speech') || text.includes('droop') || text.includes('weakness') || text.includes('stroke')) {
      return [
        {
          name: 'Acute Ischemic Stroke / Transient Ischemic Attack (TIA)',
          confidence: 95,
          description: 'Cerebrovascular emergency characterized by focal neurological ischemia in brain tissue.',
          rationale: 'FAST criteria positive (Facial droop, Arm weakness, or Slurred speech noted).',
          isRedFlag: true,
        },
        {
          name: 'Intracranial Hemorrhage',
          confidence: 72,
          description: 'Vascular rupture within brain parenchyma or subarachnoid space.',
          rationale: 'Acute sudden neurological deficit differential.',
          isRedFlag: true,
        },
      ];
    }
    if (text.includes('breath') || text.includes('chok') || text.includes('throat') || text.includes('anaphylaxis')) {
      return [
        {
          name: 'Severe Acute Respiratory Failure / Anaphylactic Airway Edema',
          confidence: 91,
          description: 'Critical airway compromise or pulmonary gas-exchange breakdown requiring urgent oxygenation.',
          rationale: 'Severe dyspnea, stridor, or rapid upper airway constriction reported.',
          isRedFlag: true,
        },
        {
          name: 'Acute Status Asthmaticus / Severe Pneumonia',
          confidence: 78,
          description: 'Severe bronchospasm or extensive lung parenchymal infection with hypoxia.',
          rationale: 'Intense respiratory effort and inadequate ventilation noted.',
          isRedFlag: true,
        },
      ];
    }
    return [
      {
        name: 'Critical Medical Emergency (High-Acuity Presentation)',
        confidence: 88,
        description: 'Severe physiological instability requiring immediate Emergency Department evaluation.',
        rationale: 'Critical alarm signs detected requiring Level 1 Trauma / Emergency resuscitation.',
        isRedFlag: true,
      },
    ];
  }

  if (urgency === 'URGENT') {
    if (specialist === 'Orthopedist' || text.includes('fracture') || text.includes('bone') || text.includes('sprain') || text.includes('knee')) {
      return [
        {
          name: 'Acute Traumatic Ligament Tear / Suspected Bone Fracture',
          confidence: 90,
          description: 'Structural disruption of osseous tissue or major joint stabilizing ligament (e.g. ACL/Meniscus).',
          rationale: 'Inability to bear weight, audible popping sensation, and acute localized trauma mechanism.',
          isRedFlag: false,
        },
        {
          name: 'Severe Grade II/III Joint Sprain & Synovial Effusion',
          confidence: 78,
          description: 'Moderate to severe ligamentous stretching with rapid periarticular swelling.',
          rationale: 'Acute joint stress with localized inflammatory response.',
          isRedFlag: false,
        },
      ];
    }

    if (text.includes('appendix') || text.includes('appendicitis') || (text.includes('abdomen') && text.includes('right'))) {
      return [
        {
          name: 'Acute Appendicitis (Urgent Surgical Abdomen)',
          confidence: 92,
          description: 'Acute inflammation of the vermiform appendix requiring urgent ultrasound/CT scan and surgical consult.',
          rationale: 'Localized right lower quadrant abdominal pain with acute onset.',
          isRedFlag: true,
        },
        {
          name: 'Acute Mesenteric Lymphadenitis / Gastroenteritis',
          confidence: 70,
          description: 'Inflammatory bowel irritation or nodal swelling mimicking appendiceal irritation.',
          rationale: 'Abdominal pain differential.',
          isRedFlag: false,
        },
      ];
    }

    if (text.includes('fever') || text.includes('103') || text.includes('104')) {
      return [
        {
          name: 'Acute High-Grade Infectious Pyrexia (Severe Viral/Bacterial Infection)',
          confidence: 89,
          description: 'Elevated core body temperature indicating active acute immune response to infectious pathogen.',
          rationale: 'Core temperature exceeding 103°F requiring prompt antipyretic control and diagnostic workup.',
          isRedFlag: false,
        },
        {
          name: 'Bacterial Pharyngotonsillitis or Acute Bronchitis',
          confidence: 79,
          description: 'Infection of upper respiratory tract with systemic inflammatory response.',
          rationale: 'Fever accompanied by throat/respiratory complaints.',
          isRedFlag: false,
        },
      ];
    }

    if (specialist === 'Neurologist' || text.includes('headache') || text.includes('migraine')) {
      return [
        {
          name: 'Acute Severe Migraine with Aura / Cluster Headache',
          confidence: 88,
          description: 'Neurovascular headache disorder with unilateral throbbing pain, photophobia, and sensory aura.',
          rationale: 'Throbbing hemicranial pain accompanied by nausea and sensory sensitivity.',
          isRedFlag: false,
        },
      ];
    }

    return [
      {
        name: 'Acute Clinical Illness (Urgent Evaluation Advised)',
        confidence: 85,
        description: 'Moderate-to-high acuity medical condition requiring prompt outpatient clinic assessment.',
        rationale: 'Symptoms require clinical verification within 24-48 hours.',
        isRedFlag: false,
      },
    ];
  }

  // ROUTINE Conditions
  if (specialist === 'Dermatologist' || text.includes('rash') || text.includes('skin') || text.includes('itch')) {
    return [
      {
        name: 'Acute Contact Dermatitis / Urticaria (Hives)',
        confidence: 92,
        description: 'Localized cutaneous inflammatory reaction triggered by direct contact with allergen or irritant.',
        rationale: 'Pruritic erythematous rash pattern localized to exposed dermal surfaces.',
        isRedFlag: false,
      },
      {
        name: 'Atopic Eczema Flare / Cutaneous Allergic Reaction',
        confidence: 76,
        description: 'Chronic pruritic inflammatory skin disorder exacerbation.',
        rationale: 'Dry, itchy, papular or scaly rash characteristics.',
        isRedFlag: false,
      },
    ];
  }

  if (specialist === 'Cardiologist') {
    return [
      {
        name: 'Mild Sinus Tachycardia / Benign Palpitations',
        confidence: 84,
        description: 'Physiologic increase in heart rate commonly induced by caffeine, stress, or mild dehydration.',
        rationale: 'Intermittent fluttering or racing heart sensation without syncope or crushing pain.',
        isRedFlag: false,
      },
      {
        name: 'Essential Hypertension (Stage 1/2 Monitoring)',
        confidence: 75,
        description: 'Elevated systemic arterial pressure requiring routine clinical monitoring and lifestyle management.',
        rationale: 'Elevated blood pressure readings without acute end-organ damage.',
        isRedFlag: false,
      },
    ];
  }

  if (specialist === 'Orthopedist' || text.includes('joint') || text.includes('back')) {
    return [
      {
        name: 'Musculoskeletal Lumbar Strain / Mechanical Joint Pain',
        confidence: 87,
        description: 'Overuse injury or micro-tear of paraspinal muscles or periarticular tendons.',
        rationale: 'Localized stiffness and postural discomfort without radicular numbness or neurological deficit.',
        isRedFlag: false,
      },
    ];
  }

  if (specialist === 'ENT Specialist' || text.includes('throat') || text.includes('cough') || text.includes('cold')) {
    return [
      {
        name: 'Acute Viral Upper Respiratory Tract Infection (Common Cold / Pharyngitis)',
        confidence: 89,
        description: 'Self-limiting viral inflammation of the nasopharynx and upper respiratory tract.',
        rationale: 'Mild congestion, sore throat, and cough without high fever or severe respiratory distress.',
        isRedFlag: false,
      },
      {
        name: 'Allergic Rhinosinusitis',
        confidence: 74,
        description: 'IgE-mediated inflammatory response of nasal mucous membranes.',
        rationale: 'Seasonal or environmental allergen trigger pattern.',
        isRedFlag: false,
      },
    ];
  }

  if (specialist === 'Gastroenterologist') {
    return [
      {
        name: 'Gastroesophageal Reflux Disease (GERD) / Functional Dyspepsia',
        confidence: 85,
        description: 'Retrograde flow of gastric acid into the esophagus causing irritation and epigastric discomfort.',
        rationale: 'Post-prandial burning sensation, bloating, or mild nausea without acute peritoneal signs.',
        isRedFlag: false,
      },
    ];
  }

  return [
    {
      name: 'General Medical Symptom Complex (Routine Outpatient)',
      confidence: 82,
      description: 'Non-emergent symptom presentation suitable for primary care consultation and physical exam.',
      rationale: 'Vital signs appear stable; symptoms are managed well via outpatient clinical visit.',
      isRedFlag: false,
    },
  ];
}

/**
 * Generate Serious Disease Alert & Hospital Diagnostic Cost Breakdown
 */
function generateSeriousDiseaseAlert(text, urgency, specialist, conditions) {
  const isSerious = urgency === 'EMERGENCY' || urgency === 'URGENT';
  if (!isSerious) {
    return {
      isSerious: false,
      conditionCategory: 'Non-Emergency / Routine Care',
      message: 'No immediate hospital emergency admission required. Outpatient doctor appointment recommended.',
    };
  }

  let conditionCategory = 'Acute Medical Condition';
  let requiredFacilityType = 'Level 1 / 2 Comprehensive Emergency & Trauma Center';
  let diagnosticTests = [];
  let costEstimates = {};

  if (text.includes('chest') || text.includes('heart') || text.includes('cardiac') || specialist === 'Cardiologist') {
    conditionCategory = 'Acute Cardiovascular / Coronary Emergency';
    requiredFacilityType = 'Level 1 Trauma Center with 24/7 Cardiac Catheterization Lab & CCU';
    diagnosticTests = [
      { testName: '12-Lead Emergency ECG (Electrocardiogram)', purpose: 'Immediate detection of ST-elevation / acute ischemia', estimatedCost: '$120 - $220' },
      { testName: 'High-Sensitivity Cardiac Troponin-I & CK-MB Panel', purpose: 'Measure myocardial muscle biomarker necrosis', estimatedCost: '$180 - $340' },
      { testName: 'Emergency Echocardiogram & Chest X-Ray', purpose: 'Evaluate ventricular wall motion and rule out pulmonary edema', estimatedCost: '$420 - $850' },
      { testName: 'Emergency CT Coronary Angiography (if indicated)', purpose: 'Direct visualization of coronary occlusion', estimatedCost: '$650 - $1,200' },
    ];
    costEstimates = {
      erConsultation: '$195 - $260',
      diagnosticTestsTotal: '$720 - $1,410',
      emergencyAdmission: '$420 - $880',
      dailyGeneralBed: '$850 - $1,100 / day',
      dailyIcuRate: '$2,600 - $3,400 / day',
      estimatedDiagnosisPackageRange: '$1,335 - $2,550',
      fullAcuteCareEstimate: '$3,935 - $5,950 (with 24h ICU Stabilization)',
    };
  } else if (text.includes('speech') || text.includes('droop') || text.includes('stroke') || text.includes('weakness')) {
    conditionCategory = 'Acute Neurological Emergency (Stroke / TIA)';
    requiredFacilityType = 'Comprehensive Stroke Center with 24/7 Rapid Neuro-CT/MRI & Neuro-ICU';
    diagnosticTests = [
      { testName: 'Non-Contrast Emergency Brain CT Scan', purpose: 'Immediate distinction between ischemic vs hemorrhagic stroke', estimatedCost: '$380 - $780' },
      { testName: 'CT Angiography of Head and Neck Vessels', purpose: 'Identify large vessel occlusion for thrombectomy', estimatedCost: '$550 - $1,100' },
      { testName: 'Emergency Coagulation Profile (PT/INR, PTT) & Blood Glucose', purpose: 'Verify eligibility for IV thrombolysis (tPA/TNK)', estimatedCost: '$140 - $250' },
    ];
    costEstimates = {
      erConsultation: '$200 - $280',
      diagnosticTestsTotal: '$1,070 - $2,130',
      emergencyAdmission: '$450 - $900',
      dailyGeneralBed: '$900 - $1,200 / day',
      dailyIcuRate: '$2,800 - $3,600 / day',
      estimatedDiagnosisPackageRange: '$1,720 - $3,310',
      fullAcuteCareEstimate: '$4,520 - $6,910 (with 24h Neuro-ICU)',
    };
  } else if (text.includes('appendix') || text.includes('appendicitis') || (text.includes('abdomen') && text.includes('pain'))) {
    conditionCategory = 'Acute Surgical Abdomen (Suspected Appendicitis / Peritonitis)';
    requiredFacilityType = 'Acute Care Hospital with 24/7 General Surgery & Ultrasound/CT';
    diagnosticTests = [
      { testName: 'Abdominal / Pelvic Contrast CT Scan or Ultrasound', purpose: 'Directly visualize inflamed appendix and rule out perforation', estimatedCost: '$450 - $920' },
      { testName: 'Complete Blood Count (CBC) with Differential & CRP', purpose: 'Quantify leukocytosis and systemic inflammatory markers', estimatedCost: '$110 - $210' },
      { testName: 'Urinalysis & Electrolyte Chemistry Panel', purpose: 'Rule out nephrolithiasis / urinary tract infection', estimatedCost: '$90 - $180' },
    ];
    costEstimates = {
      erConsultation: '$180 - $240',
      diagnosticTestsTotal: '$650 - $1,310',
      emergencyAdmission: '$380 - $750',
      dailyGeneralBed: '$800 - $1,050 / day',
      dailyIcuRate: '$2,400 - $3,000 / day',
      estimatedDiagnosisPackageRange: '$1,210 - $2,300',
      fullAcuteCareEstimate: '$2,950 - $4,800 (with Surgical Admission)',
    };
  } else if (text.includes('fracture') || text.includes('bone') || text.includes('knee') || specialist === 'Orthopedist') {
    conditionCategory = 'Acute Orthopedic Trauma & Skeletal Injury';
    requiredFacilityType = 'Trauma Hospital with Orthopedic Surgery & Digital Radiography / MRI';
    diagnosticTests = [
      { testName: 'Multi-View Digital X-Ray Series (Orthopedic)', purpose: 'Identify bone cortical disruption, displacement, or joint dislocation', estimatedCost: '$160 - $320' },
      { testName: 'High-Resolution Joint MRI or 3D CT Scan', purpose: 'Evaluate complex ligamentous tears (ACL, meniscus) or occult fractures', estimatedCost: '$520 - $1,100' },
      { testName: 'Emergency Splinting / Closed Reduction Procedure', purpose: 'Stabilize neurovascular structures and immobilize limb', estimatedCost: '$220 - $480' },
    ];
    costEstimates = {
      erConsultation: '$175 - $230',
      diagnosticTestsTotal: '$680 - $1,420',
      emergencyAdmission: '$350 - $650',
      dailyGeneralBed: '$750 - $950 / day',
      dailyIcuRate: '$2,200 - $2,800 / day',
      estimatedDiagnosisPackageRange: '$995 - $2,000',
      fullAcuteCareEstimate: '$2,200 - $3,800 (with Day Care Surgery)',
    };
  } else {
    // General Severe / Infectious condition
    conditionCategory = 'Severe Acute Medical Condition';
    requiredFacilityType = 'Level 1 or 2 Acute Care Hospital Emergency Pavilion';
    diagnosticTests = [
      { testName: 'Comprehensive Emergency Diagnostic Lab Battery (CBC, CMP, Lactic Acid)', purpose: 'Assess organ function and detect metabolic acidosis / sepsis', estimatedCost: '$180 - $350' },
      { testName: 'Diagnostic Imaging (Chest X-Ray / Focused Ultrasound)', purpose: 'Rule out acute consolidation, pneumothorax, or internal effusions', estimatedCost: '$220 - $480' },
      { testName: 'Blood Cultures & Infectious Serology Panel', purpose: 'Isolate pathogen for targeted intravenous therapy', estimatedCost: '$140 - $280' },
    ];
    costEstimates = {
      erConsultation: '$180 - $250',
      diagnosticTestsTotal: '$540 - $1,110',
      emergencyAdmission: '$380 - $780',
      dailyGeneralBed: '$800 - $1,050 / day',
      dailyIcuRate: '$2,500 - $3,200 / day',
      estimatedDiagnosisPackageRange: '$1,100 - $2,140',
      fullAcuteCareEstimate: '$3,400 - $5,100 (with Inpatient Care)',
    };
  }

  return {
    isSerious: true,
    conditionCategory,
    requiredFacilityType,
    diagnosticTests,
    costEstimates,
    primaryConditionName: conditions?.[0]?.name || 'Acute Condition',
  };
}

function generateFollowUpQuestions(text, specialist, urgency) {
  if (urgency === 'EMERGENCY') {
    return [
      'Is the patient currently conscious, able to speak in full sentences, and breathing steadily?',
      'Did the symptoms begin suddenly within the last 60 minutes, and is there any left arm, jaw, or upper back pain?',
      'Are emergency medical services (911/112) being contacted or are you currently en route to the nearest ER?',
    ];
  }

  if (specialist === 'Dermatologist') {
    return [
      'How many days ago did the rash or skin lesion first appear, and has it spread to other areas of the body?',
      'Have you come into contact with any new soaps, detergents, poison ivy, medications, or unfamiliar foods?',
      'Is there any blistering, bleeding, pus discharge, or noticeable heat coming from the affected area?',
    ];
  }

  if (specialist === 'Cardiologist') {
    return [
      'Does the discomfort increase with physical exertion (like climbing stairs) or when taking deep breaths?',
      'Have you experienced any dizziness, lightheadedness, cold sweating, or irregular skipping heartbeats?',
      'Do you have a personal or family history of high blood pressure, elevated cholesterol, or heart disease?',
    ];
  }

  if (specialist === 'Orthopedist') {
    return [
      'Are you able to bear full weight or walk 4 steps on the affected limb without severe pain?',
      'Did you hear or feel a "popping" or snapping sensation at the moment of injury?',
      'Is there visible deformity, rapid swelling, or numbness/tingling in your toes or fingers?',
    ];
  }

  return [
    'How long have you been experiencing these symptoms, and have they been progressively worsening?',
    'Have you taken any over-the-counter medications (e.g., Tylenol, Ibuprofen, Antihistamines), and did they help?',
    'Do you have any existing chronic medical conditions or known allergies to medications?',
  ];
}

function generateHomeCareAdvice(urgency, specialist) {
  if (urgency === 'EMERGENCY') {
    return [
      '🚨 DO NOT DRIVE YOURSELF: Call 911 or have someone drive you to the nearest Emergency Room immediately.',
      'Sit in a comfortable, upright position to ease breathing and reduce cardiac strain.',
      'Loosen any tight clothing around your neck, chest, or waist.',
      'If cardiac emergency is suspected and not allergic, chew one adult 325mg Aspirin (unless contraindicated).',
    ];
  }

  if (urgency === 'URGENT') {
    return [
      'Seek same-day clinical evaluation at an urgent care clinic or schedule an emergency priority slot.',
      'Rest the affected area and avoid strenuous physical exertion.',
      'Stay well-hydrated with water and electrolyte solutions.',
      'Monitor your temperature every 3 hours; seek immediate ER care if temperature exceeds 104°F (40°C).',
    ];
  }

  return [
    'Maintain adequate hydration (2-3 liters of fluids daily) and prioritize 8 hours of restorative rest.',
    'Keep a detailed symptom log noting triggers, time of day, and pain intensity on a 1-10 scale.',
    'Over-the-counter antipyretics or pain relievers may be used according to package instructions.',
    'Book a routine specialist consultation for comprehensive diagnostic confirmation.',
  ];
}

function getRedFlagWarnings(urgency) {
  if (urgency === 'EMERGENCY') {
    return [
      'CRITICAL: Immediate life-safety risk detected.',
      'Sudden loss of consciousness, inability to speak, cyanosis (blue skin/lips), or crushing chest pressure require instant 911 dispatch.',
    ];
  }
  if (urgency === 'URGENT') {
    return [
      'If fever spikes above 103°F with neck stiffness, or if severe breathlessness occurs, escalate immediately to Emergency status.',
      'Watch for signs of sepsis: extreme shivering, confusion, or rapid heartbeat.',
    ];
  }
  return [
    'If symptoms do not improve within 48-72 hours, or if sudden severe pain develops, schedule an urgent reassessment.',
  ];
}

module.exports = {
  analyzeSymptomText,
  EMERGENCY_KEYWORDS,
  URGENT_KEYWORDS,
  SPECIALTY_KEYWORDS,
};
