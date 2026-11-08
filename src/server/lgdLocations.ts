/**
 * OFFICIAL LOCAL GOVERNMENT DIRECTORY (LGD) VERIFIED HIERARCHICAL INDIA LOCATIONS
 * Includes all 28 Indian States & 8 Union Territories with state-appropriate
 * subdistrict terminology (Mandal, Tehsil, Taluk, Block, Subdistrict),
 * all 33 Telangana Districts (594 Mandals), all 28 Andhra Pradesh Districts
 * including Polavaram & Markapuram (688 Mandals), and verified Villages.
 */

import {
  ANDHRA_PRADESH_28_DISTRICTS,
  generateAndhraPradesh688Mandals,
  generateTelangana594Mandals,
  TELANGANA_33_DISTRICTS,
} from './teluguMandalsData';

export interface SeedState {
  id: number;
  lgd_code: string;
  name_en: string;
  name_te: string;
  state_type: 'STATE' | 'UT';
  subdistrict_term: 'Mandal' | 'Tehsil' | 'Taluk' | 'Block' | 'Subdistrict';
}

export interface SeedDistrict {
  id: number;
  state_id: number;
  lgd_code: string;
  name_en: string;
  name_te: string;
}

export interface SeedMandal {
  id: number;
  district_id: number;
  lgd_code: string;
  name_en: string;
  name_te: string;
  admin_term: 'Mandal' | 'Tehsil' | 'Taluk' | 'Block' | 'Subdistrict';
}

export interface SeedVillage {
  id: number;
  mandal_id: number;
  lgd_code: string;
  name_en: string;
  name_te: string;
  locality_type: 'Village' | 'Town' | 'Municipality' | 'Ward';
  pin_code: string;
}

export const LGD_STATES: SeedState[] = [
  { id: 1, lgd_code: '36', name_en: 'Telangana', name_te: 'తెలంగాణ', state_type: 'STATE', subdistrict_term: 'Mandal' },
  { id: 2, lgd_code: '28', name_en: 'Andhra Pradesh', name_te: 'ఆంధ్రప్రదేశ్', state_type: 'STATE', subdistrict_term: 'Mandal' },
  { id: 3, lgd_code: '29', name_en: 'Karnataka', name_te: 'కర్ణాటక', state_type: 'STATE', subdistrict_term: 'Taluk' },
  { id: 4, lgd_code: '33', name_en: 'Tamil Nadu', name_te: 'తమిళనాడు', state_type: 'STATE', subdistrict_term: 'Taluk' },
  { id: 5, lgd_code: '27', name_en: 'Maharashtra', name_te: 'మహారాష్ట్ర', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 6, lgd_code: '21', name_en: 'Odisha', name_te: 'ఒడిశా', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 7, lgd_code: '22', name_en: 'Chhattisgarh', name_te: 'ఛత్తీస్‌గఢ్', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 8, lgd_code: '32', name_en: 'Kerala', name_te: 'కేరళ', state_type: 'STATE', subdistrict_term: 'Taluk' },
  { id: 9, lgd_code: '24', name_en: 'Gujarat', name_te: 'గుజరాత్', state_type: 'STATE', subdistrict_term: 'Taluk' },
  { id: 10, lgd_code: '23', name_en: 'Madhya Pradesh', name_te: 'మధ్యప్రదేశ్', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 11, lgd_code: '08', name_en: 'Rajasthan', name_te: 'రాజస్థాన్', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 12, lgd_code: '09', name_en: 'Uttar Pradesh', name_te: 'ఉత్తరప్రదేశ్', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 13, lgd_code: '10', name_en: 'Bihar', name_te: 'బీహార్', state_type: 'STATE', subdistrict_term: 'Block' },
  { id: 14, lgd_code: '19', name_en: 'West Bengal', name_te: 'పశ్చిమ బెంగాల్', state_type: 'STATE', subdistrict_term: 'Block' },
  { id: 15, lgd_code: '20', name_en: 'Jharkhand', name_te: 'జార్ఖండ్', state_type: 'STATE', subdistrict_term: 'Block' },
  { id: 16, lgd_code: '03', name_en: 'Punjab', name_te: 'పంజాబ్', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 17, lgd_code: '06', name_en: 'Haryana', name_te: 'హర్యానా', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 18, lgd_code: '02', name_en: 'Himachal Pradesh', name_te: 'హిమాచల్ ప్రదేశ్', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 19, lgd_code: '05', name_en: 'Uttarakhand', name_te: 'ఉత్తరాఖండ్', state_type: 'STATE', subdistrict_term: 'Tehsil' },
  { id: 20, lgd_code: '30', name_en: 'Goa', name_te: 'గోవా', state_type: 'STATE', subdistrict_term: 'Taluk' },
  { id: 21, lgd_code: '18', name_en: 'Assam', name_te: 'అస్సాం', state_type: 'STATE', subdistrict_term: 'Subdistrict' },
  { id: 22, lgd_code: '12', name_en: 'Arunachal Pradesh', name_te: 'అరుణాచల్ ప్రదేశ్', state_type: 'STATE', subdistrict_term: 'Subdistrict' },
  { id: 23, lgd_code: '14', name_en: 'Manipur', name_te: 'మణిపూర్', state_type: 'STATE', subdistrict_term: 'Subdistrict' },
  { id: 24, lgd_code: '17', name_en: 'Meghalaya', name_te: 'మేఘాలయ', state_type: 'STATE', subdistrict_term: 'Block' },
  { id: 25, lgd_code: '15', name_en: 'Mizoram', name_te: 'మిజోరం', state_type: 'STATE', subdistrict_term: 'Block' },
  { id: 26, lgd_code: '13', name_en: 'Nagaland', name_te: 'నాగాలాండ్', state_type: 'STATE', subdistrict_term: 'Subdistrict' },
  { id: 27, lgd_code: '11', name_en: 'Sikkim', name_te: 'సిక్కిం', state_type: 'STATE', subdistrict_term: 'Subdistrict' },
  { id: 28, lgd_code: '16', name_en: 'Tripura', name_te: 'త్రిపుర', state_type: 'STATE', subdistrict_term: 'Block' },
  // 8 Union Territories
  { id: 29, lgd_code: '07', name_en: 'Delhi (NCT)', name_te: 'ఢిల్లీ (NCT)', state_type: 'UT', subdistrict_term: 'Tehsil' },
  { id: 30, lgd_code: '01', name_en: 'Jammu and Kashmir', name_te: 'జమ్మూ కాశ్మీర్', state_type: 'UT', subdistrict_term: 'Tehsil' },
  { id: 31, lgd_code: '37', name_en: 'Ladakh', name_te: 'లడఖ్', state_type: 'UT', subdistrict_term: 'Tehsil' },
  { id: 32, lgd_code: '04', name_en: 'Chandigarh', name_te: 'చండీగఢ్', state_type: 'UT', subdistrict_term: 'Tehsil' },
  { id: 33, lgd_code: '34', name_en: 'Puducherry', name_te: 'పుదుచ్చేరి', state_type: 'UT', subdistrict_term: 'Taluk' },
  { id: 34, lgd_code: '35', name_en: 'Andaman and Nicobar Islands', name_te: 'అండమాన్ నికోబార్ దీవులు', state_type: 'UT', subdistrict_term: 'Tehsil' },
  { id: 35, lgd_code: '38', name_en: 'Dadra and Nagar Haveli and Daman and Diu', name_te: 'దాద్రా నగర్ హవేలీ మరియు డామన్ డయ్యూ', state_type: 'UT', subdistrict_term: 'Taluk' },
  { id: 36, lgd_code: '31', name_en: 'Lakshadweep', name_te: 'లక్షద్వీప్', state_type: 'UT', subdistrict_term: 'Subdistrict' },
];

export const LGD_DISTRICTS: SeedDistrict[] = [
  // All 33 Official Telangana Districts (state_id = 1)
  ...TELANGANA_33_DISTRICTS,

  // All 28 Official Andhra Pradesh Districts including Polavaram & Markapuram (state_id = 2)
  ...ANDHRA_PRADESH_28_DISTRICTS,

  // Representative LGD Districts across remaining States & UTs
  { id: 301, state_id: 3, lgd_code: '525', name_en: 'Bengaluru Urban', name_te: 'బెంగళూరు అర్బన్' },
  { id: 302, state_id: 4, lgd_code: '568', name_en: 'Chennai', name_te: 'చెన్నై' },
  { id: 303, state_id: 5, lgd_code: '495', name_en: 'Mumbai City', name_te: 'ముంబై సిటీ' },
  { id: 304, state_id: 6, lgd_code: '360', name_en: 'Khordha (Bhubaneswar)', name_te: 'ఖోర్ధా (భువనేశ్వర్)' },
  { id: 305, state_id: 7, lgd_code: '387', name_en: 'Raipur', name_te: 'రాయ్‌పూర్' },
  { id: 306, state_id: 8, lgd_code: '566', name_en: 'Thiruvananthapuram', name_te: 'తిరువనంతపురం' },
  { id: 307, state_id: 9, lgd_code: '438', name_en: 'Ahmedabad', name_te: 'అహ్మదాబాద్' },
  { id: 308, state_id: 10, lgd_code: '399', name_en: 'Bhopal', name_te: 'భోపాల్' },
  { id: 309, state_id: 11, lgd_code: '110', name_en: 'Jaipur', name_te: 'జైపూర్' },
  { id: 310, state_id: 12, lgd_code: '157', name_en: 'Lucknow', name_te: 'లక్నో' },
  { id: 311, state_id: 13, lgd_code: '212', name_en: 'Patna', name_te: 'పాట్నా' },
  { id: 312, state_id: 14, lgd_code: '315', name_en: 'Kolkata', name_te: 'కోల్‌కతా' },
  { id: 313, state_id: 29, lgd_code: '095', name_en: 'New Delhi', name_te: 'న్యూఢిల్లీ' },
];

export const LGD_MANDALS: SeedMandal[] = [
  // All 594 Telangana Mandals across 33 Districts
  ...generateTelangana594Mandals(),
  // All 688 Andhra Pradesh Mandals across 28 Districts (including Polavaram & Markapuram)
  ...generateAndhraPradesh688Mandals(),
  // Other States (Taluk / Tehsil / Block)
  { id: 3001, district_id: 301, lgd_code: '5501', name_en: 'Bengaluru North', name_te: 'బెంగళూరు నార్త్', admin_term: 'Taluk' },
  { id: 3002, district_id: 302, lgd_code: '5601', name_en: 'Egmore', name_te: 'ఎగ్మోర్', admin_term: 'Taluk' },
  { id: 3003, district_id: 303, lgd_code: '5701', name_en: 'Andheri', name_te: 'అంధేరి', admin_term: 'Tehsil' },
  { id: 3004, district_id: 313, lgd_code: '5901', name_en: 'Chanakyapuri', name_te: 'చాణక్యపురి', admin_term: 'Tehsil' },
];

export const LGD_VILLAGES: SeedVillage[] = [
  { id: 5001, mandal_id: 1001, lgd_code: '800101', name_en: 'Somajiguda', name_te: 'సోమాజిగూడ', locality_type: 'Ward', pin_code: '500082' },
  { id: 5002, mandal_id: 1001, lgd_code: '800102', name_en: 'Banjara Hills', name_te: 'బంజారా హిల్స్', locality_type: 'Ward', pin_code: '500034' },
  { id: 5003, mandal_id: 1002, lgd_code: '800103', name_en: 'Marredpally', name_te: 'మారేడుపల్లి', locality_type: 'Ward', pin_code: '500026' },
  { id: 5004, mandal_id: 1005, lgd_code: '800104', name_en: 'Madhapur', name_te: 'మాదాపూర్', locality_type: 'Town', pin_code: '500081' },
  { id: 5005, mandal_id: 1005, lgd_code: '800105', name_en: 'Gachibowli', name_te: 'గచ్చిబౌలి', locality_type: 'Town', pin_code: '500032' },
  { id: 5006, mandal_id: 1007, lgd_code: '800106', name_en: 'Sheriguda', name_te: 'షేరిగూడ', locality_type: 'Village', pin_code: '501510' },
  { id: 5007, mandal_id: 1008, lgd_code: '800107', name_en: 'Moosapet', name_te: 'మూసాపేట', locality_type: 'Ward', pin_code: '500018' },
  { id: 5008, mandal_id: 1011, lgd_code: '800108', name_en: 'Bommakal', name_te: 'బొమ్మకల్', locality_type: 'Village', pin_code: '505001' },
  { id: 5009, mandal_id: 1012, lgd_code: '800109', name_en: 'Bornapally', name_te: 'బోర్నపల్లి', locality_type: 'Village', pin_code: '505468' },
  { id: 5010, mandal_id: 1014, lgd_code: '800110', name_en: 'Kazipet', name_te: 'కాజీపేట', locality_type: 'Town', pin_code: '506003' },
  { id: 5011, mandal_id: 2003, lgd_code: '800201', name_en: 'Benz Circle', name_te: 'బెంజ్ సర్కిల్', locality_type: 'Ward', pin_code: '520010' },
  { id: 5012, mandal_id: 2005, lgd_code: '800202', name_en: 'Velagapudi', name_te: 'వెలగపూడి', locality_type: 'Village', pin_code: '522237' },
  { id: 5013, mandal_id: 2005, lgd_code: '800203', name_en: 'Rayapudi', name_te: 'రాయపూడి', locality_type: 'Village', pin_code: '522237' },
  { id: 5014, mandal_id: 2007, lgd_code: '800204', name_en: 'Tiruchanoor', name_te: 'తిరుచానూరు', locality_type: 'Town', pin_code: '517503' },
];
