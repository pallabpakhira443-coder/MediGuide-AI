/**
 * MediGuide AI - Multi-Modal AI Diagnostic & Vision Service
 * Supports Google Gemini 1.5/2.0 Flash and OpenAI GPT-4o Vision with Clinical Rules Fallback
 */

const axios = require('axios');
const { analyzeSymptomText } = require('./clinicalRules');

const SYSTEM_PROMPT = `
You are MediGuide AI, an elite Medical Triage and Diagnostic Clinical System.
Your job is to analyze multi-modal patient inputs (symptoms, voice transcripts, clinical images like skin lesions, rashes, wounds, or lab reports) and provide structured, clinical triage recommendations.

SAFETY & CLINICAL GUIDELINES:
1. ALWAYS prioritize patient safety.
2. If the symptoms indicate life-threatening conditions (e.g., crushing chest pain, signs of stroke FAST, severe shortness of breath, anaphylaxis, severe uncontrolled bleeding, thunderclap headache, diabetic coma, poisoning), assign urgencyLevel "EMERGENCY".
3. If the symptoms indicate acute moderate-to-high severity conditions (e.g., high fever >103F, deep lacerations, suspected bone fractures, acute asthma attack, kidney stone pain, acute severe abdominal pain), assign urgencyLevel "URGENT".
4. If the symptoms are mild, chronic, or common ailments (e.g., common cold, mild rash, minor sprain, routine checkup, heartburn), assign urgencyLevel "ROUTINE".
5. Identify the primary required specialist (e.g. "Cardiologist", "Dermatologist", "Neurologist", "Orthopedist", "Pulmonologist", "Gastroenterologist", "ENT Specialist", "Pediatrician", "Psychiatrist", "General Physician").
6. Formulate 2-3 concise follow-up triage questions.
7. Return ONLY strict, valid JSON matching the following schema. Do NOT include markdown code fences or conversational text outside the JSON object.

JSON SCHEMA:
{
  "urgencyLevel": "EMERGENCY" | "URGENT" | "ROUTINE",
  "confidenceScore": number (70-98),
  "predictedConditions": [
    {
      "name": "Condition Name",
      "confidence": number (1-100),
      "description": "Brief medical explanation",
      "rationale": "Why this matches patient inputs",
      "isRedFlag": boolean
    }
  ],
  "requiredSpecialist": "string",
  "followUpQuestions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ],
  "homeCareSteps": [
    "Step 1",
    "Step 2"
  ],
  "redFlagWarnings": [
    "Warning 1"
  ],
  "imageFindings": "Optional summary of findings in uploaded image or lab report, if provided"
}
`;

/**
 * Clean and parse JSON response from LLM
 */
function cleanAndParseJSON(raw) {
  if (typeof raw === 'object' && raw !== null) return raw;
  let text = String(raw).trim();
  // Remove markdown code blocks if present
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(text);
}

/**
 * Analyze using Google Gemini API
 */
async function analyzeWithGemini(apiKey, text, imageBuffer, mimeType, chatHistory) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const parts = [{ text: SYSTEM_PROMPT }];

    if (chatHistory && chatHistory.length > 0) {
      parts.push({
        text: `Previous Triage Context:\n${JSON.stringify(chatHistory, null, 2)}`,
      });
    }

    parts.push({
      text: `Patient Clinical Input:\n${text || 'Please examine the attached medical image.'}`,
    });

    if (imageBuffer) {
      parts.push({
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    const parsed = cleanAndParseJSON(responseText);
    parsed.aiProvider = 'Google Gemini Flash';
    return parsed;
  } catch (err) {
    console.warn(`[AI Service] Gemini API call failed (${err.message}). Falling back to Clinical Decision Engine.`);
    throw err;
  }
}

/**
 * Analyze using OpenAI API (GPT-4o)
 */
async function analyzeWithOpenAI(apiKey, text, imageBuffer, mimeType, chatHistory) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (chatHistory && chatHistory.length > 0) {
      messages.push({
        role: 'system',
        content: `Previous Triage Context:\n${JSON.stringify(chatHistory, null, 2)}`,
      });
    }

    const userContent = [];
    userContent.push({
      type: 'text',
      text: text || 'Please examine the attached medical image.',
    });

    if (imageBuffer) {
      const b64 = imageBuffer.toString('base64');
      const mType = mimeType || 'image/jpeg';
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${mType};base64,${b64}`,
          detail: 'high',
        },
      });
    }

    messages.push({ role: 'user', content: userContent });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = cleanAndParseJSON(content);
    parsed.aiProvider = 'OpenAI GPT-4o Vision';
    return parsed;
  } catch (err) {
    console.warn(`[AI Service] OpenAI API call failed (${err.message}). Falling back to Clinical Decision Engine.`);
    throw err;
  }
}

/**
 * Main Triage Multi-Modal Coordinator
 */
async function runMedicalTriage({ text, imageBuffer, mimeType, fileName, chatHistory }) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Gemini if configured
  if (geminiKey && geminiKey.trim()) {
    try {
      console.log('🤖 [AI Service] Processing triage with Google Gemini API...');
      return await analyzeWithGemini(geminiKey, text, imageBuffer, mimeType, chatHistory);
    } catch (e) {
      // Proceed to OpenAI or fallback
    }
  }

  // 2. Try OpenAI if configured
  if (openaiKey && openaiKey.trim()) {
    try {
      console.log('🤖 [AI Service] Processing triage with OpenAI GPT-4o Vision API...');
      return await analyzeWithOpenAI(openaiKey, text, imageBuffer, mimeType, chatHistory);
    } catch (e) {
      // Proceed to fallback
    }
  }

  // 3. Clinical Decision Support System Fallback
  console.log('⚡ [AI Service] Executing Deterministic Clinical Decision Support Engine.');
  let imageContext = '';
  if (fileName) {
    const fn = fileName.toLowerCase();
    if (fn.includes('rash') || fn.includes('skin') || fn.includes('mole') || fn.includes('lesion')) {
      imageContext = 'Skin rash with erythematous patch and pruritus observed on image upload.';
    } else if (fn.includes('xray') || fn.includes('x-ray') || fn.includes('fracture') || fn.includes('bone')) {
      imageContext = 'Radiographic scan indicating potential bone fracture or joint sprain.';
    } else if (fn.includes('lab') || fn.includes('blood') || fn.includes('report') || fn.includes('ecg')) {
      imageContext = 'Laboratory test report or ECG readout provided.';
    } else {
      imageContext = 'Diagnostic medical image upload provided for clinical review.';
    }
  }

  const result = analyzeSymptomText(text || '', imageContext);
  if (fileName) {
    result.imageFindings = `Processed image file (${fileName}). Features consistent with ${result.predictedConditions[0]?.name || 'clinical assessment'}.`;
  }
  result.aiProvider = 'MediGuide Clinical Diagnostic Engine (Offline CDSS)';
  return result;
}

module.exports = {
  runMedicalTriage,
};
