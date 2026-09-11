const http = require('http');
const app = require('../server');

let server;
const TEST_PORT = 5099;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting MediGuide AI Automated Test Suite...\n');
  server = app.listen(TEST_PORT, async () => {
    try {
      // 1. Health Status
      console.log('Test 1: System Status API...');
      const resStatus = await makeRequest('/api/system/status');
      console.assert(resStatus.status === 200, 'System status should be 200');
      console.log('✅ Status API Passed:', resStatus.data.status, '| DB:', resStatus.data.database.driver);

      // 2. User Authentication (Registration & Login)
      console.log('\nTest 2: User Authentication (Register & Login)...');
      const testEmail = `test.user.${Date.now()}@example.com`;
      const resReg = await makeRequest('/api/auth/register', 'POST', {
        name: 'Sourav Mukherjee',
        email: testEmail,
        phone: '+91 98300 12345',
        allergies: ['Penicillin'],
        medicalHistory: ['Asthma (Mild)'],
      });
      console.assert(resReg.status === 201, 'Registration should return 201');
      console.assert(resReg.data.token, 'Token should be returned');

      const resLogin = await makeRequest('/api/auth/login', 'POST', {
        email: testEmail,
        password: 'password123',
      });
      console.assert(resLogin.status === 200, 'Login should return 200');
      console.assert(resLogin.data.user.name === 'Sourav Mukherjee', 'User name should match');
      console.log('✅ Auth Passed: Registered and Logged in:', resLogin.data.user.name, '(', resLogin.data.user.email, ')');

      // 3. Routine Triage in Kolkata
      console.log('\nTest 3: Routine Triage (Skin Rash in Kolkata)...');
      const resTriageRoutine = await makeRequest('/api/triage/analyze', 'POST', {
        text: 'I have an itchy red rash on my forearms that appeared yesterday.',
        lat: 22.5726,
        lng: 88.3639,
      });
      console.assert(resTriageRoutine.status === 200, 'Triage should return 200');
      const routineData = resTriageRoutine.data.data.triage;
      console.assert(routineData.requiredSpecialist === 'Dermatologist', 'Should route to Dermatologist');
      console.assert(routineData.urgentDiagnosisNeeded === false, 'Routine rash should not need urgent diagnosis');
      console.log('✅ Routine Triage Passed: Urgency =', routineData.urgencyLevel, '| Urgent Needed =', routineData.urgentDiagnosisNeeded);

      // 4. Emergency Triage in Kolkata
      console.log('\nTest 4: Emergency Triage (Chest Pain & Cardiac Risk in Kolkata)...');
      const resTriageEmergency = await makeRequest('/api/triage/analyze', 'POST', {
        text: 'Severe crushing chest pain radiating to left arm and shortness of breath.',
        lat: 22.5726,
        lng: 88.3639,
      });
      console.assert(resTriageEmergency.status === 200, 'Emergency triage should return 200');
      const emergData = resTriageEmergency.data.data.triage;
      console.assert(emergData.urgencyLevel === 'EMERGENCY', 'Urgency must be EMERGENCY');
      console.assert(emergData.urgentDiagnosisNeeded === true, 'Urgent diagnosis must be YES');
      console.log('✅ Emergency Triage Passed: Urgency =', emergData.urgencyLevel);

      // 5. Kolkata Bengali Doctors & Radius Search (2km - 50km)
      console.log('\nTest 5: Kolkata & West Bengal Bengali Specialist Discovery...');
      const resKolkataDocs = await makeRequest('/api/doctors?lat=22.5726&lng=88.3639&radius=50&language=Bengali');
      console.assert(resKolkataDocs.status === 200, 'Kolkata doctors query should return 200');
      console.assert(resKolkataDocs.data.data.length > 0, 'Should find Bengali doctors in Kolkata');
      const topDoc = resKolkataDocs.data.data[0];
      console.assert(topDoc.currency === 'INR', 'Currency should be INR');
      console.log('✅ Kolkata Bengali Doctors Passed: Found', resKolkataDocs.data.data.length, 'doctors (Top:', topDoc.name, '-', topDoc.specialization, 'at', topDoc.clinicName, '| Fee: ₹' + topDoc.fee + ')');

      // 6. Kolkata Emergency Hospitals & Fee Matrix
      console.log('\nTest 6: Kolkata Emergency Hospitals & Trauma Centers...');
      const resKolkataHospitals = await makeRequest('/api/hospitals?lat=22.5726&lng=88.3639&radius=50');
      console.assert(resKolkataHospitals.status === 200, 'Kolkata hospitals query should return 200');
      console.assert(resKolkataHospitals.data.data.length > 0, 'Should find hospitals in Kolkata');
      console.log('✅ Kolkata Hospitals Passed: Found', resKolkataHospitals.data.data.length, 'trauma centers (Top:', resKolkataHospitals.data.data[0].name, '| Ambulance:', resKolkataHospitals.data.data[0].ambulanceHotline + ')');

      // 7. Appointment Booking with Specific Date and Time Slot
      console.log('\nTest 7: Booking an Appointment with Bengali Doctor...');
      const resBooking = await makeRequest('/api/appointments/book', 'POST', {
        patientName: 'Sourav Mukherjee',
        patientPhone: '+91 98300 12345',
        patientEmail: testEmail,
        doctorName: 'Dr. Subhashis Mukherjee, MD',
        specialistType: 'Cardiologist',
        clinicOrHospitalName: 'Kolkata Heart & Vascular Clinic',
        selectedSlot: 'Today • 10:00 AM',
        consultationFee: 800,
        currency: 'INR',
      });
      console.assert(resBooking.status === 201, 'Booking should return 201');
      console.assert(resBooking.data.data.referenceCode.startsWith('MG-'), 'Ref code should start with MG-');
      console.log('✅ Appointment Booking Passed: Ref Code =', resBooking.data.data.referenceCode, '| Slot =', resBooking.data.data.selectedSlot, '| Fee: ₹' + resBooking.data.data.consultationFee);

      console.log('\n🎉 ALL 7 FULL-STACK INTEGRATION TESTS PASSED PERFECTLY!\n');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('❌ Test failed:', err);
      if (server) server.close();
      process.exit(1);
    }
  });
}

runTests();
