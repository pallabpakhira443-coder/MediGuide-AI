/**
 * Comprehensive Healthcare Dataset for MediGuide AI
 * Includes Authentic Bengali Specialists & Hospitals for Kolkata / West Bengal,
 * Global Medical Providers, and Radius-Wise Geo-Projection (2 km to 50 km).
 */

// Haversine distance calculator in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// -----------------------------------------------------------------------------
// 0. NEW DELHI & NCR SPECIALISTS (Coordinates centered at Connaught Place 28.6304, 77.2177)
// -----------------------------------------------------------------------------
const delhiDoctors = [
  {
    _id: 'del_doc_001',
    name: 'Dr. Rajesh Sharma, MD, DM (Cardiology)',
    specialization: 'Cardiologist',
    clinicName: 'Delhi Heart & Vascular Institute',
    address: 'Block E, Connaught Place, New Delhi 110001',
    location: { type: 'Point', coordinates: [77.2185, 28.6315] },
    fee: 900,
    currency: 'INR',
    rating: 4.96,
    reviewCount: 420,
    experienceYears: 20,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 11 2341 5566',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['10:00 AM', '11:30 AM', '04:30 PM', '06:45 PM'],
    qualifications: ['MBBS (AIIMS New Delhi)', 'MD (Maulana Azad)', 'DM Cardiology (AIIMS)', 'FACC'],
    languages: ['Hindi', 'English', 'Punjabi'],
    acceptsInsurance: true,
  },
  {
    _id: 'del_doc_002',
    name: 'Dr. Neha Kapoor, MD, DNB (Dermatology)',
    specialization: 'Dermatologist',
    clinicName: 'Aura Skin & Laser Aesthetic Clinic',
    address: 'Barakhamba Road, Near Metro Gate 3, Connaught Place, New Delhi 110001',
    location: { type: 'Point', coordinates: [77.2245, 28.6288] },
    fee: 750,
    currency: 'INR',
    rating: 4.93,
    reviewCount: 340,
    experienceYears: 14,
    avatar: 'https://images.unsplash.com/photo-1594824813576-90510d9f0010?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 11 2373 8899',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['09:30 AM', '12:00 PM', '03:30 PM', '06:00 PM'],
    qualifications: ['MBBS (Lady Hardinge)', 'MD Dermatology (VMMC & Safdarjung)', 'IADVL Fellow'],
    languages: ['Hindi', 'English'],
    acceptsInsurance: true,
  },
  {
    _id: 'del_doc_003',
    name: 'Dr. Amitav Singhania, MS (Ortho), MCh',
    specialization: 'Orthopedist',
    clinicName: 'Capital Bone & Joint Center',
    address: 'Tolstoy Marg, Near Janpath, New Delhi 110001',
    location: { type: 'Point', coordinates: [77.2198, 28.6255] },
    fee: 850,
    currency: 'INR',
    rating: 4.89,
    reviewCount: 275,
    experienceYears: 18,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 11 4151 7700',
    availableDates: ['Today', 'Tomorrow', 'Thursday'],
    availableSlots: ['10:30 AM', '02:00 PM', '05:00 PM', '07:30 PM'],
    qualifications: ['MBBS (AIIMS)', 'MS Ortho (Maulana Azad)', 'Fellow Joint Arthroplasty (UK)'],
    languages: ['Hindi', 'English', 'Punjabi'],
    acceptsInsurance: true,
  },
  {
    _id: 'del_doc_004',
    name: 'Dr. Priya Varma, MD, DM (Neurology)',
    specialization: 'Neurologist',
    clinicName: 'Delhi Brain & Spine Care',
    address: 'Kasturba Gandhi Marg, Connaught Place, New Delhi 110001',
    location: { type: 'Point', coordinates: [77.2225, 28.6241] },
    fee: 950,
    currency: 'INR',
    rating: 4.95,
    reviewCount: 310,
    experienceYears: 16,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 11 4350 6600',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['11:00 AM', '01:30 PM', '04:00 PM', '06:30 PM'],
    qualifications: ['MBBS (AIIMS New Delhi)', 'MD Medicine (AIIMS)', 'DM Neurology (PGI Chandigarh)'],
    languages: ['Hindi', 'English'],
    acceptsInsurance: true,
  },
  {
    _id: 'del_doc_005',
    name: 'Dr. Vikramaditya Malhotra, MD (General Medicine)',
    specialization: 'General Physician',
    clinicName: 'Connaught Family Health & Preventive Clinic',
    address: 'Outer Circle, Near Shivaji Stadium, Connaught Place, New Delhi 110001',
    location: { type: 'Point', coordinates: [77.2140, 28.6295] },
    fee: 500,
    currency: 'INR',
    rating: 4.97,
    reviewCount: 510,
    experienceYears: 12,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 11 2334 1122',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['08:30 AM', '11:00 AM', '03:00 PM', '07:00 PM'],
    qualifications: ['MBBS (Maulana Azad)', 'MD General Medicine (UCMS & GTB Hospital)'],
    languages: ['Hindi', 'English', 'Bengali'],
    acceptsInsurance: true,
  },
  {
    _id: 'del_doc_006',
    name: 'Dr. Sunita Bansal, MD (Pediatrics)',
    specialization: 'Pediatrician',
    clinicName: 'Little Hearts Child Care Clinic',
    address: 'Shankar Market, Outer Circle, Connaught Place, New Delhi 110001',
    location: { type: 'Point', coordinates: [77.2205, 28.6335] },
    fee: 600,
    currency: 'INR',
    rating: 4.94,
    reviewCount: 380,
    experienceYears: 15,
    avatar: 'https://images.unsplash.com/photo-1594824813576-90510d9f0010?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 11 2341 9900',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['09:00 AM', '11:45 AM', '02:30 PM', '05:45 PM'],
    qualifications: ['MBBS (Lady Hardinge)', 'MD Pediatrics (Kalawati Saran Children Hospital)'],
    languages: ['Hindi', 'English'],
    acceptsInsurance: true,
  },
  {
    _id: 'del_doc_007',
    name: 'Dr. Sameer Alvi, MD, DM (Gastroenterology)',
    specialization: 'Gastroenterologist',
    clinicName: 'Delhi Digestive Health & Endoscopy Clinic',
    address: 'Regal Building, Connaught Circus, New Delhi 110001',
    location: { type: 'Point', coordinates: [77.2170, 28.6290] },
    fee: 850,
    currency: 'INR',
    rating: 4.88,
    reviewCount: 230,
    experienceYears: 17,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 11 2374 4455',
    availableDates: ['Today', 'Tomorrow', 'Thursday'],
    availableSlots: ['10:15 AM', '01:00 PM', '04:30 PM'],
    qualifications: ['MBBS (AIIMS)', 'MD (AIIMS)', 'DM Gastroenterology (GB Pant Hospital)'],
    languages: ['Hindi', 'English', 'Urdu'],
    acceptsInsurance: true,
  },
];

// -----------------------------------------------------------------------------
// 0. NEW DELHI EMERGENCY HOSPITALS & LEVEL 1 TRAUMA CENTERS
// -----------------------------------------------------------------------------
const delhiHospitals = [
  {
    _id: 'del_hosp_001',
    name: 'AIIMS Jai Prakash Narayan Apex Trauma Center',
    address: 'Ring Road, Near Safdarjung Hospital, New Delhi 110029',
    location: { type: 'Point', coordinates: [77.2090, 28.5672] },
    traumaLevel: 'National Apex Level 1 Trauma & Emergency Resuscitation Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 5,
      occupancyRate: 'High',
    },
    fees: {
      erConsultation: 50,
      admissionFee: 200,
      bedCostPerDay: 500,
      icuRate: 2000,
      diagnosticScanAvg: 800,
      totalEstimatedDiagnosisCost: '₹1,500 - ₹5,000',
    },
    currency: 'INR',
    emergencyPhone: '011-26731177',
    ambulanceHotline: '102',
    rating: 4.96,
    totalBeds: 600,
    availableBeds: 70,
    icuBedsAvailable: 15,
    diagnosticEquipment: [
      'Dual Source 256-Slice Fast Whole-Body CT',
      '3T Intraoperative MRI Suite',
      '24x7 Biplane Cardiac & Neuro Cath Labs',
      'Point-of-Care Thromboelastography & Trauma Labs',
    ],
    specialtiesAvailable: [
      'Advanced Resuscitative Trauma Surgery',
      'Emergency Interventional Cardiology',
      'Acute Stroke Thrombolysis',
      'Pediatric & Neonatal Emergency Care',
    ],
  },
  {
    _id: 'del_hosp_002',
    name: 'Dr. Ram Manohar Lohia (RML) Hospital & Emergency Center',
    address: 'Baba Kharak Singh Marg, Connaught Place, New Delhi 110001',
    location: { type: 'Point', coordinates: [77.2025, 28.6258] },
    traumaLevel: 'Level 1 Central Delhi Emergency Care & Disaster Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 8,
      occupancyRate: 'Normal',
    },
    fees: {
      erConsultation: 100,
      admissionFee: 300,
      bedCostPerDay: 800,
      icuRate: 3500,
      diagnosticScanAvg: 1200,
      totalEstimatedDiagnosisCost: '₹2,500 - ₹8,000',
    },
    currency: 'INR',
    emergencyPhone: '011-23365525',
    ambulanceHotline: '108',
    rating: 4.88,
    totalBeds: 1200,
    availableBeds: 110,
    icuBedsAvailable: 22,
    diagnosticEquipment: [
      'Multi-Slice Spiral Emergency CT',
      'Digital Radiography & Color Doppler',
      'Automated Cardiac Troponin & D-Dimer Analyzer',
    ],
    specialtiesAvailable: [
      '24x7 Emergency Resuscitation',
      'Acute Poisoning & Toxicology Care',
      'Chest Pain & Arrhythmia Management',
    ],
  },
  {
    _id: 'del_hosp_003',
    name: 'Max Super Speciality Hospital Saket (Emergency & Trauma)',
    address: '1, 2, Press Enclave Road, Saket, New Delhi 110017',
    location: { type: 'Point', coordinates: [77.2135, 28.5285] },
    traumaLevel: 'Level 1 International Tertiary Emergency & Cardiac Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 4,
      occupancyRate: 'Normal',
    },
    fees: {
      erConsultation: 1500,
      admissionFee: 3000,
      bedCostPerDay: 5500,
      icuRate: 18000,
      diagnosticScanAvg: 4000,
      totalEstimatedDiagnosisCost: '₹9,500 - ₹28,000',
    },
    currency: 'INR',
    emergencyPhone: '011-26515050',
    ambulanceHotline: '1066',
    rating: 4.95,
    totalBeds: 530,
    availableBeds: 85,
    icuBedsAvailable: 19,
    diagnosticEquipment: [
      '3.0 Tesla Silent MRI',
      'Revolution 512-Slice CT Scanner',
      'Cardiac Cath Lab with OCT & FFR',
      'Extracorporeal Membrane Oxygenation (ECMO)',
    ],
    specialtiesAvailable: [
      'Acute Myocardial Infarction & Primary PCI',
      'Comprehensive Stroke Center',
      'Poly-Trauma Surgery',
    ],
  },
  {
    _id: 'del_hosp_004',
    name: 'Sir Ganga Ram Hospital (Emergency Department)',
    address: 'Sir Ganga Ram Hospital Marg, Rajinder Nagar, New Delhi 110060',
    location: { type: 'Point', coordinates: [77.1895, 28.6385] },
    traumaLevel: 'Level 1 Multi-Super Speciality Emergency Trauma Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 6,
      occupancyRate: 'Normal',
    },
    fees: {
      erConsultation: 1200,
      admissionFee: 2500,
      bedCostPerDay: 4800,
      icuRate: 16000,
      diagnosticScanAvg: 3500,
      totalEstimatedDiagnosisCost: '₹8,000 - ₹24,000',
    },
    currency: 'INR',
    emergencyPhone: '011-25750000',
    ambulanceHotline: '011-42251000',
    rating: 4.92,
    totalBeds: 675,
    availableBeds: 78,
    icuBedsAvailable: 16,
    diagnosticEquipment: [
      'Emergency 128-Slice Fast CT',
      'High-Resolution Ultrasound & Echo',
      '24-Hour STAT Clinical Laboratory',
    ],
    specialtiesAvailable: [
      'Gastrointestinal Bleed & Emergency Endoscopy',
      'Acute Cardiac & Stroke Care',
      'Orthopedic Trauma & Replantation',
    ],
  },
  {
    _id: 'del_hosp_005',
    name: 'Fortis Escorts Heart Institute (24x7 Chest Pain Center)',
    address: 'Okhla Road, Sukhdev Vihar Metro Station, New Delhi 110025',
    location: { type: 'Point', coordinates: [77.2762, 28.5605] },
    traumaLevel: 'Level 1 Dedicated Cardiac Emergency & Cath Lab Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 3,
      occupancyRate: 'Low',
    },
    fees: {
      erConsultation: 1400,
      admissionFee: 2800,
      bedCostPerDay: 5000,
      icuRate: 17000,
      diagnosticScanAvg: 3800,
      totalEstimatedDiagnosisCost: '₹9,000 - ₹26,000',
    },
    currency: 'INR',
    emergencyPhone: '011-47135000',
    ambulanceHotline: '105010',
    rating: 4.94,
    totalBeds: 310,
    availableBeds: 50,
    icuBedsAvailable: 14,
    diagnosticEquipment: [
      'Dedicated Emergency Cardiac Cath Lab',
      '3D Transesophageal Echocardiography',
      'Instant High-Sensitivity Troponin I & T Biosensor',
    ],
    specialtiesAvailable: [
      'Emergency Primary Angioplasty (Door-to-Balloon < 60 mins)',
      'Aortic Dissection & Heart Failure Emergency',
      'Cardiac Resuscitation & Intensive Coronary Care',
    ],
  },
];

// -----------------------------------------------------------------------------
// 1. KOLKATA & WEST BENGAL BENGALI DOCTORS (Real Coordinates in Kolkata Metro)
// -----------------------------------------------------------------------------
const kolkataDoctors = [
  {
    _id: 'wb_doc_001',
    name: 'Dr. Subhashis Mukherjee, MD, DM',
    specialization: 'Cardiologist',
    clinicName: 'Kolkata Heart & Vascular Clinic',
    address: 'Salt Lake Sector 1, Block BD, Near City Centre, Kolkata 700064',
    location: { type: 'Point', coordinates: [88.4067, 22.5867] },
    fee: 800,
    currency: 'INR',
    rating: 4.95,
    reviewCount: 382,
    experienceYears: 18,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98301 24578',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['10:00 AM', '11:30 AM', '05:00 PM', '07:15 PM'],
    qualifications: ['MBBS (Calcutta)', 'MD (IPGMER)', 'DM Cardiology (AIIMS)', 'FACC'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_002',
    name: 'Dr. Ananya Banerjee, MD, DNB',
    specialization: 'Dermatologist',
    clinicName: 'Skin Care & Derma Clinic Kolkata',
    address: '14/1B Park Circus, Near 7-Point Crossing, Kolkata 700017',
    location: { type: 'Point', coordinates: [88.3688, 22.5422] },
    fee: 650,
    currency: 'INR',
    rating: 4.92,
    reviewCount: 295,
    experienceYears: 14,
    avatar: 'https://images.unsplash.com/photo-1594824813576-90510d9f0010?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98312 98451',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['09:30 AM', '01:00 PM', '04:30 PM', '06:30 PM'],
    qualifications: ['MBBS (Calcutta Medical College)', 'MD Dermatology (NRS)', 'IADVL Member'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_003',
    name: 'Dr. Sourav Roy, MS (Ortho), MCh',
    specialization: 'Orthopedist',
    clinicName: 'Apex Bone & Joint Clinic Kolkata',
    address: 'Gariahat Road, Near Triangular Park, South Kolkata 700029',
    location: { type: 'Point', coordinates: [88.3644, 22.5185] },
    fee: 700,
    currency: 'INR',
    rating: 4.88,
    reviewCount: 240,
    experienceYears: 16,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98305 61234',
    availableDates: ['Today', 'Tomorrow', 'Thursday'],
    availableSlots: ['11:00 AM', '02:30 PM', '05:30 PM', '08:00 PM'],
    qualifications: ['MBBS (RG Kar)', 'MS Orthopedics (IPGMER)', 'Fellow Joint Replacement (UK)'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_004',
    name: 'Dr. Debalina Sen, MD, DM',
    specialization: 'Neurologist',
    clinicName: 'Neuro Health Care Centre',
    address: 'New Town Action Area 1, Near Axis Mall, Kolkata 700156',
    location: { type: 'Point', coordinates: [88.4552, 22.5855] },
    fee: 900,
    currency: 'INR',
    rating: 4.96,
    reviewCount: 310,
    experienceYears: 15,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98319 77889',
    availableDates: ['Today', 'Tomorrow', 'Monday'],
    availableSlots: ['10:30 AM', '01:15 PM', '04:00 PM', '07:00 PM'],
    qualifications: ['MBBS (Calcutta)', 'MD Medicine', 'DM Neurology (Bangur Institute of Neurosciences)'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_005',
    name: 'Dr. Amitava Chakraborty, MD, DM',
    specialization: 'Gastroenterologist',
    clinicName: 'Bengal Digestive Diseases & Liver Clinic',
    address: 'Ruby Crossing, EM Bypass, Anandapur, Kolkata 700107',
    location: { type: 'Point', coordinates: [88.3985, 22.5135] },
    fee: 750,
    currency: 'INR',
    rating: 4.89,
    reviewCount: 215,
    experienceYears: 17,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98302 44321',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['09:00 AM', '12:00 PM', '03:30 PM', '06:00 PM'],
    qualifications: ['MBBS (Calcutta Medical College)', 'MD (IPGMER)', 'DM Gastro (SGPGI)'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_006',
    name: 'Dr. Tanmoy Ghosh, MD, DTCD',
    specialization: 'Pulmonologist',
    clinicName: 'Kolkata Chest & Allergy Institute',
    address: 'Shyambazar Five Point Crossing, North Kolkata 700004',
    location: { type: 'Point', coordinates: [88.3702, 22.6025] },
    fee: 600,
    currency: 'INR',
    rating: 4.85,
    reviewCount: 190,
    experienceYears: 12,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98311 00987',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['10:15 AM', '02:00 PM', '05:00 PM', '07:30 PM'],
    qualifications: ['MBBS (NRS)', 'MD Respiratory Medicine', 'Fellow European Respiratory Society'],
    languages: ['Bengali (বাংলা)', 'English'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_007',
    name: 'Dr. Riya Das, MD, DCH',
    specialization: 'Pediatrician',
    clinicName: 'Shishu Mangal Child Care & Vaccination Clinic',
    address: 'Diamond Harbour Road, Behala Chowrasta, Kolkata 700034',
    location: { type: 'Point', coordinates: [88.3185, 22.4955] },
    fee: 500,
    currency: 'INR',
    rating: 4.97,
    reviewCount: 450,
    experienceYears: 13,
    avatar: 'https://images.unsplash.com/photo-1594824813576-90510d9f0010?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98314 33221',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['09:00 AM', '11:45 AM', '04:00 PM', '06:45 PM'],
    qualifications: ['MBBS (Calcutta)', 'DCH (ICH)', 'MD Pediatrics (IPGMER)'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_008',
    name: 'Dr. Pradip Bhattacharya, MBBS, MD',
    specialization: 'General Physician',
    clinicName: 'Arogya Family Health Clinic',
    address: 'College Street, Near Medical College Gate 2, Kolkata 700073',
    location: { type: 'Point', coordinates: [88.3639, 22.5726] },
    fee: 400,
    currency: 'INR',
    rating: 4.94,
    reviewCount: 520,
    experienceYears: 22,
    avatar: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98300 11223',
    availableDates: ['Today', 'Tomorrow', 'Sunday'],
    availableSlots: ['08:30 AM', '11:00 AM', '03:00 PM', '06:00 PM'],
    qualifications: ['MBBS (Calcutta Medical College)', 'MD Internal Medicine', 'IMA Life Member'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_009',
    name: 'Dr. Indranil Roy, MS (ENT), DLO',
    specialization: 'ENT Specialist',
    clinicName: 'Kolkata Ear, Nose & Throat Clinic',
    address: 'Jadavpur 8B Bus Stand, Near Jadavpur University, Kolkata 700032',
    location: { type: 'Point', coordinates: [88.3712, 22.4988] },
    fee: 550,
    currency: 'INR',
    rating: 4.86,
    reviewCount: 175,
    experienceYears: 11,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98317 88990',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['10:00 AM', '01:30 PM', '05:30 PM', '07:30 PM'],
    qualifications: ['MBBS (NRS)', 'MS ENT (Calcutta)', 'AOI Certified'],
    languages: ['Bengali (বাংলা)', 'English'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_010',
    name: 'Dr. Sharmistha Sen, MD, DGO',
    specialization: 'Gynecologist',
    clinicName: 'Matri Raksha Women Health & Wellness',
    address: 'Southern Avenue, Near Vivekananda Park, South Kolkata 700026',
    location: { type: 'Point', coordinates: [88.3567, 22.5134] },
    fee: 750,
    currency: 'INR',
    rating: 4.93,
    reviewCount: 340,
    experienceYears: 16,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98308 55443',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['09:30 AM', '12:30 PM', '04:30 PM', '06:45 PM'],
    qualifications: ['MBBS (Calcutta)', 'MD Obstetrics & Gynaecology', 'FOGSI Member'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
  {
    _id: 'wb_doc_011',
    name: 'Dr. Arindam Bose, MD (Psychiatry)',
    specialization: 'Psychiatrist',
    clinicName: 'Mind & Care Mental Health Center',
    address: 'Howrah Maidan, Near Grand Trunk Road, Howrah 711101',
    location: { type: 'Point', coordinates: [88.3285, 22.5885] },
    fee: 800,
    currency: 'INR',
    rating: 4.91,
    reviewCount: 165,
    experienceYears: 14,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+91 98310 99887',
    availableDates: ['Today', 'Tomorrow', 'Thursday'],
    availableSlots: ['11:00 AM', '02:00 PM', '04:45 PM', '07:00 PM'],
    qualifications: ['MBBS (Calcutta)', 'MD Psychiatry (NIMHANS)', 'IPS Fellow'],
    languages: ['Bengali (বাংলা)', 'English', 'Hindi'],
    isBengaliDoctor: true,
    acceptsInsurance: true,
  },
];

// -----------------------------------------------------------------------------
// 2. KOLKATA & WEST BENGAL HOSPITALS & EMERGENCY TRAUMA CENTERS
// -----------------------------------------------------------------------------
const kolkataHospitals = [
  {
    _id: 'wb_hosp_001',
    name: 'IPGMER & SSKM Hospital (Apex Trauma Centre)',
    address: '244 AJC Bose Road, Bhowanipore, Kolkata 700020',
    location: { type: 'Point', coordinates: [88.3444, 22.5398] },
    traumaLevel: 'Government Level 1 Apex Multi-Speciality Trauma Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 8,
      occupancyRate: 'High (24x7 Free & Subsidized ER)',
    },
    fees: {
      erConsultation: 50,
      admissionFee: 100,
      bedCostPerDay: 200,
      icuRate: 1200,
      diagnosticScanAvg: 350,
      totalEstimatedDiagnosisCost: '₹800 - ₹3,500',
    },
    currency: 'INR',
    emergencyPhone: '033-22231589',
    ambulanceHotline: '102 / 108',
    rating: 4.88,
    totalBeds: 2200,
    availableBeds: 180,
    icuBedsAvailable: 24,
    diagnosticEquipment: [
      '24x7 Catheterization Lab & Primary PCI',
      '128-Slice Fast Cardiac CT & MRI',
      'Emergency Neuro & Trauma Operating Suites',
      'Dedicated Stroke Resuscitation Center',
    ],
    specialtiesAvailable: [
      'Cardiology & Cardiac Surgery',
      'Neurology & Trauma Resuscitation',
      'Orthopedic Emergency & Polytrauma',
      'Toxicology & Poison Emergency',
    ],
  },
  {
    _id: 'wb_hosp_002',
    name: 'Apollo Multispeciality Hospitals (EM Bypass)',
    address: '58 Canal Circular Road, Kadapara, EM Bypass, Kolkata 700054',
    location: { type: 'Point', coordinates: [88.4012, 22.5688] },
    traumaLevel: 'Level 1 International Tertiary Care Emergency Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 6,
      occupancyRate: 'Normal',
    },
    fees: {
      erConsultation: 1200,
      admissionFee: 2500,
      bedCostPerDay: 4500,
      icuRate: 15000,
      diagnosticScanAvg: 3200,
      totalEstimatedDiagnosisCost: '₹8,500 - ₹24,000',
    },
    currency: 'INR',
    emergencyPhone: '033-23203040',
    ambulanceHotline: '1066',
    rating: 4.94,
    totalBeds: 700,
    availableBeds: 95,
    icuBedsAvailable: 18,
    diagnosticEquipment: [
      'Dual Source 256-Slice Fast CT',
      '3.0 Tesla Silent MRI',
      'Emergency Biplane Digital Cath Lab',
      'Rapid Troponin & Cardiac Biomarker Point-of-Care Lab',
    ],
    specialtiesAvailable: [
      'Interventional Cardiology & ECMO',
      'Acute Stroke & Endovascular Intervention',
      'Pediatric Emergency & Critical Care',
      'Emergency Trauma & Burn Center',
    ],
  },
  {
    _id: 'wb_hosp_003',
    name: 'Fortis Hospital Anandapur (Emergency Care)',
    address: '730 Anandapur, EM Bypass, Near Ruby Crossing, Kolkata 700107',
    location: { type: 'Point', coordinates: [88.4022, 22.5188] },
    traumaLevel: 'Level 1 Cardiac & Polytrauma Rapid Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 5,
      occupancyRate: 'Low',
    },
    fees: {
      erConsultation: 1000,
      admissionFee: 2200,
      bedCostPerDay: 4000,
      icuRate: 13500,
      diagnosticScanAvg: 2800,
      totalEstimatedDiagnosisCost: '₹7,500 - ₹21,000',
    },
    currency: 'INR',
    emergencyPhone: '033-66284444',
    ambulanceHotline: '105010',
    rating: 4.91,
    totalBeds: 400,
    availableBeds: 60,
    icuBedsAvailable: 12,
    diagnosticEquipment: [
      'Emergency Cardiac Cath Lab',
      'High-Speed Multi-Detector CT',
      'Advanced Point-of-Care Blood Gas & Cardiac Enzyme Lab',
    ],
    specialtiesAvailable: [
      'Acute Coronary Care & Angioplasty',
      'Gastrointestinal Emergency & Endoscopy',
      'Joint & Spinal Trauma Intervention',
    ],
  },
  {
    _id: 'wb_hosp_004',
    name: 'AMRI Hospital Dhakuria (Emergency & Critical Care)',
    address: 'P-4 & 5, CIT Scheme LXXII, Block A, Gariahat Rd, Dhakuria, Kolkata 700029',
    location: { type: 'Point', coordinates: [88.3678, 22.5144] },
    traumaLevel: 'Level 2 Emergency Trauma & Critical Care',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 7,
      occupancyRate: 'Normal',
    },
    fees: {
      erConsultation: 900,
      admissionFee: 1800,
      bedCostPerDay: 3500,
      icuRate: 11000,
      diagnosticScanAvg: 2500,
      totalEstimatedDiagnosisCost: '₹6,000 - ₹18,000',
    },
    currency: 'INR',
    emergencyPhone: '033-66800000',
    ambulanceHotline: '033-24619300',
    rating: 4.82,
    totalBeds: 450,
    availableBeds: 45,
    icuBedsAvailable: 9,
    diagnosticEquipment: [
      'Digital Radiography & Sonography',
      'Emergency CT Scan',
      'Dialysis & Critical Care Unit',
    ],
    specialtiesAvailable: [
      'Chest & Respiratory Emergency',
      'General Surgical Acute Resuscitation',
      'Orthopedic Emergency Trauma',
    ],
  },
  {
    _id: 'wb_hosp_005',
    name: 'Ruby General Hospital (Emergency & Trauma Centre)',
    address: 'Kasba Golpark, EM Bypass, Kolkata 700107',
    location: { type: 'Point', coordinates: [88.3988, 22.5131] },
    traumaLevel: 'Level 2 24-Hour Emergency & Accident Hospital',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 10,
      occupancyRate: 'Normal',
    },
    fees: {
      erConsultation: 800,
      admissionFee: 1500,
      bedCostPerDay: 3200,
      icuRate: 9500,
      diagnosticScanAvg: 2200,
      totalEstimatedDiagnosisCost: '₹5,500 - ₹15,000',
    },
    currency: 'INR',
    emergencyPhone: '033-39871800',
    ambulanceHotline: '033-24426091',
    rating: 4.79,
    totalBeds: 350,
    availableBeds: 40,
    icuBedsAvailable: 7,
    diagnosticEquipment: [
      '24x7 Open CT & X-Ray',
      'Cardiac Monitoring & Defibrillator Suites',
      'Blood Bank & Rapid Pathology',
    ],
    specialtiesAvailable: [
      'Trauma Surgery & Resuscitation',
      'Cardiac Emergency & ICCU',
      'Neuro-trauma Assessment',
    ],
  },
];

// -----------------------------------------------------------------------------
// 2.1 PREMIER NATIONAL SPECIALTY HOSPITALS (Outside Local Area Referral)
// -----------------------------------------------------------------------------
const premierNationalHospitals = [
  {
    _id: 'nat_hosp_001',
    name: 'AIIMS New Delhi (Main Apex Referral Hospital)',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
    location: { type: 'Point', coordinates: [77.2090, 28.5672] },
    traumaLevel: 'National Premier Apex Hospital & Trauma Center (India)',
    isNationalReferral: true,
    outsideCityBadge: 'National Apex Referral',
    erStatus: { isOpen: true, currentWaitMinutes: 5, occupancyRate: 'High' },
    fees: { erConsultation: 50, admissionFee: 200, bedCostPerDay: 500, icuRate: 2000, diagnosticScanAvg: 800, totalEstimatedDiagnosisCost: '₹1,500 - ₹5,000' },
    currency: 'INR',
    emergencyPhone: '011-26588500',
    ambulanceHotline: '102',
    rating: 4.98,
    totalBeds: 2478,
    availableBeds: 120,
    icuBedsAvailable: 35,
    diagnosticEquipment: ['Dual Source 256-Slice Fast CT', '3T Intraoperative MRI Suite', '24x7 Digital Cath Lab', 'Robotic Surgical Suites'],
    specialtiesAvailable: ['Cardiology & Cardiac Surgery', 'Neurosurgery & Stroke', 'Oncology & Bone Marrow', 'Organ Transplant & Polytrauma']
  },
  {
    _id: 'nat_hosp_002',
    name: 'Medanta - The Medicity (Multi-Organ Transplant Apex)',
    address: 'CH Bakhtawar Singh Rd, Sector 38, Gurugram, Haryana 122001',
    location: { type: 'Point', coordinates: [77.0423, 28.4395] },
    traumaLevel: 'Level 1 International Multi-Organ & Robotic Super-Specialty',
    isNationalReferral: true,
    outsideCityBadge: 'Top Super-Specialty Center',
    erStatus: { isOpen: true, currentWaitMinutes: 4, occupancyRate: 'Normal' },
    fees: { erConsultation: 1500, admissionFee: 3500, bedCostPerDay: 6000, icuRate: 19500, diagnosticScanAvg: 4200, totalEstimatedDiagnosisCost: '₹10,500 - ₹30,000' },
    currency: 'INR',
    emergencyPhone: '0124-4141414',
    ambulanceHotline: '1066',
    rating: 4.96,
    totalBeds: 1600,
    availableBeds: 140,
    icuBedsAvailable: 28,
    diagnosticEquipment: ['CyberKnife VSI Robotic Radiosurgery', 'Brain Suite Intraoperative CT/MRI', 'Artis-Zeego Multi-Axis Cath Lab'],
    specialtiesAvailable: ['Heart Institute', 'Liver & Kidney Transplant', 'Neurosciences', 'Orthopedics & Joint Replacement']
  },
  {
    _id: 'nat_hosp_003',
    name: 'Tata Memorial Hospital (National Cancer & Oncology Apex)',
    address: 'Dr. E Borges Road, Parel, Mumbai, Maharashtra 400012',
    location: { type: 'Point', coordinates: [72.8427, 19.0048] },
    traumaLevel: 'National Comprehensive Cancer Care & Research Center',
    isNationalReferral: true,
    outsideCityBadge: 'Premier Oncology Apex',
    erStatus: { isOpen: true, currentWaitMinutes: 8, occupancyRate: 'High' },
    fees: { erConsultation: 100, admissionFee: 500, bedCostPerDay: 1200, icuRate: 5000, diagnosticScanAvg: 1500, totalEstimatedDiagnosisCost: '₹3,000 - ₹12,000' },
    currency: 'INR',
    emergencyPhone: '022-24177000',
    ambulanceHotline: '108',
    rating: 4.97,
    totalBeds: 1400,
    availableBeds: 90,
    icuBedsAvailable: 22,
    diagnosticEquipment: ['PET-CT & SPECT Imaging', 'Proton Beam Therapy', 'Digital Mammography & Molecular Pathology'],
    specialtiesAvailable: ['Medical & Surgical Oncology', 'Radiation Oncology', 'Bone Marrow Transplant', 'Palliative & Critical Care']
  },
  {
    _id: 'nat_hosp_004',
    name: 'Christian Medical College (CMC Vellore)',
    address: 'Ida Scudder Road, Vellore, Tamil Nadu 632004',
    location: { type: 'Point', coordinates: [79.1325, 12.9246] },
    traumaLevel: 'Level 1 Premier Multi-Disciplinary Tertiary Referral Hospital',
    isNationalReferral: true,
    outsideCityBadge: 'Top Multi-Specialty Referral',
    erStatus: { isOpen: true, currentWaitMinutes: 6, occupancyRate: 'Normal' },
    fees: { erConsultation: 250, admissionFee: 800, bedCostPerDay: 1800, icuRate: 7000, diagnosticScanAvg: 1800, totalEstimatedDiagnosisCost: '₹4,000 - ₹14,000' },
    currency: 'INR',
    emergencyPhone: '0416-2281000',
    ambulanceHotline: '108',
    rating: 4.95,
    totalBeds: 2800,
    availableBeds: 210,
    icuBedsAvailable: 40,
    diagnosticEquipment: ['Advanced MRI & Dual Source CT', 'High-Speed Automated Hematology & Genomics', 'Critical Care ECMO'],
    specialtiesAvailable: ['Hematology & Stem Cell', 'Neurology & Neurosurgery', 'Endocrinology & Rare Diseases', 'Pediatric Surgery']
  },
  {
    _id: 'nat_hosp_005',
    name: 'Narayana Health City (Cardiac & Super Specialty Apex)',
    address: '258/A, Bommasandra Industrial Area, Anekal Taluk, Bengaluru 560099',
    location: { type: 'Point', coordinates: [77.6918, 12.8003] },
    traumaLevel: 'Level 1 Advanced Cardiac, Vascular & Transplant Center',
    isNationalReferral: true,
    outsideCityBadge: 'Leading Cardiac & Transplant',
    erStatus: { isOpen: true, currentWaitMinutes: 5, occupancyRate: 'Low' },
    fees: { erConsultation: 800, admissionFee: 2000, bedCostPerDay: 3800, icuRate: 12500, diagnosticScanAvg: 2600, totalEstimatedDiagnosisCost: '₹6,500 - ₹20,000' },
    currency: 'INR',
    emergencyPhone: '080-71222222',
    ambulanceHotline: '105711',
    rating: 4.93,
    totalBeds: 1400,
    availableBeds: 115,
    icuBedsAvailable: 25,
    diagnosticEquipment: ['Hybrid Operating Suites', 'Digital Biplane Angiography', 'Robotic Da Vinci Surgical System'],
    specialtiesAvailable: ['Adult & Pediatric Cardiac Care', 'Vascular Surgery', 'Renal Transplant', 'Emergency Polytrauma']
  }
];

// -----------------------------------------------------------------------------
// 3. GLOBAL / DEFAULT SEED DOCTORS (NYC & Multi-City Baseline)
// -----------------------------------------------------------------------------
const seedDoctors = [
  {
    _id: 'doc_001',
    name: 'Dr. Sarah Jenkins, MD',
    specialization: 'Cardiologist',
    clinicName: 'Metropolitan Heart & Vascular Institute',
    address: '450 Lexington Ave, Suite 1200, New York, NY 10017',
    location: { type: 'Point', coordinates: [-73.9754, 40.7527] },
    fee: 220,
    currency: 'USD',
    rating: 4.92,
    reviewCount: 248,
    experienceYears: 16,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0192',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:15 PM'],
    qualifications: ['MD - Harvard Medical School', 'FACC Fellow', 'Board Certified Cardiology'],
    languages: ['English', 'Spanish'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_002',
    name: 'Dr. Marcus Vance, MD',
    specialization: 'Cardiologist',
    clinicName: 'Apex Cardiovascular & Arrhythmia Center',
    address: '120 W 57th St, 8th Floor, New York, NY 10019',
    location: { type: 'Point', coordinates: [-73.9785, 40.7651] },
    fee: 195,
    currency: 'USD',
    rating: 4.85,
    reviewCount: 182,
    experienceYears: 12,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0144',
    availableDates: ['Today', 'Tomorrow', 'Monday'],
    availableSlots: ['10:15 AM', '01:30 PM', '03:00 PM', '05:00 PM'],
    qualifications: ['MD - Johns Hopkins', 'Board Certified in Interventional Cardiology'],
    languages: ['English', 'French'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_003',
    name: 'Dr. Elena Rostova, MD',
    specialization: 'Dermatologist',
    clinicName: 'Manhattan Advanced Dermatology & Skin Health',
    address: '635 Madison Ave, 4th Floor, New York, NY 10022',
    location: { type: 'Point', coordinates: [-73.9712, 40.7634] },
    fee: 175,
    currency: 'USD',
    rating: 4.95,
    reviewCount: 310,
    experienceYears: 14,
    avatar: 'https://images.unsplash.com/photo-1594824813576-90510d9f0010?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0188',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['09:00 AM', '01:45 PM', '04:30 PM', '06:00 PM'],
    qualifications: ['MD - Columbia University', 'American Academy of Dermatology (FAAD)'],
    languages: ['English', 'Russian'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_004',
    name: 'Dr. David Chen, MD',
    specialization: 'Neurologist',
    clinicName: 'Empire Neurological Institute & Headache Center',
    address: '350 5th Ave, Suite 4100, New York, NY 10118',
    location: { type: 'Point', coordinates: [-73.9857, 40.7488] },
    fee: 210,
    currency: 'USD',
    rating: 4.88,
    reviewCount: 165,
    experienceYears: 15,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0133',
    availableDates: ['Today', 'Tomorrow', 'Thursday'],
    availableSlots: ['11:30 AM', '02:00 PM', '03:45 PM', '05:15 PM'],
    qualifications: ['MD - Yale School of Medicine', 'FAAN Fellow in Neurology'],
    languages: ['English', 'Mandarin'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_005',
    name: 'Dr. Kenneth Bradley, MD',
    specialization: 'Orthopedist',
    clinicName: 'Tri-State Orthopedic Surgery & Sports Medicine',
    address: '521 Park Ave, New York, NY 10065',
    location: { type: 'Point', coordinates: [-73.9682, 40.7638] },
    fee: 190,
    currency: 'USD',
    rating: 4.91,
    reviewCount: 220,
    experienceYears: 18,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0167',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['08:45 AM', '10:30 AM', '01:15 PM', '04:00 PM'],
    qualifications: ['MD - Cornell Weill Medicine', 'FAAOS Board Certified Orthopedic Surgeon'],
    languages: ['English'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_006',
    name: 'Dr. Priya Patel, MD',
    specialization: 'General Physician',
    clinicName: 'Union Square Primary Care & Family Medicine',
    address: '10 Union Square E, Suite 3E, New York, NY 10003',
    location: { type: 'Point', coordinates: [-73.9897, 40.7359] },
    fee: 120,
    currency: 'USD',
    rating: 4.97,
    reviewCount: 420,
    experienceYears: 9,
    avatar: 'https://images.unsplash.com/photo-1594824813576-90510d9f0010?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0112',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['09:15 AM', '11:45 AM', '02:15 PM', '05:30 PM'],
    qualifications: ['MD - NYU Grossman School of Medicine', 'Board Certified Internal Medicine'],
    languages: ['English', 'Hindi', 'Gujarati'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_007',
    name: 'Dr. Amara Okonjo, MD',
    specialization: 'Pulmonologist',
    clinicName: 'Hudson Respiratory Health & Chest Center',
    address: '55 Hudson Yards, 14th Floor, New York, NY 10001',
    location: { type: 'Point', coordinates: [-74.0021, 40.7538] },
    fee: 185,
    currency: 'USD',
    rating: 4.84,
    reviewCount: 140,
    experienceYears: 11,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0155',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['09:45 AM', '02:15 PM', '03:30 PM'],
    qualifications: ['MD - Stanford University School of Medicine', 'CHEST Fellow'],
    languages: ['English'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_008',
    name: 'Dr. Lucas Morales, MD',
    specialization: 'Pediatrician',
    clinicName: 'St. Jude Children & Family Health Center',
    address: '150 E 77th St, New York, NY 10075',
    location: { type: 'Point', coordinates: [-73.9592, 40.7738] },
    fee: 140,
    currency: 'USD',
    rating: 4.96,
    reviewCount: 380,
    experienceYears: 13,
    avatar: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0177',
    availableDates: ['Today', 'Tomorrow', 'Saturday'],
    availableSlots: ['08:30 AM', '10:45 AM', '01:30 PM', '04:45 PM'],
    qualifications: ['MD - Mount Sinai Icahn School of Medicine', 'FAAP Fellow'],
    languages: ['English', 'Spanish'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_009',
    name: 'Dr. Rachel Zimmerman, MD',
    specialization: 'Gastroenterologist',
    clinicName: 'NYC Digestive Disease & Endoscopy Center',
    address: '30 E 60th St, Suite 902, New York, NY 10022',
    location: { type: 'Point', coordinates: [-73.9723, 40.7642] },
    fee: 200,
    currency: 'USD',
    rating: 4.89,
    reviewCount: 215,
    experienceYears: 15,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0129',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['10:00 AM', '02:30 PM', '03:15 PM'],
    qualifications: ['MD - University of Pennsylvania', 'AGA Fellow'],
    languages: ['English', 'German'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_010',
    name: 'Dr. Jonathan Blake, MD',
    specialization: 'ENT Specialist',
    clinicName: 'Manhattan Ear, Nose & Throat Clinic',
    address: '210 E 64th St, New York, NY 10065',
    location: { type: 'Point', coordinates: [-73.9634, 40.7648] },
    fee: 165,
    currency: 'USD',
    rating: 4.82,
    reviewCount: 195,
    experienceYears: 10,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0182',
    availableDates: ['Today', 'Tomorrow', 'Thursday'],
    availableSlots: ['09:15 AM', '12:00 PM', '01:45 PM', '04:00 PM'],
    qualifications: ['MD - NYU Medical Center', 'Board Certified Otolaryngologist'],
    languages: ['English'],
    acceptsInsurance: true,
  },
  {
    _id: 'doc_011',
    name: 'Dr. Rebecca Stone, MD',
    specialization: 'Psychiatrist',
    clinicName: 'Beacon Mental Health & Behavioral Wellness',
    address: '115 E 57th St, Suite 500, New York, NY 10022',
    location: { type: 'Point', coordinates: [-73.9702, 40.7618] },
    fee: 230,
    currency: 'USD',
    rating: 4.93,
    reviewCount: 175,
    experienceYears: 14,
    avatar: 'https://images.unsplash.com/photo-1594824813576-90510d9f0010?auto=format&fit=crop&q=80&w=300',
    contactPhone: '+1 (212) 555-0199',
    availableDates: ['Today', 'Tomorrow', 'Friday'],
    availableSlots: ['11:30 AM', '02:00 PM', '03:15 PM', '05:00 PM'],
    qualifications: ['MD - Harvard Medical School', 'Board Certified in Psychiatry'],
    languages: ['English', 'Hebrew'],
    acceptsInsurance: true,
  },
];

// -----------------------------------------------------------------------------
// 4. GLOBAL / DEFAULT SEED HOSPITALS
// -----------------------------------------------------------------------------
const seedHospitals = [
  {
    _id: 'hosp_001',
    name: 'NewYork-Presbyterian / Weill Cornell Medical Center',
    address: '525 E 68th St, New York, NY 10065',
    location: { type: 'Point', coordinates: [-73.9538, 40.7651] },
    traumaLevel: 'Level 1 Comprehensive Adult & Pediatric Trauma Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 8,
      occupancyRate: 'Normal',
    },
    fees: {
      erConsultation: 250,
      admissionFee: 480,
      bedCostPerDay: 950,
      icuRate: 2800,
      diagnosticScanAvg: 650,
      totalEstimatedDiagnosisCost: '$1,335 - $2,550',
    },
    currency: 'USD',
    emergencyPhone: '+1 (212) 746-5454',
    ambulanceHotline: '911',
    rating: 4.94,
    totalBeds: 862,
    availableBeds: 84,
    icuBedsAvailable: 12,
    diagnosticEquipment: [
      '24/7 Cardiac Catheterization Lab',
      'Dual-Source 256-Slice Fast CT Scanner',
      '3T Neurovascular MRI Suite',
      'Emergency Point-of-Care Echocardiography',
    ],
    specialtiesAvailable: [
      'Emergency Cardiology & STEMI Center',
      'Comprehensive Stroke Center',
      'Burn & Polytrauma Emergency Care',
      'Pediatric Emergency Resuscitation',
    ],
  },
  {
    _id: 'hosp_002',
    name: 'Mount Sinai Hospital - Emergency & Heart Center',
    address: '1 Gustave L. Levy Pl, New York, NY 10029',
    location: { type: 'Point', coordinates: [-73.9526, 40.7899] },
    traumaLevel: 'Level 1 Cardiac, Stroke & Surgical Trauma Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 12,
      occupancyRate: 'Moderate',
    },
    fees: {
      erConsultation: 220,
      admissionFee: 450,
      bedCostPerDay: 900,
      icuRate: 2600,
      diagnosticScanAvg: 600,
      totalEstimatedDiagnosisCost: '$1,270 - $2,400',
    },
    currency: 'USD',
    emergencyPhone: '+1 (212) 241-6500',
    ambulanceHotline: '911',
    rating: 4.89,
    totalBeds: 1134,
    availableBeds: 110,
    icuBedsAvailable: 15,
    diagnosticEquipment: [
      'Emergency Angiography & Interventional Suite',
      'High-Speed Multi-Slice Trauma CT',
      'Rapid Biomarker & Blood Gas Diagnostic Lab',
    ],
    specialtiesAvailable: [
      'Acute Coronary & Arrhythmia Care',
      'Vascular & Neurosurgical Trauma',
      'Emergency Internal Medicine',
    ],
  },
  {
    _id: 'hosp_003',
    name: 'NYU Langone Health - Tisch Emergency Center',
    address: '550 1st Ave, New York, NY 10016',
    location: { type: 'Point', coordinates: [-73.9741, 40.7422] },
    traumaLevel: 'Level 1 Regional Trauma & Comprehensive Care',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 5,
      occupancyRate: 'Low',
    },
    fees: {
      erConsultation: 260,
      admissionFee: 500,
      bedCostPerDay: 980,
      icuRate: 2900,
      diagnosticScanAvg: 700,
      totalEstimatedDiagnosisCost: '$1,460 - $2,800',
    },
    currency: 'USD',
    emergencyPhone: '+1 (212) 263-5555',
    ambulanceHotline: '911',
    rating: 4.96,
    totalBeds: 920,
    availableBeds: 92,
    icuBedsAvailable: 18,
    diagnosticEquipment: [
      'Hybrid Emergency Operating Suites',
      'Full-Body Fast Trauma CT Scanner',
      'Cardiopulmonary Bypass & ECMO Support Unit',
    ],
    specialtiesAvailable: [
      'Advanced Cardiothoracic Resuscitation',
      'Acute Spinal & Orthopedic Trauma',
      'Sepsis & Critical Shock Management',
    ],
  },
  {
    _id: 'hosp_004',
    name: 'NYC Health + Hospitals / Bellevue Trauma Center',
    address: '462 1st Ave, New York, NY 10016',
    location: { type: 'Point', coordinates: [-73.9758, 40.7397] },
    traumaLevel: 'Public Level 1 Apex Trauma & Resuscitation Center',
    erStatus: {
      isOpen: true,
      currentWaitMinutes: 18,
      occupancyRate: 'High',
    },
    fees: {
      erConsultation: 110,
      admissionFee: 280,
      bedCostPerDay: 620,
      icuRate: 1900,
      diagnosticScanAvg: 420,
      totalEstimatedDiagnosisCost: '$810 - $1,650',
    },
    currency: 'USD',
    emergencyPhone: '+1 (212) 562-4141',
    ambulanceHotline: '911',
    rating: 4.81,
    totalBeds: 844,
    availableBeds: 65,
    icuBedsAvailable: 10,
    diagnosticEquipment: [
      'Dedicated Regional Trauma Operating Rooms',
      'Rapid Blood Infusion & Autotransfusion Labs',
      'Emergency Ultrasound & Endoscopy Suites',
    ],
    specialtiesAvailable: [
      'Penetrating & Blunt Trauma Surgery',
      'Psychiatric Emergency & Crisis Intervention',
      'Emergency Infectious Disease & Isolation',
    ],
  },
];

// -----------------------------------------------------------------------------
// 5. RESILIENT LOCAL STORE & RADIAL GEOSPATIAL SEARCH
// -----------------------------------------------------------------------------
class ResilientStore {
  constructor() {
    this.doctors = [...delhiDoctors, ...kolkataDoctors, ...seedDoctors];
    this.hospitals = [...delhiHospitals, ...kolkataHospitals, ...seedHospitals];
    this.appointments = [];
    this.users = [
      {
        _id: 'usr_001',
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        phone: '+91 98300 12345',
        location: { type: 'Point', coordinates: [77.2177, 28.6304] },
        bloodGroup: 'O+',
        allergies: ['Penicillin'],
        emergencyContact: 'Family Member (+91 98111 22334)',
      },
    ];
  }

  getDoctors({ specialist, search, language, lat, lng, maxDistanceKm = 50 }) {
    const userLat = lat ? parseFloat(lat) : 28.6304; // Default to Connaught Place Delhi
    const userLng = lng ? parseFloat(lng) : 77.2177;
    const maxRadius = parseFloat(maxDistanceKm) || 50;

    // Region check: Delhi NCR vs Kolkata WB vs Global
    const distToDelhi = calculateHaversineDistance(userLat, userLng, 28.6304, 77.2177);
    const isDelhiRegion = distToDelhi <= 100;

    const distToKolkata = calculateHaversineDistance(userLat, userLng, 22.5726, 88.3639);
    const isKolkataRegion = distToKolkata <= 120;

    let baseList = isDelhiRegion
      ? [...delhiDoctors]
      : isKolkataRegion
      ? [...kolkataDoctors]
      : [...seedDoctors];

    // If global region other than Delhi/Kolkata/NYC, project realistically around user coords
    const distToNYC = calculateHaversineDistance(userLat, userLng, 40.7484, -73.9855);
    const isOtherGlobalRegion = !isDelhiRegion && !isKolkataRegion && distToNYC > 100;

    const radialOffsets = [
      [0.008, 0.006],    // ~1.1 km
      [-0.012, 0.015],   // ~2.0 km
      [0.021, -0.018],   // ~3.2 km
      [-0.035, -0.028],  // ~5.1 km
      [0.048, 0.055],    // ~8.4 km
      [-0.075, 0.082],   // ~12.3 km
      [0.115, -0.095],   // ~17.5 km
      [-0.145, -0.165],  // ~24.8 km
      [0.210, 0.185],    // ~32.4 km
      [-0.265, 0.220],   // ~38.9 km
      [0.315, -0.250],   // ~45.2 km
    ];

    let list = baseList.map((doc, idx) => {
      let docCoords = doc.location.coordinates;

      if (isOtherGlobalRegion) {
        const offset = radialOffsets[idx % radialOffsets.length];
        docCoords = [userLng + offset[1], userLat + offset[0]];
      }

      const dist = calculateHaversineDistance(
        userLat,
        userLng,
        docCoords[1],
        docCoords[0]
      );

      return {
        ...doc,
        location: {
          type: 'Point',
          coordinates: docCoords,
        },
        distanceKm: dist,
        distanceMiles: parseFloat((dist * 0.621371).toFixed(2)),
      };
    });

    // Specialty filter
    if (specialist && specialist !== 'All' && specialist !== 'General Physician') {
      const specLower = specialist.toLowerCase();
      const filtered = list.filter(
        (d) =>
          d.specialization.toLowerCase().includes(specLower) ||
          specLower.includes(d.specialization.toLowerCase())
      );
      if (filtered.length > 0) {
        list = filtered;
      }
    }

    // Language filter (e.g. Hindi, Bengali, English)
    if (language && language !== 'All') {
      const langLower = language.toLowerCase();
      const filtered = list.filter((d) =>
        d.languages.some((l) => l.toLowerCase().includes(langLower))
      );
      if (filtered.length > 0) {
        list = filtered;
      }
    }

    // Text search query
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.clinicName.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q) ||
          (d.languages && d.languages.some((l) => l.toLowerCase().includes(q)))
      );
    }

    // Filter within chosen radius
    list = list.filter((doc) => doc.distanceKm <= maxRadius);

    // Sort by distance ascending
    list.sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }

  getHospitals({ lat, lng, maxDistanceKm = 50, exploreOutside = false }) {
    const userLat = lat ? parseFloat(lat) : 28.6304;
    const userLng = lng ? parseFloat(lng) : 77.2177;
    const maxRadius = parseFloat(maxDistanceKm) || 50;

    const distToDelhi = calculateHaversineDistance(userLat, userLng, 28.6304, 77.2177);
    const isDelhiRegion = distToDelhi <= 100;

    const distToKolkata = calculateHaversineDistance(userLat, userLng, 22.5726, 88.3639);
    const isKolkataRegion = distToKolkata <= 120;

    let baseList = isDelhiRegion
      ? [...delhiHospitals]
      : isKolkataRegion
      ? [...kolkataHospitals]
      : [...seedHospitals];

    const distToNYC = calculateHaversineDistance(userLat, userLng, 40.7484, -73.9855);
    const isOtherGlobalRegion = !isDelhiRegion && !isKolkataRegion && distToNYC > 100;

    const hospOffsets = [
      [0.014, 0.011],   // ~1.9 km
      [-0.022, 0.028],  // ~3.8 km
      [0.045, -0.038],  // ~7.2 km
      [-0.082, -0.065], // ~12.5 km
      [0.135, 0.115],   // ~21.0 km
    ];

    let list = baseList.map((hosp, idx) => {
      let hospCoords = hosp.location.coordinates;

      if (isOtherGlobalRegion) {
        const offset = hospOffsets[idx % hospOffsets.length];
        hospCoords = [userLng + offset[1], userLat + offset[0]];
      }

      const dist = calculateHaversineDistance(
        userLat,
        userLng,
        hospCoords[1],
        hospCoords[0]
      );

      return {
        ...hosp,
        location: {
          type: 'Point',
          coordinates: hospCoords,
        },
        distanceKm: dist,
        distanceMiles: parseFloat((dist * 0.621371).toFixed(2)),
      };
    });

    list = list.filter((hosp) => hosp.distanceKm <= maxRadius);

    // If exploreOutside is enabled or radius is Pan-India, append premier national apex centers
    if (exploreOutside || maxRadius >= 2000) {
      const nationalList = premierNationalHospitals.map((hosp) => {
        const dist = calculateHaversineDistance(
          userLat,
          userLng,
          hosp.location.coordinates[1],
          hosp.location.coordinates[0]
        );
        return {
          ...hosp,
          distanceKm: dist,
          distanceMiles: parseFloat((dist * 0.621371).toFixed(2)),
        };
      });

      // Combine ensuring no duplicates
      nationalList.forEach((nh) => {
        if (!list.some((existing) => existing.name === nh.name)) {
          list.push(nh);
        }
      });
    }

    list.sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }

  getDoctorById(id) {
    return (
      this.doctors.find((d) => d._id === id || String(d._id) === String(id)) ||
      delhiDoctors.find((d) => d._id === id) ||
      kolkataDoctors.find((d) => d._id === id) ||
      seedDoctors.find((d) => d._id === id)
    );
  }

  getHospitalById(id) {
    return (
      this.hospitals.find((h) => h._id === id || String(h._id) === String(id)) ||
      delhiHospitals.find((h) => h._id === id) ||
      kolkataHospitals.find((h) => h._id === id) ||
      seedHospitals.find((h) => h._id === id)
    );
  }

  createAppointment(appointmentData) {
    const newAppointment = {
      _id: 'apt_' + Math.random().toString(36).substring(2, 9),
      referenceCode: 'MG-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED',
      paymentStatus: appointmentData.paymentStatus || 'PAY_AT_CLINIC',
      ...appointmentData,
    };
    this.appointments.unshift(newAppointment);
    return newAppointment;
  }

  getAppointments({ phone, email }) {
    let list = [...this.appointments];
    if (phone) {
      list = list.filter((a) => a.patientPhone === phone);
    }
    if (email) {
      list = list.filter((a) => a.patientEmail === email);
    }
    return list;
  }

  getAppointmentByRef(refCode) {
    return this.appointments.find((a) => a.referenceCode === refCode);
  }

  cancelAppointment(id) {
    const appt = this.appointments.find((a) => a._id === id || a.referenceCode === id);
    if (appt) {
      appt.status = 'CANCELLED';
      return appt;
    }
    return null;
  }
}

const resilientStore = new ResilientStore();

module.exports = {
  delhiDoctors,
  delhiHospitals,
  kolkataDoctors,
  kolkataHospitals,
  seedDoctors,
  seedHospitals,
  calculateHaversineDistance,
  resilientStore,
};
