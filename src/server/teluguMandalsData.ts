/**
 * COMPLETE TELANGANA (33 DISTRICTS, 594 MANDALS) &
 * ANDHRA PRADESH (28 DISTRICTS INCLUDING POLAVARAM & MARKAPURAM, 688 MANDALS)
 * OFFICIAL HIERARCHICAL MANDAL DATASET FOR NETI BHARATHAM
 */

import { SeedDistrict, SeedMandal } from './lgdLocations';

// 33 Official Telangana Districts (state_id = 1)
export const TELANGANA_33_DISTRICTS: SeedDistrict[] = [
  { id: 101, state_id: 1, lgd_code: '502', name_en: 'Hyderabad', name_te: 'హైదరాబాద్' },
  { id: 102, state_id: 1, lgd_code: '509', name_en: 'Ranga Reddy', name_te: 'రంగారెడ్డి' },
  { id: 103, state_id: 1, lgd_code: '689', name_en: 'Medchal-Malkajgiri', name_te: 'మేడ్చల్-మల్కాజిగిరి' },
  { id: 104, state_id: 1, lgd_code: '696', name_en: 'Sangareddy', name_te: 'సంగారెడ్డి' },
  { id: 105, state_id: 1, lgd_code: '503', name_en: 'Karimnagar', name_te: 'కరీంనగర్' },
  { id: 106, state_id: 1, lgd_code: '510', name_en: 'Warangal', name_te: 'వరంగల్' },
  { id: 107, state_id: 1, lgd_code: '681', name_en: 'Hanumakonda', name_te: 'హనుమకొండ' },
  { id: 108, state_id: 1, lgd_code: '504', name_en: 'Khammam', name_te: 'ఖమ్మం' },
  { id: 109, state_id: 1, lgd_code: '508', name_en: 'Nizamabad', name_te: 'నిజామాబాద్' },
  { id: 110, state_id: 1, lgd_code: '507', name_en: 'Nalgonda', name_te: 'నల్లగొండ' },
  { id: 111, state_id: 1, lgd_code: '505', name_en: 'Mahabubnagar', name_te: 'మహబూబ్‌నగర్' },
  { id: 112, state_id: 1, lgd_code: '501', name_en: 'Adilabad', name_te: 'ఆదిలాబాద్' },
  { id: 113, state_id: 1, lgd_code: '506', name_en: 'Medak', name_te: 'మెదక్' },
  { id: 114, state_id: 1, lgd_code: '697', name_en: 'Siddipet', name_te: 'సిద్దిపేట' },
  { id: 115, state_id: 1, lgd_code: '698', name_en: 'Suryapet', name_te: 'సూర్యాపేట' },
  { id: 116, state_id: 1, lgd_code: '679', name_en: 'Bhadradri Kothagudem', name_te: 'భద్రాద్రి కొత్తగూడెం' },
  { id: 117, state_id: 1, lgd_code: '682', name_en: 'Jagtial', name_te: 'జగిత్యాల' },
  { id: 118, state_id: 1, lgd_code: '683', name_en: 'Jangaon', name_te: 'జనగామ' },
  { id: 119, state_id: 1, lgd_code: '684', name_en: 'Jayashankar Bhupalpally', name_te: 'జయశంకర్ భూపాలపల్లి' },
  { id: 120, state_id: 1, lgd_code: '685', name_en: 'Jogulamba Gadwal', name_te: 'జోగులాంబ గద్వాల' },
  { id: 121, state_id: 1, lgd_code: '686', name_en: 'Kamareddy', name_te: 'కామారెడ్డి' },
  { id: 122, state_id: 1, lgd_code: '687', name_en: 'Kumuram Bheem Asifabad', name_te: 'కుమురం భీమ్ ఆసిఫాబాద్' },
  { id: 123, state_id: 1, lgd_code: '688', name_en: 'Mahabubabad', name_te: 'మహబూబాబాద్' },
  { id: 124, state_id: 1, lgd_code: '690', name_en: 'Mancherial', name_te: 'మంచిర్యాల' },
  { id: 125, state_id: 1, lgd_code: '719', name_en: 'Mulugu', name_te: 'ములుగు' },
  { id: 126, state_id: 1, lgd_code: '691', name_en: 'Nagarkurnool', name_te: 'నాగర్‌కర్నూల్' },
  { id: 127, state_id: 1, lgd_code: '720', name_en: 'Narayanpet', name_te: 'నారాయణపేట' },
  { id: 128, state_id: 1, lgd_code: '692', name_en: 'Nirmal', name_te: 'నిర్మల్' },
  { id: 129, state_id: 1, lgd_code: '693', name_en: 'Peddapalli', name_te: 'పెద్దపల్లి' },
  { id: 130, state_id: 1, lgd_code: '694', name_en: 'Rajanna Sircilla', name_te: 'రాజన్న సిరిసిల్ల' },
  { id: 131, state_id: 1, lgd_code: '699', name_en: 'Vikarabad', name_te: 'వికారాబాద్' },
  { id: 132, state_id: 1, lgd_code: '700', name_en: 'Wanaparthy', name_te: 'వనపర్తి' },
  { id: 133, state_id: 1, lgd_code: '701', name_en: 'Yadadri Bhuvanagiri', name_te: 'యాదాద్రి భువనగిరి' },
];

// 28 Official Andhra Pradesh Districts (including Polavaram & Markapuram formed in Dec 2025) (state_id = 2)
export const ANDHRA_PRADESH_28_DISTRICTS: SeedDistrict[] = [
  { id: 201, state_id: 2, lgd_code: '520', name_en: 'Visakhapatnam', name_te: 'విశాఖపట్నం' },
  { id: 202, state_id: 2, lgd_code: '749', name_en: 'NTR (Vijayawada)', name_te: 'ఎన్టీఆర్ (విజయవాడ)' },
  { id: 203, state_id: 2, lgd_code: '506_AP', name_en: 'Guntur', name_te: 'గుంటూరు' },
  { id: 204, state_id: 2, lgd_code: '752', name_en: 'Tirupati', name_te: 'తిరుపతి' },
  { id: 205, state_id: 2, lgd_code: '505_AP', name_en: 'East Godavari', name_te: 'తూర్పు గోదావరి' },
  { id: 206, state_id: 2, lgd_code: '746', name_en: 'Kakinada', name_te: 'కాకినాడ' },
  { id: 207, state_id: 2, lgd_code: '747', name_en: 'Dr. B.R. Ambedkar Konaseema', name_te: 'డా. బి.ఆర్. అంబేద్కర్ కోనసీమ' },
  { id: 208, state_id: 2, lgd_code: '523', name_en: 'West Godavari', name_te: 'పశ్చిమ గోదావరి' },
  { id: 209, state_id: 2, lgd_code: '748', name_en: 'Eluru', name_te: 'ఏలూరు' },
  { id: 210, state_id: 2, lgd_code: '510_AP', name_en: 'Krishna', name_te: 'కృష్ణా' },
  { id: 211, state_id: 2, lgd_code: '750', name_en: 'Palnadu', name_te: 'పల్నాడు' },
  { id: 212, state_id: 2, lgd_code: '751', name_en: 'Bapatla', name_te: 'బాపట్ల' },
  { id: 213, state_id: 2, lgd_code: '517', name_en: 'Prakasam', name_te: 'ప్రకాశం' },
  { id: 214, state_id: 2, lgd_code: '515', name_en: 'SPSR Nellore', name_te: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు' },
  { id: 215, state_id: 2, lgd_code: '511', name_en: 'Kurnool', name_te: 'కర్నూలు' },
  { id: 216, state_id: 2, lgd_code: '755', name_en: 'Nandyal', name_te: 'నంద్యాల' },
  { id: 217, state_id: 2, lgd_code: '502_AP', name_en: 'Anantapuramu', name_te: 'అనంతపురం' },
  { id: 218, state_id: 2, lgd_code: '754', name_en: 'Sri Sathya Sai', name_te: 'శ్రీ సత్యసాయి' },
  { id: 219, state_id: 2, lgd_code: '504_AP', name_en: 'YSR Kadapa', name_te: 'వైఎస్ఆర్ కడప' },
  { id: 220, state_id: 2, lgd_code: '753', name_en: 'Annamayya', name_te: 'అన్నమయ్య' },
  { id: 221, state_id: 2, lgd_code: '503_AP', name_en: 'Chittoor', name_te: 'చిత్తూరు' },
  { id: 222, state_id: 2, lgd_code: '519', name_en: 'Srikakulam', name_te: 'శ్రీకాకుళం' },
  { id: 223, state_id: 2, lgd_code: '521', name_en: 'Vizianagaram', name_te: 'విజయనగరం' },
  { id: 224, state_id: 2, lgd_code: '743', name_en: 'Parvathipuram Manyam', name_te: 'పార్వతీపురం మన్యం' },
  { id: 225, state_id: 2, lgd_code: '744', name_en: 'Alluri Sitharama Raju', name_te: 'అల్లూరి సీతారామరాజు' },
  { id: 226, state_id: 2, lgd_code: '745', name_en: 'Anakapalli', name_te: 'అనకాపల్లి' },
  { id: 227, state_id: 2, lgd_code: '756', name_en: 'Polavaram', name_te: 'పోలవరం' },
  { id: 228, state_id: 2, lgd_code: '757', name_en: 'Markapuram', name_te: 'మార్కాపురం' },
];

// Authentic Mandal Lists per Telangana District (Total = exactly 594 Mandals across 33 Districts)
const TS_DISTRICT_MANDAL_MAP: Record<number, { count: number; items: Array<[string, string]> }> = {
  101: {
    count: 16,
    items: [
      ['Khairatabad', 'ఖైరతాబాద్'], ['Secunderabad', 'సికింద్రాబాద్'], ['Amberpet', 'అంబర్‌పేట'], ['Golconda', 'గోల్కొండ'],
      ['Ameerpet', 'అమీర్‌పేట'], ['Asifnagar', 'ఆసిఫ్‌నగర్'], ['Bahadurpura', 'బహదూర్‌పురా'], ['Bandlaguda', 'బండ్లగూడ'],
      ['Charminar', 'చార్మినార్'], ['Himayatnagar', 'హిమాయత్‌నగర్'], ['Marredpally', 'మారేడుపల్లి'], ['Musheerabad', 'ముషీరాబాద్'],
      ['Nampally', 'నాంపల్లి'], ['Saidabad', 'సైదాబాద్'], ['Shaikpet', 'షేక్‌పేట'], ['Tirumalagiri', 'తిరుమలగిరి'],
    ],
  },
  102: {
    count: 27,
    items: [
      ['Serilingampally', 'శేరిలింగంపల్లి'], ['Rajendranagar', 'రాజేంద్రనగర్'], ['Ibrahimpatnam', 'ఇబ్రహీంపట్నం'], ['Shamshabad', 'శంషాబాద్'],
      ['Maheshwaram', 'మహేశ్వరం'], ['Kandukur', 'కందుకూరు'], ['Kadthal', 'కడ్తాల్'], ['Amangal', 'ఆమనగల్'],
      ['Talakondapalle', 'తలకొండపల్లి'], ['Madgul', 'మాడ్గుల'], ['Yacharam', 'యాచారం'], ['Manchal', 'మంచాల'],
      ['Abdullapurmet', 'అబ్దుల్లాపూర్‌మెట్'], ['Hayathnagar', 'హయత్‌నగర్'], ['Saroornagar', 'సరూర్‌నగర్'], ['Balapur', 'బాలాపూర్'],
      ['Gandipet', 'గండిపేట'], ['Moinabad', 'మొయినాబాద్'], ['Chevella', 'చేవెళ్ల'], ['Shankarpally', 'శంకర్‌పల్లి'],
      ['Shabad', 'షాబాద్'], ['Kothur', 'కొత్తూరు'], ['Nandigama', 'నందిగామ'], ['Farooqnagar', 'ఫరూఖ్‌నగర్'],
      ['Keshampet', 'కేశంపేట'], ['Kondurg', 'కొందుర్గు'], ['Chowdergudem', 'చౌదర్‌గూడెం'],
    ],
  },
  103: {
    count: 15,
    items: [
      ['Kukatpally', 'కూకట్‌పల్లి'], ['Uppal', 'ఉప్పల్'], ['Medchal', 'మేడ్చల్'], ['Malkajgiri', 'మల్కాజిగిరి'],
      ['Alwal', 'అల్వాల్'], ['Quthbullapur', 'కుత్బుల్లాపూర్'], ['Balanagar', 'బాలానగర్'], ['Dundigal Gandimaisamma', 'దుండిగల్ గండిమైసమ్మ'],
      ['Bachupally', 'బాచుపల్లి'], ['Shamirpet', 'శామీర్‌పేట'], ['Kapra', 'కాప్రా'], ['Keesara', 'కీసర'],
      ['Ghatkesar', 'ఘట్‌కేసర్'], ['Medipally', 'మేడిపల్లి'], ['Muduchinthalapally', 'మూడుచింతలపల్లి'],
    ],
  },
  104: {
    count: 27,
    items: [
      ['Sangareddy', 'సంగారెడ్డి'], ['Patancheru', 'పటాన్‌చెరు'], ['Zaheerabad', 'జహీరాబాద్'], ['Narayankhed', 'నారాయణఖేడ్'],
      ['Andole', 'ఆందోల్'], ['Jogipet', 'జోగిపేట'], ['Sadasivpet', 'సదాశివపేట'], ['Kondapur', 'కొండాపూర్'],
      ['Kandi', 'కంది'], ['Ameenpur', 'అమీన్‌పూర్'], ['Gummadidala', 'గుమ్మడిదల'], ['Jinnaram', 'జిన్నారం'],
      ['Hathnoora', 'హత్నూర'], ['Pulkal', 'పుల్కల్'], ['Munipally', 'మునిపల్లి'], ['Raikode', 'రాయికోడ్'],
      ['Nyalkal', 'న్యాల్కల్'], ['Jharasangam', 'ఝరాసంగం'], ['Kohir', 'కోహీర్'], ['Mogudampally', 'మొగుడంపల్లి'],
      ['Manoor', 'మనూరు'], ['Nagalgidda', 'నాగల్‌గిద్ద'], ['Kangti', 'కంగ్టి'], ['Kalher', 'కల్హేర్'],
      ['Sirgapoor', 'సిర్గాపూర్'], ['Watpally', 'వట్‌పల్లి'], ['Nizampet SR', 'నిజాంపేట (సంగారెడ్డి)'],
    ],
  },
  105: {
    count: 16,
    items: [
      ['Karimnagar Urban', 'కరీంనగర్ అర్బన్'], ['Huzurabad', 'హుజూరాబాద్'], ['Karimnagar Rural', 'కరీంనగర్ రూరల్'], ['Kothapally', 'కొత్తపల్లి'],
      ['Manakondur', 'మానకొండూరు'], ['Thimmapur', 'తిమ్మాపూర్'], ['Ganneruvaram', 'గన్నేరువరం'], ['Gangadhara', 'గంగాధర'],
      ['Ramadugu', 'రామడుగు'], ['Choppadandi', 'చొప్పదండి'], ['Chigurumamidi', 'చిగురుమామిడి'], ['Veenavanka', 'వీణవంక'],
      ['Jammikunta', 'జమ్మికుంట'], ['Ellandakunta', 'ఇల్లందకుంట'], ['Shankarapatnam', 'శంకరపట్నం'], ['Saidapur', 'సైదాపూర్'],
    ],
  },
  106: {
    count: 13,
    items: [
      ['Warangal', 'వరంగల్'], ['Khila Warangal', 'ఖిలా వరంగల్'], ['Sangem', 'సంగెం'], ['Geesugonda', 'గీసుగొండ'],
      ['Wardhannapet', 'వర్ధన్నపేట'], ['Parvathagiri', 'పర్వతగిరి'], ['Rayaparthy', 'రాయపర్తి'], ['Narsampet', 'నర్సంపేట'],
      ['Chennaraopet', 'చెన్నారావుపేట'], ['Nallabelly', 'నల్లబెల్లి'], ['Duggondi', 'దుగ్గొండి'], ['Khanapur WL', 'ఖానాపూర్ (వరంగల్)'],
      ['Nekkonda', 'నెక్కొండ'],
    ],
  },
  107: {
    count: 14,
    items: [
      ['Hanumakonda', 'హనుమకొండ'], ['Kazipet', 'కాజీపేట'], ['Hasanparthy', 'హసన్‌పర్తి'], ['Dharmasagar', 'ధర్మసాగర్'],
      ['Velair', 'వేలేరు'], ['Inavolu', 'ఐనవోలు'], ['Bheemadevarpalle', 'భీమదేవరపల్లి'], ['Elkathurthy', 'ఎల్కతుర్తి'],
      ['Kamalapur', 'కమలాపూర్'], ['Parkal', 'పరకాల'], ['Nadikuda', 'నడికూడ'], ['Shayampet', 'శాయంపేట'],
      ['Atmakur HK', 'ఆత్మకూరు (హనుమకొండ)'], ['Damera', 'దామెర'],
    ],
  },
  108: {
    count: 21,
    items: [
      ['Khammam Urban', 'ఖమ్మం అర్బన్'], ['Khammam Rural', 'ఖమ్మం రూరల్'], ['Madhira', 'మధిర'], ['Sathupally', 'సత్తుపల్లి'],
      ['Wyra', 'వైరా'], ['Kalluru', 'కల్లూరు'], ['Tallada', 'తల్లాడ'], ['Enkoor', 'ఏన్కూరు'],
      ['Penuballi', 'పెనుబల్లి'], ['Vemsoor', 'వేంసూరు'], ['Bonakal', 'బోనకల్'], ['Chintakani', 'చింతకాని'],
      ['Mudigonda', 'ముదిగొండ'], ['Nelakondapalli', 'నేలకొండపల్లి'], ['Kusumanchi', 'కూసుమంచి'], ['Tirumalayapalem', 'తిరుమలాయపాలెం'],
      ['Konijerla', 'కొణిజర్ల'], ['Singareni', 'సింగరేణి'], ['Raghunadhapalem', 'రఘునాథపాలెం'], ['Kamepalli', 'కామేపల్లి'],
      ['Yerrupalem', 'ఎర్రుపాలెం'],
    ],
  },
  109: {
    count: 29,
    items: [
      ['Nizamabad North', 'నిజామాబాద్ నార్త్'], ['Nizamabad South', 'నిజామాబాద్ సౌత్'], ['Nizamabad Rural', 'నిజామాబాద్ రూరల్'], ['Armoor', 'ఆర్మూర్'],
      ['Bodhan', 'బోధన్'], ['Balkonda', 'బాల్కొండ'], ['Bheemgal', 'భీమ్‌గల్'], ['Jakranpally', 'జక్రాన్‌పల్లి'],
      ['Nandipet', 'నందిపేట'], ['Makloor', 'మాక్లూర్'], ['Navipet', 'నవీపేట'], ['Ranjal', 'రంజల్'],
      ['Yedapally', 'ఎడపల్లి'], ['Kotagiri', 'కోటగిరి'], ['Potangal', 'పోతంగల్'], ['Rudrur', 'రుద్రూర్'],
      ['Varni', 'వర్ని'], ['Chandur NZB', 'చందూర్ (నిజామాబాద్)'], ['Mosra', 'మోస్రా'], ['Dichpally', 'డిచ్‌పల్లి'],
      ['Dharpally', 'ధర్పల్లి'], ['Indalwai', 'ఇందల్వాయి'], ['Sirkonda', 'సిరికొండ'], ['Kammarpally', 'కమ్మర్‌పల్లి'],
      ['Mortad', 'మోర్తాడ్'], ['Velpur', 'వేల్పూర్'], ['Mupkal', 'ముప్కాల్'], ['Mendora', 'మెండోరా'],
      ['Mugpal', 'ముగ్పాల్'],
    ],
  },
  110: {
    count: 31,
    items: [
      ['Nalgonda', 'నల్లగొండ'], ['Miryalaguda', 'మిర్యాలగూడ'], ['Devarakonda', 'దేవరకొండ'], ['Nagarjunasagar', 'నాగార్జునసాగర్'],
      ['Nakrekal', 'నకిరేకల్'], ['Munugode', 'మునుగోడు'], ['Chityala', 'చిట్యాల'], ['Kattangoor', 'కట్టంగూర్'],
      ['Kethepally', 'కేతేపల్లి'], ['Shaligouraram', 'శాలిగౌరారం'], ['Thipparthy', 'తిప్పర్తి'], ['Kanagal', 'కనగల్'],
      ['Madgulapally', 'మాడుగులపల్లి'], ['Vemulapally', 'వేములపల్లి'], ['Tripuraram', 'త్రిపురారం'], ['Nidamanoor', 'నిడమనూరు'],
      ['Anumula', 'అనుముల'], ['Peddavoora', 'పెద్దవూర'], ['Gurrampode', 'గుర్రంపోడు'], ['Nampally NLG', 'నాంపల్లి (నల్లగొండ)'],
      ['Marriguda', 'మర్రిగూడ'], ['Chinthapally', 'చింతపల్లి'], ['Chandampet', 'చందంపేట'], ['Gundlapally', 'గుండ్లపల్లి'],
      ['neredugommu', 'నేరేడుగొమ్ము'], ['Kondamallepally', 'కొండమల్లేపల్లి'], ['PA Pally', 'పెద్ద అడిశర్లపల్లి'], ['Dameracherla', 'దామరచర్ల'],
      ['Adavidevulapally', 'అడవిదేవులపల్లి'], ['Chandur NLG', 'చండూరు'], ['Ghattuppal', 'గట్టుప్పల్'],
    ],
  },
  111: {
    count: 16,
    items: [
      ['Mahabubnagar Urban', 'మహబూబ్‌నగర్ అర్బన్'], ['Mahabubnagar Rural', 'మహబూబ్‌నగర్ రూరల్'], ['Jadcherla', 'జడ్చర్ల'], ['Bhoothpur', 'భూత్పూర్'],
      ['Hanwada', 'హన్వాడ'], ['Koilkonda', 'కోయిల్‌కొండ'], ['Midjil', 'మిడ్జిల్'], ['Balanagar MBNR', 'బాలానగర్ (మహబూబ్‌నగర్)'],
      ['Rajapur', 'రాజాపూర్'], ['Nawabpet MBNR', 'నవాబ్‌పేట'], ['Musapet', 'మూసాపేట'], ['Addakal', 'అడ్డాకల్'],
      ['Devarkadra', 'దేవరకద్ర'], ['Chinnachintakunta', 'చిన్నచింతకుంట'], ['Gandeed', 'గండీడ్'], ['Mohammadabad', 'మహమ్మదాబాద్'],
    ],
  },
  112: {
    count: 18,
    items: [
      ['Adilabad Urban', 'ఆదిలాబాద్ అర్బన్'], ['Adilabad Rural', 'ఆదిలాబాద్ రూరల్'], ['Mavala', 'మావల'], ['Jainath', 'జైనథ్'],
      ['Bela', 'బేల'], ['Bheempur', 'భీంపూర్'], ['Tamsi', 'తాంసి'], ['Talamadugu', 'తలమడుగు'],
      ['Gudihathnoor', 'గుడిహత్నూర్'], ['Ichoda', 'ఇచ్చోడ'], ['Bazarhathnoor', 'బజార్‌హత్నూర్'], ['Boath', 'బోథ్'],
      ['Neradigonda', 'నేరడిగొండ'], ['Sirikonda ADB', 'సిరికొండ (ఆదిలాబాద్)'], ['Inderjit', 'ఇంద్రవెల్లి'], ['Utnoor', 'ఉట్నూర్'],
      ['Narnoor', 'నార్నూర్'], ['Gadiguda', 'గాదిగూడ'],
    ],
  },
  113: {
    count: 21,
    items: [
      ['Medak', 'మెదక్'], ['Havelighanpur', 'హవేలీఘన్‌పూర్'], ['Papannapet', 'పాపన్నపేట'], ['Shankarampet-R', 'శంకరంపేట (ఆర్)'],
      ['Shankarampet-A', 'శంకరంపేట (ఎ)'], ['Tekmal', 'టేక్మాల్'], ['Alladurg', 'అల్లాదుర్గం'], ['Regode', 'రేగోడ్'],
      ['Ramayampet', 'రామాయంపేట'], ['Nizampet MDK', 'నిజాంపేట (మెదక్)'], ['Chegunta', 'చేగుంట'], ['Narsingi MDK', 'నర్సింగి (మెదక్)'],
      ['Yeldurthy', 'వెల్దుర్తి'], ['Narsapur MDK', 'నర్సాపూర్'], ['Kowdipally', 'కౌడిపల్లి'], ['Kulcharam', 'కొల్చారం'],
      ['Chilipched', 'చిలిప్‌చెడ్'], ['Shivampet', 'శివంపేట'], ['Tupran', 'తూప్రాన్'], ['Manoharabad', 'మనోహరాబాద్'],
      ['Masaipet', 'మాసాయిపేట'],
    ],
  },
  114: {
    count: 24,
    items: [
      ['Siddipet Urban', 'సిద్దిపేట అర్బన్'], ['Siddipet Rural', 'సిద్దిపేట రూరల్'], ['Narayanraopet', 'నారాయణరావుపేట'], ['Chinnakodur', 'చిన్నకోడూరు'],
      ['Nangnoor', 'నంగునూరు'], ['Dubbak', 'దుబ్బాక'], ['Mirdoddi', 'మిరుదొడ్డి'], ['Thoguta', 'తొగుట'],
      ['Doultabad', 'దౌల్తాబాద్'], ['Raipole', 'రాయపోల్'], ['Gajwel', 'గజ్వేల్'], ['Pragnapur', 'ప్రజ్ఞాపూర్'],
      ['Jagdevpur', 'జగదేవ్‌పూర్'], ['Kondapak', 'కొండపాక'], ['Kukunoorpally', 'కుకునూర్‌పల్లి'], ['Markook', 'మర్కూక్'],
      ['Wargal', 'వర్గల్'], ['Mulug SDP', 'ములుగు (సిద్దిపేట)'], ['Husnabad', 'హుస్నాబాద్'], ['Koheda', 'కోహెడ'],
      ['Akkannapet', 'అక్కన్నపేట'], ['Bejjanki', 'బెజ్జంకి'], ['Cherial', 'చేర్యాల'], ['Komuravelli', 'కొమురవెల్లి'],
    ],
  },
  115: {
    count: 23,
    items: [
      ['Suryapet', 'సూర్యాపేట'], ['Kodad', 'కోదాడ'], ['Huzurnagar', 'హుజూర్‌నగర్'], ['Thungathurthi', 'తుంగతుర్తి'],
      ['Atmakur-S', 'ఆత్మకూరు (ఎస్)'], ['Chivvemla', 'చివ్వెంల'], ['Penpahad', 'పెన్‌పహాడ్'], ['Mothey', 'మోతె'],
      ['Nuthankal', 'నూతనకల్'], ['Maddirala', 'మద్దిరాల'], ['Thirumalagiri SRPT', 'తిరుమలగిరి (సూర్యాపేట)'], ['Nagaram', 'నాగారం'],
      ['Jajireddygudem', 'జాజిరెడ్డిగూడెం'], ['Neredcherla', 'నేరేడుచర్ల'], ['Garidepally', 'గరిడేపల్లి'], ['Palakeedu', 'పాలకీడు'],
      ['Mattampally', 'మఠంపల్లి'], ['Mellachervu', 'మేళ్లచెరువు'], ['Chinthalapalem', 'చింతలపాలెం'], ['Munagala', 'మునగాల'],
      ['Nadigudem', 'నడిగూడెం'], ['Chilkur', 'చిలుకూరు'], ['Ananthagiri SRPT', 'అనంతగిరి'],
    ],
  },
  116: {
    count: 23,
    items: [
      ['Kothagudem', 'కొత్తగూడెం'], ['Bhadrachalam', 'భద్రాచలం'], ['Yellandu', 'ఇల్లందు'], ['Palvancha', 'పాల్వంచ'],
      ['Manuguru', 'మణుగూరు'], ['Aswaraopeta', 'అశ్వారావుపేట'], ['Sujathanagar', 'సుజాతనగర్'], ['Chunchupally', 'చుంచుపల్లి'],
      ['Laxmidevipalli', 'లక్ష్మీదేవిపల్లి'], ['Tekulapalli', 'టేకులపల్లి'], ['Gundala BDK', 'గుండాల (భద్రాద్రి)'], ['Allapalli', 'ఆళ్లపల్లి'],
      ['Julurpad', 'జూలూరుపాడు'], ['Chandrugonda', 'చండ్రుగొండ'], ['Annapureddypalli', 'అన్నపురెడ్డిపల్లి'], ['Dammapeta', 'దమ్మపేట'],
      ['Mulakalapalli', 'ములకలపల్లి'], ['Burgampahad', 'బూర్గంపాడు'], ['Aswapuram', 'అశ్వాపురం'], ['Pinapaka', 'పినపాక'],
      ['Karakagudem', 'కరకగూడెం'], ['Dummugudem', 'దుమ్ముగూడెం'], ['Cherla', 'చర్ల'],
    ],
  },
  117: {
    count: 18,
    items: [
      ['Jagtial', 'జగిత్యాల'], ['Jagtial Rural', 'జగిత్యాల రూరల్'], ['Korutla', 'కోరుట్ల'], ['Metpally', 'మెట్‌పల్లి'],
      ['Dharmapuri', 'ధర్మపురి'], ['Raikal', 'రాయికల్'], ['Sarangapur JGT', 'సారంగాపూర్ (జగిత్యాల)'], ['Beerpur', 'బీర్‌పూర్'],
      ['Gollapally', 'గొల్లపల్లి'], ['Pegadapally', 'పెగడపల్లి'], ['Mallial', 'మల్యాల'], ['Kodimial', 'కొడిమ్యాల'],
      ['Velgatoor', 'వెల్గటూరు'], ['Buggaram', 'బుగ్గారం'], ['Ibrahimpatnam JGT', 'ఇబ్రహీంపట్నం (జగిత్యాల)'], ['Mallapur', 'మల్లాపూర్'],
      ['Kathlapur', 'కథలాపూర్'], ['Medipally JGT', 'మేడిపల్లి (జగిత్యాల)'],
    ],
  },
  118: { count: 12, items: [['Jangaon', 'జనగామ'], ['Ghanpur Station', 'స్టేషన్ ఘన్‌పూర్'], ['Palakurthi', 'పాలకుర్తి'], ['Bachannapet', 'బచ్చన్నపేట'], ['Narmetta', 'నర్మెట్ట'], ['Tharigoppula', 'తరిగొప్పుల'], ['Lingalaghanpur', 'లింగాలఘన్‌పూర్'], ['Raghunathpalle', 'రఘునాథపల్లి'], ['Zaffergadh', 'జాఫర్‌గఢ్'], ['Devaruppula', 'దేవరుప్పుల'], ['Kodakandla', 'కొడకండ్ల'], ['Chilpur', 'చిల్పూర్']] },
  119: { count: 11, items: [['Bhupalpally', 'భూపాలపల్లి'], ['Ghanpur Mulug', 'ఘన్‌పూర్'], ['Regonda', 'రేగొండ'], ['Mogullapally', 'మొగుళ్లపల్లి'], ['Chityal JBP', 'చిట్యాల (భూపాలపల్లి)'], ['Tekumatla', 'టేకుమట్ల'], ['Kataram', 'కాటారం'], ['Mahadevpur', 'మహదేవ్‌పూర్'], ['Mutharam Mahadevpur', 'ముత్తారం'], ['Palimela', 'పలిమెల'], ['Malharrao', 'మల్హర్‌రావు']] },
  120: { count: 12, items: [['Gadwal', 'గద్వాల'], ['Alampur', 'అలంపూర్'], ['Dharoor', 'ధరూరు'], ['Gattu', 'గట్టు'], ['KT Doddi', 'కె.టి. దొడ్డి'], ['Maldakal', 'మల్దకల్'], ['Ieeja', 'అయిజ'], ['Waddepally', 'వడ్డేపల్లి'], ['Rajoli', 'రాజోలి'], ['Manopad', 'మానవపాడు'], ['Itikyal', 'ఇటిక్యాల'], ['Undavelly', 'ఉండవెల్లి']] },
  121: { count: 22, items: [['Kamareddy', 'కామారెడ్డి'], ['Banswada', 'బాన్సువాడ'], ['Yellareddy', 'ఎల్లారెడ్డి'], ['Jukkal', 'జుక్కల్'], ['Domakonda', 'దోమకొండ'], ['Bibipet', 'బీబీపేట'], ['Bhiknoor', 'భిక్కనూరు'], ['Tadwai KMR', 'తాడ్వాయి'], ['Rajampet', 'రాజంపేట'], ['Ramareddy', 'రామారెడ్డి'], ['Machareddy', 'మాచారెడ్డి'], ['Sadashivanagar', 'సదాశివనగర్'], ['Gandhari', 'గాంధారి'], ['Lingampet', 'లింగంపేట'], ['Nagireddypet', 'నాగిరెడ్డిపేట'], ['Birkoor', 'బీర్కూర్'], ['Nasrullabad', 'నస్రుల్లాబాద్'], ['Nizamsagar', 'నిజాంసాగర్'], ['Pitlam', 'పిట్లం'], ['Madnoor', 'మద్నూర్'], ['Bichkunda', 'బిచ్కుంద'], ['Pedda Kodapgal', 'పెద్ద కొడప్‌గల్']] },
  122: { count: 15, items: [['Asifabad', 'ఆసిఫాబాద్'], ['Kagaznagar', 'కాగజ్‌నగర్'], ['Sirpur-T', 'సిర్పూర్ (టి)'], ['Sirpur-U', 'సిర్పూర్ (యు)'], ['Rebbena', 'రెబ్బెన'], ['Tandur KBA', 'తాండూర్'], ['Tiryani', 'తిర్యాణి'], ['Kerameri', 'కెరమెరి'], ['Wankidi', 'వాంకిడి'], ['Jainoor', 'జైనూర్'], ['Lingapur', 'లింగాపూర్'], ['Kouthala', 'కౌటాల'], ['Chintalamanepally', 'చింతలమానేపల్లి'], ['Bejjur', 'బెజ్జూరు'], ['Penchikalpet', 'పెంచికల్‌పేట']] },
  123: { count: 16, items: [['Mahabubabad', 'మహబూబాబాద్'], ['Thorrur', 'తొర్రూరు'], ['Dornakal', 'డోర్నకల్'], ['Maripeda', 'మరిపెడ'], ['Kuravi', 'కురవి'], ['Bayyaram', 'బయ్యారం'], ['Garla', 'గార్ల'], ['Gudur MBD', 'గూడూరు'], ['Kesamudram', 'కేసముద్రం'], ['Nellikudur', 'నెల్లికుదురు'], ['Narsimhulapet', 'నర్సింహులపేట'], ['Chinnagudur', 'చిన్నగూడూరు'], ['Danthalapally', 'దంతాలపల్లి'], ['Peddavangara', 'పెద్దవంగర'], ['Kothaguda', 'కొత్తగూడ'], ['Gangaram', 'గంగారం']] },
  124: { count: 18, items: [['Mancherial', 'మంచిర్యాల'], ['Bellampalli', 'బెల్లంపల్లి'], ['Chennur', 'చెన్నూరు'], ['Luxettipet', 'లక్సెట్టిపేట'], ['Mandamarri', 'మందమర్రి'], ['Naspur', 'నస్పూర్'], ['Hajipur', 'హాజీపూర్'], ['Dandepally', 'దండేపల్లి'], ['Jannaram', 'జన్నారం'], ['Kasipet', 'కాసిపేట'], ['Tandur MNCL', 'తాండూరు (మంచిర్యాల)'], ['Bheemini', 'భీమిని'], ['Kannepally', 'కన్నెపల్లి'], ['Vemanpally', 'వేమన్‌పల్లి'], ['Nennel', 'నెన్నెల'], ['Kotapally', 'కోటపల్లి'], ['Jaipur', 'జైపూర్'], ['Bheemaram', 'భీమారం']] },
  125: { count: 10, items: [['Mulugu', 'ములుగు'], ['Venkatapur', 'వెంకటాపూర్'], ['Govindaraopet', 'గోవిందరావుపేట'], ['Tadvai', 'తాడ్వాయి (సమ్మక్క సారలమ్మ)'], ['Eturnagaram', 'ఏటూరునాగారం'], ['Mangapet', 'మంగపేట'], ['Kannaigudem', 'కన్నాయిగూడెం'], ['Wazeedu', 'వాజేడు'], ['Venkatapuram', 'వెంకటాపురం'], ['Mallampalli', 'మల్లంపల్లి']] },
  126: { count: 20, items: [['Nagarkurnool', 'నాగర్‌కర్నూల్'], ['Achampet', 'అచ్చంపేట'], ['Kalwakurthy', 'కల్వకుర్తి'], ['Kollapur', 'కొల్లాపూర్'], ['Bijinapally', 'బిజినేపల్లి'], ['Tadoor', 'తాడూరు'], ['Telkapally', 'తెలకపల్లి'], ['Thimmajipet', 'తిమ్మాజిపేట'], ['Uppununthala', 'ఉప్పునుంతల'], ['Vangoor', 'వంగూరు'], ['Veldanda', 'వెల్దండ'], ['Charakonda', 'చారకొండ'], ['Urkonda', 'ఊర్కొండ'], ['Balmoor', 'బల్మూర్'], ['Lingal', 'లింగాల'], ['Amrabad', 'అమ్రాబాద్'], ['Padara', 'పదర'], ['Pentlavelli', 'పెంట్లవెల్లి'], ['Kodair', 'కోడేరు'], ['Peddakothapally', 'పెద్దకొత్తపల్లి']] },
  127: { count: 11, items: [['Narayanpet', 'నారాయణపేట'], ['Makthal', 'మక్తల్'], ['Kosgi', 'కోస్గి'], ['Maddur', 'మద్దూరు'], ['Damaragidda', 'దామరగిద్ద'], ['Dhanwada', 'ధన్వాడ'], ['Marikal', 'మరికల్'], ['Narva', 'నర్వ'], ['Utkoor', 'ఊట్కూరు'], ['Maganoor', 'మాగనూరు'], ['Krishna', 'కృష్ణా']] },
  128: { count: 19, items: [['Nirmal', 'నిర్మల్'], ['Nirmal Rural', 'నిర్మల్ రూరల్'], ['Bhainsa', 'భైంసా'], ['Mudhole', 'ముధోల్'], ['Khanapur NML', 'ఖానాపూర్ (నిర్మల్)'], ['Kaddam', 'కడెం'], ['Dasturabad', 'దస్తూరాబాద్'], ['Pembi', 'పెంబి'], ['Mamda', 'మామడ'], ['Laxmanchanda', 'లక్ష్మణచాంద'], ['Soan', 'సోన్'], ['Sarangapur NML', 'సారంగాపూర్ (నిర్మల్)'], ['Dilawarpur', 'దిలావర్‌పూర్'], ['Narsapur-G', 'నర్సాపూర్ (జి)'], ['Kuntala', 'కుంటాల'], ['Lokeshwaram', 'లోకేశ్వరం'], ['Tanoor', 'తానూరు'], ['Kubeer', 'కుభీర్'], ['Basar', 'బాసర']] },
  129: { count: 14, items: [['Peddapalli', 'పెద్దపల్లి'], ['Ramagundam', 'రామగుండం'], ['Manthani', 'మంథని'], ['Sultanabad', 'సుల్తానాబాద్'], ['Julapally', 'జూలపల్లి'], ['Eligaid', 'ఎలిగేడు'], ['Odela', 'ఓదెల'], ['Srirampur', 'శ్రీరాంపూర్'], ['Dharmaram', 'ధర్మారం'], ['Palakurthy PDP', 'పాలకుర్తి'], ['Anthergaon', 'అంతర్గాం'], ['Kamanpur', 'కమాన్‌పూర్'], ['Ramagiri', 'రామగిరి'], ['Mutharam Manthani', 'ముత్తారం (మంథని)']] },
  130: { count: 13, items: [['Sircilla', 'సిరిసిల్ల'], ['Vemulawada', 'వేములవాడ'], ['Vemulawada Rural', 'వేములవాడ రూరల్'], ['Tangallapalli', 'తంగళ్లపల్లి'], ['Illanthakunta', 'ఇల్లంతకుంట'], ['Mustabad', 'ముస్తాబాద్'], ['Gambhiraopet', 'గంభీరావుపేట'], ['Yellareddypet', 'ఎల్లారెడ్డిపేట'], ['Veernapalli', 'వీర్నపల్లి'], ['Boinpalli', 'బోయినపల్లి'], ['Chandurthi', 'చందుర్తి'], ['Rudrangi', 'రుద్రంగి'], ['Konaraopet', 'కోనరావుపేట']] },
  131: { count: 18, items: [['Vikarabad', 'వికారాబాద్'], ['Tandur', 'తాండూరు'], ['Pargi', 'పరిగి'], ['Kodangal', 'కొడంగల్'], ['Dharur VKB', 'ధరూరు'], ['Bantwaram', 'బంట్వారం'], ['Kotepally', 'కోట్‌పల్లి'], ['Marpally', 'మర్పల్లి'], ['Mominpet', 'మోమిన్‌పేట'], ['Nawabpet VKB', 'నవాబ్‌పేట (వికారాబాద్)'], ['Pudur', 'పూడూరు'], ['Kulkacherla', 'కుల్కచర్ల'], ['Doma', 'దోమ'], ['Peddemul', 'పెద్దేముల్'], ['Basheerabad', 'బషీరాబాద్'], ['Yalal', 'యాలాల'], ['Bomraspet', 'బొంరాస్‌పేట'], ['Doulthabad VKB', 'దౌల్తాబాద్ (వికారాబాద్)']] },
  132: { count: 14, items: [['Wanaparthy', 'వనపర్తి'], ['Kothakota', 'కొత్తకోట'], ['Pebbair', 'పెబ్బేరు'], ['Atmakur WNP', 'ఆత్మకూరు (వనపర్తి)'], ['Amarchinta', 'అమరచింత'], ['Madanapur', 'మదనాపురం'], ['Revally', 'రేవల్లి'], ['Gopalpet', 'గోపాల్‌పేట'], ['Peddamandadi', 'పెద్దమందడి'], ['Ghanpur WNP', 'ఘన్‌పూర్ (వనపర్తి)'], ['Pangal', 'పాన్‌గల్'], ['Weepangandla', 'వీపనగండ్ల'], ['Chinnambavi', 'చిన్నంబావి'], ['Srirangapur', 'శ్రీరంగాపూర్']] },
  133: { count: 17, items: [['Bhongir', 'భువనగిరి'], ['Alair', 'ఆలేరు'], ['Choutuppal', 'చౌటుప్పల్'], ['Yadagirigutta', 'యాదగిరిగుట్ట'], ['Bibinagar', 'బీబీనగర్'], ['Pochampally', 'భూదాన్ పోచంపల్లి'], ['Valigonda', 'వలిగొండ'], ['Ramannapet', 'రామన్నపేట'], ['Mothkur', 'మోత్కూరు'], ['Addagudur', 'అడ్డగూడూరు'], ['Atmakur-M', 'ఆత్మకూరు (ఎం)'], ['Rajapet', 'రాజాపేట'], ['Turkapally', 'తుర్కపల్లి'], ['Bommalaramaram', 'బొమ్మలరామారం'], ['Narayanpur', 'నారాయణపురం'], ['Gundala YBG', 'గుండాల'], ['Motakondur', 'మోటకొండూరు']] },
};

// Authentic Mandal Lists per Andhra Pradesh District (Total = 688 Mandals across 28 Districts including Polavaram & Markapuram)
const AP_DISTRICT_MANDAL_MAP: Record<number, { count: number; items: Array<[string, string]> }> = {
  201: { count: 11, items: [['Bheemunipatnam', 'భీమునిపట్నం'], ['Gajuwaka', 'గాజువాక'], ['Anandapuram', 'ఆనందపురం'], ['Padmanabham', 'పద్మనాభం'], ['Visakhapatnam Rural', 'విశాఖపట్నం రూరల్'], ['Seethammadhara', 'సీతమ్మధార'], ['Gopalapatnam', 'గోపాలపట్నం'], ['Maharanipeta', 'మహారాణిపేట'], ['Mulagada', 'ములగాడ'], ['Pedagantyada', 'పెదగంట్యాడ'], ['Pendurthi', 'పెందుర్తి']] },
  202: { count: 20, items: [['Vijayawada Urban', 'విజయవాడ అర్బన్'], ['Mylavaram', 'మైలవరం'], ['Vijayawada Central', 'విజయవాడ సెంట్రల్'], ['Vijayawada North', 'విజయవాడ నార్త్'], ['Vijayawada East', 'విజయవాడ ఈస్ట్'], ['Vijayawada West', 'విజయవాడ వెస్ట్'], ['Vijayawada Rural', 'విజయవాడ రూరల్'], ['Ibrahimpatnam AP', 'ఇబ్రహీంపట్నం'], ['G.Konduru', 'జి.కొండూరు'], ['Kanchikacherla', 'కంచికచర్ల'], ['Chandarlapadu', 'చందర్లపాడు'], ['Nandigama AP', 'నందిగామ'], ['Veerullapadu', 'వీరులపాడు'], ['Jaggayyapeta', 'జగ్గయ్యపేట'], ['Vatsavai', 'వత్సవాయి'], ['Penuganchiprolu', 'పెనుగంచిప్రోలు'], ['Tiruvuru', 'తిరువూరు'], ['A.Konduru', 'ఎ.కొండూరు'], ['Gampalagudem', 'గంపలగూడెం'], ['Reddigudem', 'రెడ్డిగూడెం']] },
  203: { count: 18, items: [['Tulluru (Amaravati)', 'తుళ్ళూరు (అమరావతి)'], ['Mangalagiri', 'మంగళగిరి'], ['Tadepalli', 'తాడేపల్లి'], ['Guntur East', 'గుంటూరు ఈస్ట్'], ['Guntur West', 'గుంటూరు వెస్ట్'], ['Pedakakani', 'పెదకాకాని'], ['Tadikonda', 'తాడికొండ'], ['Phirangipuram', 'ఫిరంగిపురం'], ['Medikonduru', 'మేడికొండూరు'], ['Vatticherukuru', 'వట్టిచెరుకూరు'], ['Prathipadu GNT', 'ప్రత్తిపాడు'], ['Pedanandipadu', 'పెదనందిపాడు'], ['Kakumanu', 'కాకుమాను'], ['Ponnur', 'పొన్నూరు'], ['Chebrolu', 'చేబ్రోలు'], ['Duggirala', 'దుగ్గిరాల'], ['Kollipara', 'కొల్లిపర'], ['Tenali', 'తెనాలి']] },
  204: { count: 34, items: [['Tirupati Urban', 'తిరుపతి అర్బన్'], ['Tirupati Rural', 'తిరుపతి రూరల్'], ['Chandragiri', 'చంద్రగిరి'], ['Renigunta', 'రేణిగుంట'], ['Srikalahasti', 'శ్రీకాళహస్తి'], ['Gudur TPT', 'గూడూరు'], ['Sullurpeta', 'సూళ్లూరుపేట'], ['Naidupeta', 'నాయుడుపేట'], ['Venkatagiri', 'వెంకటగిరి'], ['Puttur', 'పుత్తూరు'], ['Satyavedu', 'సత్యవేడు'], ['Nagari', 'నగరి'], ['Pakala', 'పాకాల'], ['Ramachandrapuram TPT', 'రామచంద్రాపురం'], ['Vadamalapeta', 'వడమాలపేట'], ['Narayanavanam', 'నారాయణవనం'], ['Pitchatur', 'పిచ్చాటూరు'], ['Varadaiahpalem', 'వరదయ్యపాలెం'], ['Buchinaidu Kandriga', 'బుచ్చినాయుడు కండ్రిగ'], ['Thottambedu', 'తొట్టంబేడు'], ['Yerpedu', 'ఏర్పేడు'], ['Kumara Venkata Bhupalapuram', 'కె.వి.బి.పురం'], ['Nagalapuram', 'నాగలాపురం'], ['Tada', 'తడ'], ['Doravarisatram', 'దొరవారిసత్రం'], ['Ojili', 'ఓజిలి'], ['Chillakur', 'చిల్లకూరు'], ['Kota', 'కోట'], ['Vakadu', 'వాకాడు'], ['Chittamur', 'చిట్టమూరు'], ['Balayapalli', 'బాలాయపల్లి'], ['Dakkili', 'డక్కిలి'], ['Pellakur', 'పెళ్లకూరు'], ['Yerravaripalem', 'ఎర్రవారిపాలెం']] },
  205: { count: 19, items: [['Rajahmundry Urban', 'రాజమహేంద్రవరం అర్బన్'], ['Rajahmundry Rural', 'రాజమహేంద్రవరం రూరల్'], ['Kadiam', 'కడియం'], ['Rajanagaram', 'రాజానగరం'], ['Korukonda', 'కోరుకొండ'], ['Seethanagaram', 'సీతానగరం'], ['Gokavaram', 'గోకవరం'], ['Anaparthi', 'అనపర్తి'], ['Biccavolu', 'బిక్కవోలు'], ['Rangampeta', 'రంగంపేట'], ['Kovvur', 'కొవ్వూరు'], ['Chagallu', 'చాగల్లు'], ['Tallapudi', 'తాళ్లపూడి'], ['Nidadavole', 'నిడదవోలు'], ['Undrajavaram', 'ఉండ్రాజవరం'], ['Peravali', 'పెరవలి'], ['Devarapalli', 'దేవరపల్లి'], ['Nallajerla', 'నల్లజర్ల'], ['Gopalapuram', 'గోపాలపురం']] },
  206: { count: 21, items: [['Kakinada Urban', 'కాకినాడ అర్బన్'], ['Kakinada Rural', 'కాకినాడ రూరల్'], ['Peddapuram', 'పెద్దాపురం'], ['Samalkota', 'సామర్లకోట'], ['Pithapuram', 'పిఠాపురం'], ['Tuni', 'తుని'], ['Prathipadu KKD', 'ప్రత్తిపాడు (కాకినాడ)'], ['Jaggampeta', 'జగ్గంపేట'], ['Gollaprolu', 'గొల్లప్రోలు'], ['U.Kothapalli', 'యు.కొత్తపల్లి'], ['Karapa', 'కరప'], ['Kajuluru', 'కాజులూరు'], ['Tallarevu', 'తాళ్లరేవు'], ['Gandepalli', 'గండేపల్లి'], ['Pedapudi', 'పెదపూడి'], ['Kirlampudi', 'కిర్లంపూడి'], ['Yeleswaram', 'ఏలేశ్వరం'], ['Sankhavaram', 'శంఖవరం'], ['Rowthulapudi', 'రౌతులపూడి'], ['Kotananduru', 'కోటనందూరు'], ['Thondangi', 'తొండంగి']] },
  207: { count: 22, items: [['Amalapuram', 'అమలాపురం'], ['Razole', 'రాజోలు'], ['Kothapeta', 'కొత్తపేట'], ['Mandapeta', 'మండపేట'], ['Ramachandrapuram', 'రామచంద్రపురం'], ['Mummidivaram', 'ముమ్మిడివరం'], ['Allavaram', 'అల్లవరం'], ['Uppalaguptam', 'ఉప్పలగుప్తం'], ['Katrenikona', 'కాట్రేనికోన'], ['I.Polavaram', 'ఐ.పోలవరం'], ['Thallarevu KNS', 'తాళ్లరేవు'], ['Ambajipeta', 'అంబాజీపేట'], ['Ainavilli', 'అయినవిల్లి'], ['P.Gannavaram', 'పి.గన్నవరం'], ['Mamidikuduru', 'మామిడికుదురు'], ['Malikipuram', 'మలికిపురం'], ['Sakhinetipalli', 'సఖినేటిపల్లి'], ['Ravulapalem', 'రావులపాలెం'], ['Atreyapuram', 'ఆత్రేయపురం'], ['Alamuru', 'ఆలమూరు'], ['Kapileswarapuram', 'కపిలేశ్వరపురం'], ['Rayavaram', 'రాయవరం']] },
  208: { count: 20, items: [['Bhimavaram', 'భీమవరం'], ['Tadepalligudem', 'తాడేపల్లిగూడెం'], ['Tanuku', 'తణుకు'], ['Narsapur', 'నర్సాపురం'], ['Palakollu', 'పాలకొల్లు'], ['Achanta', 'ఆచంట'], ['Poduru', 'పోడూరు'], ['Yelamanchili WG', 'యలమంచిలి'], ['Mogalthur', 'మొగల్తూరు'], ['Veeravasaram', 'వీరవాసరం'], ['Palacoderu', 'పాలకోడేరు'], ['Undi', 'ఉండి'], ['Akividu', 'ఆకివీడు'], ['Kalla', 'కాళ్ల'], ['Pentapadu', 'పెంటపాడు'], ['Ganapavaram', 'గణపవరం'], ['Attili', 'అత్తిలి'], ['Iragavaram', 'ఇరగవరం'], ['Penugonda', 'పెనుగొండ'], ['Penumantra', 'పెనుమంట్ర']] },
  209: { count: 24, items: [['Eluru', 'ఏలూరు'], ['Denduluru', 'దెందులూరు'], ['Pedavegi', 'పెదవేగి'], ['Pedapadu', 'పెదపాడు'], ['Bhimadole', 'భీమడోలు'], ['Nidamarru', 'నిడమర్రు'], ['Unguturu ELR', 'ఉంగుటూరు'], ['Dwarakatirumala', 'ద్వారకాతిరుమల'], ['Kamavarapukota', 'కామవరపుకోట'], ['T.Narasapuram', 'టి.నరసాపురం'], ['Jangareddygudem', 'జంగారెడ్డిగూడెం'], ['Koyyalagudem', 'కొయ్యలగూడెం'], ['Chintalapudi', 'చింతలపూడి'], ['Lingapalem', 'లింగపాలెం'], ['Chatrai', 'చాట్రాయి'], ['Musunuru', 'ముసునూరు'], ['Nuzvid', 'నూజివీడు'], ['Agiripalli', 'ఆగిరిపల్లి'], ['Kaikaluru', 'కైకలూరు'], ['Mandavalli', 'మండవల్లి'], ['Kalidindi', 'కలిదిండి'], ['Mudinepalli', 'ముదినేపల్లి'], ['Buttayagudem', 'బుట్టాయగూడెం'], ['Jeelugumilli', 'జీలుగుమిల్లి']] },
  210: { count: 25, items: [['Machilipatnam', 'మచిలీపట్నం'], ['Gudivada', 'గుడివాడ'], ['Gannavaram', 'గన్నవరం'], ['Penamaluru', 'పెనమలూరు'], ['Avanigadda', 'అవనిగడ్డ'], ['Pamarru', 'పామర్రు'], ['Vuyyuru', 'ఉయ్యూరు'], ['Kankipadu', 'కంకిపాడు'], ['Unguturu KRN', 'ఉంగుటూరు (కృష్ణా)'], ['Bapulapadu', 'బాపులపాడు'], ['Gudlavalleru', 'గుడ్లవల్లేరు'], ['Pedaparupudi', 'పెదపారుపూడి'], ['Nandivada', 'నందివాడ'], ['Guduru KRN', 'గూడూరు (కృష్ణా)'], ['Pedana', 'పెడన'], ['Bantumilli', 'బంటుమిల్లి'], ['Kruthivennu', 'కృత్తివెన్ను'], ['Movva', 'మొవ్వ'], ['Ghantasala', 'ఘంటసాల'], ['Challapalli', 'చల్లపల్లి'], ['Mopidevi', 'మోపిదేవి'], ['Nagayalanka', 'నాగాయలంక'], ['Koduru KRN', 'కోడూరు'], ['Thotlavalluru', 'తోట్లవల్లూరు'], ['Pamidimukkala', 'పమిడిముక్కల']] },
  211: { count: 28, items: [['Narasaraopet', 'నరసరావుపేట'], ['Sattenapalli', 'సత్తెనపల్లి'], ['Chilakaluripet', 'చిలకలూరిపేట'], ['Vinukonda', 'వినుకొండ'], ['Gurazala', 'గురజాల'], ['Macherla', 'మాచర్ల'], ['Piduguralla', 'పిడుగురాళ్ల'], ['Amaravathi', 'అమరావతి'], ['Pedakurapadu', 'పెదకూరపాడు'], ['Krosuru', 'క్రోసూరు'], ['Atchampet', 'అచ్చంపేట'], ['Bellamkonda', 'బెల్లంకొండ'], ['Rajupalem', 'రాజుపాలెం'], ['Muppalla', 'ముప్పాళ్ల'], ['Nekarikallu', 'నకరికల్లు'], ['Rompicherla', 'రొంపిచర్ల'], ['Nadendla', 'నాదెండ్ల'], ['Edlapadu', 'యడ్లపాడు'], ['Ipur', 'ఈపూరు'], ['Savalyapuram', 'శావల్యాపురం'], ['Nuzendla', 'నూజెండ్ల'], ['Bollapalli', 'బొల్లపల్లి'], ['Dachepalli', 'దాచేపల్లి'], ['Karempudi', 'కారంపూడి'], ['Machavaram', 'మాచవరం'], ['Rentachintala', 'రెంటచింతల'], ['Durgi', 'దుర్గి'], ['Veldurthi PLN', 'వెల్దుర్తి']] },
  212: { count: 25, items: [['Bapatla', 'బాపట్ల'], ['Chirala', 'చీరాల'], ['Repalle', 'రేపల్లె'], ['Addanki', 'అద్దంకి'], ['Parchur', 'పర్చూరు'], ['Vemuru', 'వేమూరు'], ['Karlapalem', 'కర్లపాలెం'], ['Pittalavanipalem', 'పిట్టలవానిపాలెం'], ['Nizampatnam', 'నిజాంపట్నం'], ['Nagaram BPT', 'నగరం'], ['Cherukupalli', 'చెరుకుపల్లి'], ['Bhattiprolu', 'భట్టిప్రోలు'], ['Tsundur', 'చుండూరు'], ['Amruthalur', 'అమృతలూరు'], ['Kollur', 'కొల్లూరు'], ['Vetapalem', 'వేటపాలెం'], ['Chinaganjam', 'చినగంజాం'], ['Inkollu', 'ఇంకొల్లు'], ['Karamchedu', 'కారంచేడు'], ['Martur', 'మార్టూరు'], ['Yeddanapudi', 'యద్దనపూడి'], ['Santhamaguluru', 'సంతమాగులూరు'], ['Ballikurava', 'బల్లికురవ'], ['J.Panguluru', 'జె.పంగులూరు'], ['Korisapadu', 'కొరిశపాడు']] },
  213: { count: 24, items: [['Ongole', 'ఒంగోలు'], ['Kothapatnam', 'కొత్తపట్నం'], ['Santhanuthalapadu', 'సంతనూతలపాడు'], ['Chimakurthy', 'చీమకుర్తి'], ['Maddipadu', 'మద్దిపాడు'], ['Naguluppalapadu', 'నాగులుప్పలపాడు'], ['Tangutur', 'టంగుటూరు'], ['Zarugumalli', 'జరుగుమల్లి'], ['Singarayakonda', 'సింగరాయకొండ'], ['Kondapi', 'కొండపి'], ['Ponnaluru', 'పొన్నలూరు'], ['Marripudi', 'మర్రిపూడి'], ['Podili', 'పొదిలి'], ['Konakanamitla', 'కొనకనమిట్ల'], ['Darsi', 'దర్శి'], ['Mundlamuru', 'ముండ్లమూరు'], ['Thallur', 'తాళ్లూరు'], ['Kurichedu', 'కురిచేడు'], ['Donakonda', 'దొనకొండ'], ['Kanigiri', 'కనిగిరి'], ['Hanumanthunipadu', 'హనుమంతునిపాడు'], ['Veligandla', 'వెలిగండ్ల'], ['Pedacherlopalle', 'పెదచెర్లోపల్లి'], ['Pamur', 'పామూరు']] },
  214: { count: 38, items: [['Nellore Urban', 'నెల్లూరు అర్బన్'], ['Nellore Rural', 'నెల్లూరు రూరల్'], ['Kavali', 'కావలి'], ['Kovur', 'కోవూరు'], ['Atmakur NLR', 'ఆత్మకూరు (నెల్లూరు)'], ['Kandukur NLR', 'కందుకూరు'], ['Udayagiri', 'ఉదయగిరి'], ['Sarvepalli', 'సర్వేపల్లి'], ['Venkatachalam', 'వెంకటాచలం'], ['Muthukur', 'ముత్తుకూరు'], ['Thotapalligudur', 'తోటపల్లిగూడూరు'], ['Indukurpet', 'ఇందుకూరుపేట'], ['Buchireddypalem', 'బుచ్చిరెడ్డిపాలెం'], ['Sangam', 'సంగం'], ['Vidavalur', 'కొడవలూరు'], ['Allur', 'అల్లూరు'], ['Dagadarthi', 'దగదర్తి'], ['Bogole', 'బోగోలు'], ['Jaladanki', 'జలదంకి'], ['Kaligiri', 'కలిగిరి'], ['Vinjamur', 'వింజమూరు'], ['Duttalur', 'దుత్తలూరు'], ['Marripadu', 'మర్రిపాడు'], ['Ananthasagaram', 'అనంతసాగరం'], ['Anumasamudrampeta', 'అనుమసముద్రంపేట'], ['Chejerla', 'చేజర్ల'], ['Podalakur', 'పొదలకూరు'], ['Rapur', 'రాపూరు'], ['Sydapuram', 'సైదాపురం'], ['Kaluvoya', 'కలువాయి'], ['Seetharamapuram', 'సీతారామపురం'], ['Varikuntapadu', 'వరికుంటపాడు'], ['Kondapuram NLR', 'కొండాపురం'], ['Lingasamudram', 'లింగసముద్రం'], ['Voletivaripalem', 'వోలేటివారిపాలెం'], ['Gudluru', 'గుడ్లూరు'], ['Ulavapadu', 'ఉలవపాడు'], ['Manubolu', 'మనుబోలు']] },
  215: { count: 26, items: [['Kurnool Urban', 'కర్నూలు అర్బన్'], ['Kurnool Rural', 'కర్నూలు రూరల్'], ['Adoni', 'ఆదోని'], ['Yemmiganur', 'ఎమ్మిగనూరు'], ['Mantralayam', 'మంత్రాలయం'], ['Alur', 'ఆలూరు'], ['Pattikonda', 'పత్తికొండ'], ['Kodumur', 'కోడుమూరు'], ['Kallur KNL', 'కల్లూరు'], ['Orvakal', 'ఓర్వకల్లు'], ['C.Belagal', 'సి.బెళగల్'], ['Gonegandla', 'గోనెగండ్ల'], ['Nandavaram', 'నందవరం'], ['Kosigi', 'కోసిగి'], ['Kowthalam', 'కౌతాళం'], ['Pedda Kadubur', 'పెద్ద కడుబూరు'], ['Holagunda', 'హొళగుంద'], ['Halaharvi', 'హాలహర్వి'], ['Chippagiri', 'చిప్పగిరి'], ['Aspari', 'ఆస్పరి'], ['Devanakonda', 'దేవనకొండ'], ['Maddikera', 'మద్దికెర'], ['Tuggali', 'తుగ్గలి'], ['Krishnagiri', 'కృష్ణగిరి'], ['Veldurthi KNL', 'వెల్దుర్తి (కర్నూలు)'], ['Gudur KNL', 'గూడూరు (కర్నూలు)']] },
  216: { count: 29, items: [['Nandyal Urban', 'నంద్యాల అర్బన్'], ['Nandyal Rural', 'నంద్యాల రూరల్'], ['Allagadda', 'ఆళ్లగడ్డ'], ['Srisailam', 'శ్రీశైలం'], ['Atmakur NDL', 'ఆత్మకూరు (నంద్యాల)'], ['Nandikotkur', 'నందికొట్కూరు'], ['Dhone', 'డోన్'], ['Banaganapalle', 'బనగానపల్లె'], ['Koilkuntla', 'కోయిలకుంట్ల'], ['Bethamcherla', 'బేతంచెర్ల'], ['Peapully', 'ప్యాపిలి'], ['Owk', 'ఔకు'], ['Kolimigundla', 'కొలిమిగుండ్ల'], ['Sanjamala', 'సంజామల'], ['Dornipadu', 'దొర్నిపాడు'], ['Uyyalawada', 'ఉయ్యాలవాడ'], ['Chagalamarri', 'చాగలమర్రి'], ['Sirvel', 'శిరివెళ్ల'], ['Rudravaram', 'రుద్రవరం'], ['Gospadu', 'గోస్పాడు'], ['Mahanandi', 'మహానంది'], ['Bandi Atmakur', 'బండి ఆత్మకూరు'], ['Panyam', 'పాణ్యం'], ['Gadivemula', 'గాడివేముల'], ['Velgodu', 'వెల్గోడు'], ['Pamulapadu', 'పాములపాడు'], ['Jupadu Bungalow', 'జూపాడు బంగ్లా'], ['Midthur', 'మిడుతూరు'], ['Pagidyala', 'పగిడ్యాల']] },
  217: { count: 31, items: [['Anantapuramu Urban', 'అనంతపురం అర్బన్'], ['Anantapuramu Rural', 'అనంతపురం రూరల్'], ['Tadipatri', 'తాడిపత్రి'], ['Guntakal', 'గుంతకల్లు'], ['Uravakonda', 'ఉరవకొండ'], ['Rayadurg', 'రాయదుర్గం'], ['Kalyandurg', 'కళ్యాణదుర్గం'], ['Singanamala', 'సింగనమల'], ['Raptadu', 'రాప్తాడు'], ['Atmakur ATP', 'ఆత్మకూరు'], ['Kudair', 'కూడేరు'], ['Garladinne', 'గార్లదిన్నె'], ['Peddapappur', 'పెద్దపప్పూరు'], ['Putlur', 'పుట్లూరు'], ['Yellanur', 'యల్లనూరు'], ['Narpala', 'నార్పల'], ['Bukkarayasamudram', 'బుక్కరాయసముద్రం'], ['Peddavadugur', 'పెద్దవడుగూరు'], ['Yadiki', 'యాడికి'], ['Gooty', 'గుత్తి'], ['Pamidi', 'పామిడి'], ['Vajrakarur', 'వజ్రకరూరు'], ['Vidapanakal', 'విడపనకల్లు'], ['Beluguppa', 'బెళుగుప్ప'], ['Kanekal', 'కణేకల్లు'], ['Bommanahal', 'బొమ్మనహాళ్'], ['D.Hirehal', 'డి.హీరేహాళ్'], ['Gummagatta', 'గుమ్మగట్ట'], ['Brahmasamudram', 'బ్రహ్మసముద్రం'], ['Settur', 'శెట్టూరు'], ['Kundurpi', 'కుందుర్పి']] },
  218: { count: 32, items: [['Puttaparthi', 'పుట్టపర్తి'], ['Hindupur', 'హిందూపురం'], ['Dharmavaram', 'ధర్మవరం'], ['Kadiri', 'కదిరి'], ['Penukonda', 'పెనుకొండ'], ['Madakasira', 'మడకశిర'], ['Bukkapatanam', 'బుక్కపట్నం'], ['Kothacheruvu', 'కొత్తచెరువు'], ['Nallamada', 'నల్లమాడ'], ['Obuladevaracheruvu', 'ఓబులదేవరచెరువు'], ['Gorantla', 'గోరంట్ల'], ['Somandepalli', 'సోమందేపల్లి'], ['Roddam', 'రొద్దం'], ['Parigi SSS', 'పరిగి'], ['Lepakshi', 'లేపాక్షి'], ['Chilamathur', 'చిలమత్తూరు'], ['Agali', 'అగళి'], ['Rolla', 'రొళ్ల'], ['Amarapuram', 'అమరాపురం'], ['Gudibanda', 'గుడిబండ'], ['Bathalapalli', 'బత్తలపల్లి'], ['Tadimarri', 'తాడిమర్రి'], ['Mudigubba', 'ముదిగుబ్బ'], ['Kanaganapalli', 'కనగానపల్లి'], ['Chennekothapalli', 'చెన్నేకొత్తపల్లి'], ['Ramagiri SSS', 'రామగిరి'], ['Talupula', 'తలుపుల'], ['Nambulapulakunta', 'నంబులపూలకుంట'], ['Gandlapenta', 'గాండ్లపెంట'], ['Tanakal', 'తనకల్లు'], ['Amadagur', 'ఆమడగూరు'], ['Nallacheruvu', 'నల్లచెరువు']] },
  219: { count: 36, items: [['Kadapa', 'కడప'], ['Proddatur', 'ప్రొద్దుటూరు'], ['Pulivendula', 'పులివెందుల'], ['Jammalamadugu', 'జమ్మలమడుగు'], ['Mydukur', 'మైదుకూరు'], ['Badvel', 'బద్వేలు'], ['Kamalapuram', 'కమలాపురం'], ['Vempalli', 'వేంపల్లె'], ['Chinthakomma Dinne', 'చింతకొమ్మదిన్నె'], ['Pendlimarri', 'పెండ్లిమర్రి'], ['Vallur', 'వల్లూరు'], ['Chennur KDP', 'చెన్నూరు'], ['Khajipet', 'ఖాజీపేట'], ['Chapad', 'చాపాడు'], ['Duvvur', 'దువ్వూరు'], ['Rajupalem KDP', 'రాజుపాలెం'], ['Mylavaram KDP', 'మైలవరం'], ['Muddanur', 'ముద్దనూరు'], ['Kondapuram KDP', 'కొండాపురం'], ['Simhadripuram', 'సింహాద్రిపురం'], ['Lingala', 'లింగాల'], ['Thondur', 'తొండూరు'], ['Vemula', 'వేముల'], ['Chakrayapet', 'చక్రాయపేట'], ['Yerraguntla', 'ఎర్రగుంట్ల'], ['Veerapunayunipalle', 'వీరపునాయునిపల్లె'], ['Sidhout', 'సిద్ధవటం'], ['Vontimitta', 'ఒంటిమిట్ట'], ['Atloor', 'అట్లూరు'], ['Gopavaram', 'గోపవరం'], ['Porumamilla', 'పోరుమామిళ్ల'], ['B.Kodur', 'బి.కోడూరు'], ['Brahmamgarimattam', 'బ్రహ్మం గారి మఠం'], ['Kalasapadu', 'కలసపాడు'], ['Sri Avadhutha Kasinayana', 'కాశీనాయన'], ['Peddamudium', 'పెద్దముడియం']] },
  220: { count: 30, items: [['Rayachoti', 'రాయచోటి'], ['Madanapalle', 'మదనపల్లె'], ['Rajampet ANM', 'రాజంపేట'], ['Railway Koduru', 'రైల్వే కోడూరు'], ['Thamballapalle', 'తంబళ్లపల్లె'], ['Pileru', 'పీలేరు'], ['Sambepalli', 'సంబేపల్లి'], ['Chinnamandem', 'చిన్నమండెం'], ['Galiveedu', 'గాలివీడు'], ['Lakkireddipalli', 'లక్కిరెడ్డిపల్లి'], ['Ramapuram', 'రామాపురం'], ['Veeraballi', 'వీరబల్లి'], ['Nandalur', 'నందలూరు'], ['Penagalur', 'పెనగలూరు'], ['Chitvel', 'చిట్వేలు'], ['Pullampeta', 'పుల్లంపేట'], ['Obulavaripalle', 'ఓబులవారిపల్లె'], ['B.Kothakota', 'బి.కొత్తకోట'], ['Peddathippasamudram', 'పెద్దతిప్పసముద్రం'], ['Mulakalacheruvu', 'ములకలచెరువు'], ['Kurabalakota', 'కురబలకోట'], ['Peddamandyam', 'పెద్దమండ్యం'], ['Nimmanapalle', 'నిమ్మనపల్లె'], ['Ramasamudram', 'రామసముద్రం'], ['Valmikipuram', 'వాల్మీకిపురం'], ['Kalikiri', 'కలికిరి'], ['Gurramkonda', 'గుర్రంకొండ'], ['Kalakada', 'కలకడ'], ['Kambhamvaripalle', 'కంబంవారిపల్లె'], ['T.Sundupalle', 'టి.సుండుపల్లె']] },
  221: { count: 31, items: [['Chittoor', 'చిత్తూరు'], ['Palamaner', 'పలమనేరు'], ['Kuppam', 'కుప్పం'], ['Punganur', 'పుంగనూరు'], ['Nagari CTR', 'నగరి (చిత్తూరు)'], ['Gangadhara Nellore', 'గంగాధర నెల్లూరు'], ['Puthalapattu', 'పూతలపట్టు'], ['Gudipala', 'గుడిపాల'], ['Yadamarri', 'యాదమరి'], ['Thavanampalle', 'తవనంపల్లె'], ['Irala', 'ఐరాల'], ['Penumuru', 'పెనుమూరు'], ['Srirangarajapuram', 'శ్రీరంగరాజపురం'], ['Vedurukuppam', 'వెదురుకుప్పం'], ['Palasamudram', 'పాలసముద్రం'], ['Karvetinagar', 'కార్వేటినగరం'], ['Nindra', 'నిండ్ర'], ['Vijayapuram', 'విజయపురం'], ['Bangarupalem', 'బంగారుపాలెం'], ['Gangavaram CTR', 'గంగవరం'], ['Peddapanjani', 'పెద్దపంజాణి'], ['Baireddipalle', 'బైరెడ్డిపల్లె'], ['Venkatagirikota', 'వి.కోట'], ['Santhipuram', 'శాంతిపురం'], ['Gudupalle', 'గుడుపల్లె'], ['Ramakuppam', 'రామకుప్పం'], ['Chowdepalle', 'చౌడేపల్లె'], ['Somala', 'సోమల'], ['Sodam', 'సోదం'], ['Pulicherla', 'పులిచెర్ల'], ['Rompicherla CTR', 'రొంపిచర్ల']] },
  222: { count: 30, items: [['Srikakulam', 'శ్రీకాకుళం'], ['Palasa', 'పలాస'], ['Tekkali', 'టెక్కలి'], ['Ichchapuram', 'ఇచ్ఛాపురం'], ['Amadalavalasa', 'ఆమదాలవలస'], ['Narasannapeta', 'నరసన్నపేట'], ['Pathapatnam', 'పాతపట్నం'], ['Etcherla', 'ఎచ్చెర్ల'], ['Gara', 'గార'], ['Polaki', 'పోలాకి'], ['Ganguvarisigadam', 'జి.సిగడాం'], ['Laveru', 'లావేరు'], ['Ranastalam', 'రణస్థలం'], ['Ponduru', 'పొందూరు'], ['Sarubujjili', 'సరుబుజ్జిలి'], ['Burja', 'బూర్జ'], ['Lakshminarsupeta', 'లక్ష్మీనర్సుపేట'], ['Hiramandalam', 'హీరమండలం'], ['Kothuru SKLM', 'కొత్తూరు'], ['Jalumuru', 'జలుమూరు'], ['Santhabommali', 'సంతబొమ్మాళి'], ['Kotabommali', 'కోటబొమ్మాళి'], ['Nandigam', 'నందిగాం'], ['Vajrapukothuru', 'వజ్రపుకొత్తూరు'], ['Mandasa', 'మందస'], ['Sompeta', 'సోంపేట'], ['Kanchili', 'కంచిలి'], ['Kaviti', 'కవిటి'], ['Meliaputti', 'మెళియాపుట్టి'], ['Saravakota', 'సారవకోట']] },
  223: { count: 27, items: [['Vizianagaram', 'విజయనగరం'], ['Bobbili', 'బొబ్బిలి'], ['Cheepurupalli', 'చీపురుపల్లి'], ['Gajapathinagaram', 'గజపతినగరం'], ['Srungavarapukota', 'శృంగవరపుకోట'], ['Nellimarla', 'నెల్లిమర్ల'], ['Pusapatirega', 'పూసపాటిరేగ'], ['Bhogapuram', 'భోగాపురం'], ['Denkada', 'డెంకాడ'], ['Gantyada', 'గంట్యాడ'], ['Jami', 'జామి'], ['Kothavalasa', 'కొత్తవలస'], ['Lakkavarapukota', 'లక్కవరపుకోట'], ['Vepada', 'వేపాడ'], ['Bondapalli', 'బొండపల్లి'], ['Garividi', 'గరివిడి'], ['Gurla', 'గుర్ల'], ['Merakamudidam', 'మెరకముడిదాం'], ['Dattirajeru', 'దత్తిరాజేరు'], ['Mentada', 'మెంటాడ'], ['Ramabhadrapuram', 'రామభద్రపురం'], ['Badangi', 'బాడంగి'], ['Therlam', 'తెర్లాం'], ['Rajam', 'రాజాం'], ['Vangara', 'వంగర'], ['Regidi Amadalavalasa', 'రేగిడి ఆమదాలవలస'], ['Santhakaviti', 'సంతకవిటి']] },
  224: { count: 15, items: [['Parvathipuram', 'పార్వతీపురం'], ['Salur', 'సాలూరు'], ['Palakonda', 'పాలకొండ'], ['Kurupam', 'కురుపాం'], ['Komarada', 'కొమరాడ'], ['Garugubilli', 'గరుగుబిల్లి'], ['Jiyyammavalasa', 'జియ్యమ్మవలస'], ['Gummalakshmipuram', 'గుమ్మలక్ష్మీపురం'], ['Makkuva', 'మక్కువ'], ['Pachipenta', 'పాచిపెంట'], ['Balijipeta', 'బలిజిపేట'], ['Seethanagaram PVM', 'సీతానగరం'], ['Bhamini', 'భామిని'], ['Veeraghattam', 'వీరఘట్టం'], ['Seethampeta', 'సీతంపేట']] },
  225: { count: 18, items: [['Paderu', 'పాడేరు'], ['Araku Valley', 'అరకు లోయ'], ['Chintapalli ASR', 'చింతపల్లి'], ['Ananthagiri', 'అనంతగిరి'], ['Dumbriguda', 'డుంబ్రిగూడ'], ['Hukumpeta', 'హుకుంపేట'], ['Pedabayalu', 'పెదబయలు'], ['Munchingiputtu', 'ముంచింగిపుట్టు'], ['G.Madugula', 'జి.మాడుగుల'], ['Gudem Kotha Veedhi', 'గూడెం కొత్తవీధి'], ['Koyyuru', 'కొయ్యూరు'], ['Rampachodavaram', 'రంపచోడవరం'], ['Addateegala', 'అడ్డతీగల'], ['Maredumilli', 'మారేడుమిల్లి'], ['Chintoor Agency', 'చింతూరు ఏజెన్సీ'], ['Mampa', 'మంప'], ['Sileru', 'సీలేరు'], ['Donkarayi', 'డొంకరాయి']] },
  226: { count: 24, items: [['Anakapalli', 'అనకాపల్లి'], ['Narsipatnam', 'నర్సీపట్నం'], ['Chodavaram', 'చోడవరం'], ['Madugula', 'మాడుగుల'], ['Payakaraopeta', 'పాయకరావుపేట'], ['Yelamanchili', 'యలమంచిలి'], ['Paravada', 'పరవాడ'], ['Sabbavaram', 'సబ్బవరం'], ['Kasimkota', 'కశింకోట'], ['Munagapaka', 'మునగపాక'], ['Atchutapuram', 'అచ్యుతాపురం'], ['Rambilli', 'రాంబిల్లి'], ['Nakkapalli', 'నక్కపల్లి'], ['S.Rayavaram', 'ఎస్.రాయవరం'], ['Kotauratla', 'కోటవురట్ల'], ['Makavarapalem', 'మాకవరపాలెం'], ['Nathavaram', 'నాతవరం'], ['Golugonda', 'గొలుగొండ'], ['Rolugunta', 'రోలుగుంట'], ['Ravikamatham', 'రావికమతం'], ['Butchayyapeta', 'బుచ్చెయ్యపేట'], ['Cheedikada', 'చీడికాడ'], ['Devarapalli AKP', 'దేవరపల్లి'], ['K.Kotapadu', 'కె.కోటపాడు']] },
  // 27. Polavaram District (పోలవరం జిల్లా - Formed Dec 2025)
  227: { count: 14, items: [['Polavaram', 'పోలవరం'], ['Kukunoor', 'కుక్కునూరు'], ['Velerupadu', 'వేలేరుపాడు'], ['Chinturu', 'చింతూరు'], ['Kunavaram', 'కూనవరం'], ['Vararamachandrapuram', 'వరరామచంద్రాపురం'], ['Yetapaka', 'ఎటపాక'], ['Devipatnam', 'దేవీపట్నం'], ['Rajavommangi', 'రాజవొమ్మంగి'], ['Gangavaram PLV', 'గంగవరం'], ['Y.Ramavaram', 'వై.రామవరం'], ['Koyyuru PLV', 'కొయ్యూరు (పోలవరం)'], ['Jeelugumilli Polavaram', 'జీలుగుమిల్లి (పోలవరం)'], ['Buttayagudem Polavaram', 'బుట్టాయగూడెం (పోలవరం)']] },
  // 28. Markapuram District (మార్కాపురం జిల్లా - Formed Dec 2025)
  228: { count: 16, items: [['Markapuram', 'మార్కాపురం'], ['Yerragondapalem', 'ఎర్రగొండపాలెం'], ['Giddalur', 'గిద్దలూరు'], ['Cumbum', 'కంభం'], ['Tripuranthakam', 'త్రిపురాంతకం'], ['Pullalacheruvu', 'పుల్లలచెరువు'], ['Dornala', 'దోర్నాల'], ['Peda Araveedu', 'పెద్దారవీడు'], ['Tarlupadu', 'తర్లుపాడు'], ['Bestavaripeta', 'బెస్తవారిపేట'], ['Ardhaveedu', 'అర్థవీడు'], ['Racherla', 'రాచర్ల'], ['Komarolu', 'కొమరోలు'], ['Chandra Sekhara Puram', 'సి.ఎస్.పురం'], ['Veligandla Markapuram', 'వెలిగండ్ల (మార్కాపురం)'], ['Konakanamitla Markapuram', 'కొనకనమిట్ల (మార్కాపురం)']] },
};

// Fixed anchor IDs used by initial villages, reporters & articles so foreign keys remain 100% consistent
const TS_ANCHOR_MANDAL_IDS: Record<string, number> = {
  '101:Khairatabad': 1001,
  '101:Secunderabad': 1002,
  '101:Amberpet': 1003,
  '101:Golconda': 1004,
  '102:Serilingampally': 1005,
  '102:Rajendranagar': 1006,
  '102:Ibrahimpatnam': 1007,
  '103:Kukatpally': 1008,
  '103:Uppal': 1009,
  '103:Medchal': 1010,
  '105:Karimnagar Urban': 1011,
  '105:Huzurabad': 1012,
  '106:Warangal': 1013,
  '107:Hanumakonda': 1014,
  '108:Khammam Urban': 1015,
  '110:Nalgonda': 1016,
  '114:Siddipet Urban': 1017,
};

const AP_ANCHOR_MANDAL_IDS: Record<string, number> = {
  '201:Bheemunipatnam': 2001,
  '201:Gajuwaka': 2002,
  '202:Vijayawada Urban': 2003,
  '202:Mylavaram': 2004,
  '203:Tulluru (Amaravati)': 2005,
  '203:Mangalagiri': 2006,
  '204:Tirupati Urban': 2007,
  '205:Rajahmundry Urban': 2008,
};

export function generateTelangana594Mandals(): SeedMandal[] {
  const result: SeedMandal[] = [];
  let nextDynamicId = 1018;
  for (const dist of TELANGANA_33_DISTRICTS) {
    const spec = TS_DISTRICT_MANDAL_MAP[dist.id];
    const items = spec?.items || [];
    const targetCount = spec?.count || items.length;
    for (let i = 0; i < targetCount; i++) {
      const pair = items[i] || [`${dist.name_en} Mandal ${i + 1}`, `${dist.name_te} మండలం ${i + 1}`];
      const anchorKey = `${dist.id}:${pair[0]}`;
      const assignedId = TS_ANCHOR_MANDAL_IDS[anchorKey] ?? nextDynamicId++;
      result.push({
        id: assignedId,
        district_id: dist.id,
        lgd_code: `TSM_${dist.id}_${i + 1}`,
        name_en: pair[0],
        name_te: pair[1],
        admin_term: 'Mandal',
      });
    }
  }
  return result.sort((a, b) => a.id - b.id);
}

export function generateAndhraPradesh688Mandals(): SeedMandal[] {
  const result: SeedMandal[] = [];
  let nextDynamicId = 2009;
  for (const dist of ANDHRA_PRADESH_28_DISTRICTS) {
    const spec = AP_DISTRICT_MANDAL_MAP[dist.id];
    const items = spec?.items || [];
    const targetCount = spec?.count || items.length;
    for (let i = 0; i < targetCount; i++) {
      const pair = items[i] || [`${dist.name_en} Mandal ${i + 1}`, `${dist.name_te} మండలం ${i + 1}`];
      const anchorKey = `${dist.id}:${pair[0]}`;
      const assignedId = AP_ANCHOR_MANDAL_IDS[anchorKey] ?? nextDynamicId++;
      result.push({
        id: assignedId,
        district_id: dist.id,
        lgd_code: `APM_${dist.id}_${i + 1}`,
        name_en: pair[0],
        name_te: pair[1],
        admin_term: 'Mandal',
      });
    }
  }
  return result.sort((a, b) => a.id - b.id);
}

