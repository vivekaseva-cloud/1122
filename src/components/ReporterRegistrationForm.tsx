import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, FileText, Trash2, Upload, X } from 'lucide-react';
import { DistrictItem, MandalItem, NewsCategory, StateItem, VillageItem } from '../types';

interface ReporterRegistrationFormProps {
  states: StateItem[];
  districts: DistrictItem[];
  mandals: MandalItem[];
  villages: VillageItem[];
  categories: NewsCategory[];
  onSuccessLoginRedirect: () => void;
}

export const ReporterRegistrationForm: React.FC<ReporterRegistrationFormProps> = ({
  states,
  districts,
  mandals,
  villages,
  categories,
  onSuccessLoginRedirect,
}) => {
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [stateId, setStateId] = useState<number>(1);
  const [districtId, setDistrictId] = useState<number>(101);
  const [mandalId, setMandalId] = useState<number>(1001);
  const [villageId, setVillageId] = useState<number | ''>(5001);
  const [villageName, setVillageName] = useState('Somajiguda');
  const [pinCode, setPinCode] = useState('500082');

  const [experienceYears, setExperienceYears] = useState('2 Years');
  const [previousMediaOrg, setPreviousMediaOrg] = useState('');
  const [designation, setDesignation] = useState('Mandal Reporter');
  const [preferredCategories, setPreferredCategories] = useState<number[]>([1, 5, 7, 8]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [docType, setDocType] = useState<string>('VOTER_ID');
  const [maskedDocRef, setMaskedDocRef] = useState<string>('');
  const [docFileDataUrl, setDocFileDataUrl] = useState<string>('');
  const [docFileName, setDocFileName] = useState<string>('');
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);

  // Camera capture state
  const [cameraTarget, setCameraTarget] = useState<'PHOTO' | 'DOC' | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredRegNo, setRegisteredRegNo] = useState<string | null>(null);

  const selectedState = states.find((s) => s.id === Number(stateId));
  const subdistrictTerm = selectedState?.subdistrict_term || 'Mandal';

  const filteredDistricts = districts.filter((d) => d.state_id === Number(stateId));
  const filteredMandals = mandals.filter((m) => m.district_id === Number(districtId));
  const filteredVillages = villages.filter((v) => v.mandal_id === Number(mandalId));

  const handleStateChange = (newStateId: number) => {
    setStateId(newStateId);
    const firstDist = districts.find((d) => d.state_id === newStateId);
    const nextDistId = firstDist ? firstDist.id : 0;
    setDistrictId(nextDistId);
    const firstMandal = mandals.find((m) => m.district_id === nextDistId);
    const nextMandalId = firstMandal ? firstMandal.id : 0;
    setMandalId(nextMandalId);
    const firstVil = villages.find((v) => v.mandal_id === nextMandalId);
    setVillageId(firstVil ? firstVil.id : '');
    setVillageName(firstVil ? firstVil.name_en : '');
    if (firstVil?.pin_code) setPinCode(firstVil.pin_code);
  };

  const handleDistrictChange = (newDistId: number) => {
    setDistrictId(newDistId);
    const firstMandal = mandals.find((m) => m.district_id === newDistId);
    const nextMandalId = firstMandal ? firstMandal.id : 0;
    setMandalId(nextMandalId);
    const firstVil = villages.find((v) => v.mandal_id === nextMandalId);
    setVillageId(firstVil ? firstVil.id : '');
    setVillageName(firstVil ? firstVil.name_en : '');
    if (firstVil?.pin_code) setPinCode(firstVil.pin_code);
  };

  const handleMandalChange = (newMandalId: number) => {
    setMandalId(newMandalId);
    const firstVil = villages.find((v) => v.mandal_id === newMandalId);
    setVillageId(firstVil ? firstVil.id : '');
    setVillageName(firstVil ? firstVil.name_en : '');
    if (firstVil?.pin_code) setPinCode(firstVil.pin_code);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'PHOTO' | 'DOC') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError('File size must be under 8 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (target === 'PHOTO') {
          setProfilePhoto(reader.result);
        } else {
          setDocFileDataUrl(reader.result);
          setDocFileName(file.name);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async (target: 'PHOTO' | 'DOC') => {
    setError(null);
    setCameraTarget(target);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === 'PHOTO' ? 'user' : 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraTarget(null);
      setError('Camera access was declined or unavailable on this device. Please use the file/gallery upload button.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraTarget(null);
  };

  const captureFromCamera = () => {
    if (!videoRef.current || !cameraTarget) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      if (cameraTarget === 'PHOTO') {
        setProfilePhoto(dataUrl);
      } else {
        setDocFileDataUrl(dataUrl);
        setDocFileName(`camera_capture_${Date.now()}.jpg`);
      }
    }
    stopCamera();
  };

  const toggleCategory = (id: number) => {
    setPreferredCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!profilePhoto) {
      setError('Please upload or capture your Reporter Profile Photograph.');
      return;
    }
    if (!docFileDataUrl) {
      setError('Please upload your Identity Verification Document (Image or PDF).');
      return;
    }
    if (!consentAccepted) {
      setError('Please accept the explicit consent for encrypted private identity verification.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reporters/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          father_name: fatherName,
          dob,
          gender,
          mobile,
          whatsapp,
          email,
          residential_address: residentialAddress,
          state_id: stateId,
          district_id: districtId,
          mandal_id: mandalId,
          village_id: villageId || null,
          village_name: villageName,
          pin_code: pinCode,
          experience_years: experienceYears,
          previous_media_org: previousMediaOrg,
          designation,
          preferred_categories: preferredCategories,
          username,
          password,
          confirm_password: confirmPassword,
          profile_photo: profilePhoto,
          identity_document_type: docType,
          identity_document_masked_ref: maskedDocRef,
          identity_document_file: docFileDataUrl,
          consent_accepted: consentAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
      } else {
        setRegisteredRegNo(data.registration_number);
      }
    } catch {
      setError('Network error while submitting registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (registeredRegNo) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-stone-200 rounded-xl p-8 text-center my-8">
        <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-stone-900">రిపోర్టర్ దరఖాస్తు విజయవంతంగా స్వీకరించబడింది!</h2>
        <p className="text-sm text-stone-600 mt-2">
          Your Reporter Registration Application has been recorded with status <strong>PENDING</strong>.
        </p>
        <div className="my-5 p-4 bg-stone-50 border border-stone-200 rounded-lg text-sm tabular-nums">
          <div>
            Registration Number: <span className="font-mono font-bold text-[#991B1B]">{registeredRegNo}</span>
          </div>
          <div className="mt-1 text-xs text-stone-600">
            Super Admin will review your application and encrypted identity document. Upon approval, your Unique Reporter ID and 6-Month Validity Press ID Card will be generated automatically.
          </div>
        </div>
        <button
          type="button"
          onClick={onSuccessLoginRedirect}
          className="px-6 py-2.5 bg-[#991B1B] hover:bg-red-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Proceed to Reporter Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-xl p-6 md:p-8 my-6">
      <div className="border-b border-stone-200 pb-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
          రిపోర్టర్ రిజిస్ట్రేషన్ ఫారమ్ (Reporter Registration)
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          నేటి భారతం (NETI BHARATHAM – https://netibhaaratham.com) అధికారిక మండల, జిల్లా మరియు రాష్ట్ర రిపోర్టర్ నమోదు. అడ్మిన్ ఆమోదం తర్వాత 6 నెలల చెల్లుబాటు గల ప్రెస్ ఐడి కార్డు జారీ చేయబడుతుంది.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 text-sm rounded-lg font-medium">
          {error}
        </div>
      )}

      {cameraTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-stone-900">
                {cameraTarget === 'PHOTO' ? 'Capture Reporter Photograph' : 'Capture Identity Verification Document'}
              </h3>
              <button type="button" onClick={stopCamera} className="text-stone-500 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black aspect-video object-cover" />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureFromCamera}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#991B1B] rounded-lg"
              >
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Personal Details */}
        <section>
          <h2 className="text-lg font-bold text-[#1E3A8A] border-b border-stone-200 pb-2 mb-4">
            1. వ్యక్తిగత వివరాలు (Personal &amp; Location Details)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name (పూర్తి పేరు) *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ఉదా: కొప్పుల రమేష్ గౌడ్"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Father Name (తండ్రి పేరు) *</label>
              <input
                type="text"
                required
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="తండ్రి పూర్తి పేరు"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Date of Birth (పుట్టిన తేదీ) *</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Gender (లింగం) *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              >
                <option value="Male">Male (పురుషుడు)</option>
                <option value="Female">Female (మహిళ)</option>
                <option value="Other">Other (ఇతరులు)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number (మొబైల్ నంబర్) *</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit Mobile Number"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp Number (వాట్సాప్ నంబర్) *</label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="10-digit WhatsApp Number"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address (ఇమెయిల్ చిరునామా) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reporter@example.com"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Complete Residential Address (పూర్తి నివాస చిరునామా) *
              </label>
              <textarea
                rows={2}
                required
                value={residentialAddress}
                onChange={(e) => setResidentialAddress(e.target.value)}
                placeholder="ఇంటి నంబర్, వీధి, కాలనీ..."
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              />
            </div>

            {/* Dependent Hierarchical LGD India Location Dropdowns */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                State / UT (రాష్ట్రం / కేంద్రపాలిత ప్రాంతం) *
              </label>
              <select
                value={stateId}
                onChange={(e) => handleStateChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_te} ({s.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">District (జిల్లా) *</label>
              <select
                value={districtId}
                onChange={(e) => handleDistrictChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              >
                {filteredDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_te} ({d.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {subdistrictTerm} (మండలం / తాలూకా / బ్లాక్) *
              </label>
              <select
                value={mandalId}
                onChange={(e) => handleMandalChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#991B1B]"
              >
                {filteredMandals.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name_te} ({m.name_en})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Village / Town (గ్రామం / పట్టణం) *</label>
              <div className="flex gap-2">
                {filteredVillages.length > 0 && (
                  <select
                    value={villageId}
                    onChange={(e) => {
                      const vId = Number(e.target.value);
                      setVillageId(vId);
                      const vObj = filteredVillages.find((v) => v.id === vId);
                      if (vObj) {
                        setVillageName(vObj.name_en);
                        if (vObj.pin_code) setPinCode(vObj.pin_code);
                      }
                    }}
                    className="w-1/2 px-2 py-2 text-sm border border-stone-300 rounded-lg"
                  >
                    {filteredVillages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name_te} ({v.name_en})
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  required
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  placeholder="గ్రామం / పట్టణం పేరు"
                  className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Code (పిన్ కోడ్) *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="500082"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Professional Details & Document Uploads */}
        <section>
          <h2 className="text-lg font-bold text-[#1E3A8A] border-b border-stone-200 pb-2 mb-4">
            2. వృత్తిపరమైన వివరాలు &amp; గుర్తింపు ధృవీకరణ (Professional Details &amp; Uploads)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Reporter Experience (అనుభవం) *</label>
              <select
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              >
                <option value="Fresher">Fresher (కొత్తవారు)</option>
                <option value="1-2 Years">1-2 Years</option>
                <option value="2-5 Years">2-5 Years</option>
                <option value="5+ Years">5+ Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Previous Media Organization (గత సంస్థ)</label>
              <input
                type="text"
                value={previousMediaOrg}
                onChange={(e) => setPreviousMediaOrg(e.target.value)}
                placeholder="ఉదా: లోకల్ న్యూస్ / ప్రింట్ మీడియా"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Reporter Designation (హోదా) *</label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              >
                <option value="Mandal Reporter">Mandal Reporter (మండల రిపోర్టర్)</option>
                <option value="Constituency Incharge">Constituency Incharge (నియోజకవర్గ ఇన్‌ఛార్జ్)</option>
                <option value="District Crime Reporter">District Crime Reporter (జిల్లా క్రైమ్ రిపోర్టర్)</option>
                <option value="District Bureau Chief">District Bureau Chief (జిల్లా బ్యూరో చీఫ్)</option>
                <option value="State Bureau Reporter">State Bureau Reporter (స్టేట్ బ్యూరో రిపోర్టర్)</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Preferred News Categories (ఆసక్తి గల వార్తా విభాగాలు)
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 16).map((cat) => {
                const selected = preferredCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#991B1B] text-white border-[#991B1B]'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {cat.name_te}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Photo & Identity Document Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reporter Profile Photograph */}
            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50/60">
              <label className="block text-xs font-bold text-stone-900 mb-1">
                Reporter Profile Photograph (రిపోర్టర్ పాస్‌పోర్ట్ సైజ్ ఫోటో) *
              </label>
              <p className="text-[11px] text-stone-500 mb-3">
                Upload from Mobile Gallery, Computer, or Camera Capture (JPG, PNG, WebP).
              </p>

              {profilePhoto ? (
                <div className="flex items-center gap-4">
                  <img
                    src={profilePhoto}
                    alt="Reporter Preview"
                    className="w-20 h-24 object-cover rounded-lg border border-stone-300"
                  />
                  <div className="space-y-2">
                    <span className="block text-xs font-semibold text-emerald-700">Photo Ready for ID Card</span>
                    <button
                      type="button"
                      onClick={() => setProfilePhoto('')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove / Replace</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-stone-400 rounded-lg text-xs font-semibold text-stone-800 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#991B1B]" />
                    <span>Gallery / Computer</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileSelect(e, 'PHOTO')}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => startCamera('PHOTO')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Camera Capture</span>
                  </button>
                </div>
              )}
            </div>

            {/* Identity Verification Document (Alternative ID options, Zero Public Aadhaar Exposure) */}
            <div className="p-4 border border-stone-200 rounded-lg bg-stone-50/60">
              <label className="block text-xs font-bold text-stone-900 mb-1">
                Identity Verification Document (గుర్తింపు ధృవీకరణ పత్రం - Private Encrypted) *
              </label>
              <p className="text-[11px] text-stone-500 mb-2">
                We do NOT require full Aadhaar numbers. Select an alternative Government ID or Masked ID. Stored encrypted in private storage and NEVER exposed on your public profile or ID card.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                >
                  <option value="VOTER_ID">Voter ID (EPIC Card)</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                  <option value="PAN_CARD">PAN Card</option>
                  <option value="PASSPORT">Indian Passport</option>
                  <option value="PRESS_ACCREDITATION">Previous Press ID</option>
                  <option value="MASKED_GOVT_ID">Masked Govt ID (Last 4 Digits Only)</option>
                </select>
                <input
                  type="text"
                  required
                  value={maskedDocRef}
                  onChange={(e) => setMaskedDocRef(e.target.value)}
                  placeholder="Last 4 digits (e.g. XXXX-4821)"
                  className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                />
              </div>

              {docFileDataUrl ? (
                <div className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 truncate">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{docFileName || 'Verification Document Attached'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDocFileDataUrl('');
                      setDocFileName('');
                    }}
                    className="text-xs text-red-700 font-semibold hover:underline ml-2 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-stone-400 rounded-lg text-xs font-semibold text-stone-800 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#1E3A8A]" />
                    <span>Upload Image / PDF</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => handleFileSelect(e, 'DOC')}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => startCamera('DOC')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture ID</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 3: Login Credentials & Consent */}
        <section>
          <h2 className="text-lg font-bold text-[#1E3A8A] border-b border-stone-200 pb-2 mb-4">
            3. లాగిన్ వివరాలు &amp; సమ్మతి (Login Credentials &amp; Privacy Consent)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Self-Selected Username (యూజర్ నేమ్) *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. raju_warangal"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password (పాస్‌వర్డ్) *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password (పాస్‌వర్డ్ నిర్ధారణ) *</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              నేను సమర్పించిన వ్యక్తిగత మరియు గుర్తింపు ధృవీకరణ వివరాలు వాస్తవమైనవని ధృవీకరిస్తున్నాను. నా గుర్తింపు పత్రాన్ని కేవలం నేటి భారతం అడ్మిన్ ధృవీకరణ కొరకు మాత్రమే AES-256 ప్రైవేట్ ఎన్‌క్రిప్టెడ్ స్టోరేజ్‌లో భద్రపరచడానికి నా స్పష్టమైన సమ్మతిని (Explicit Consent) తెలియజేస్తున్నాను.
            </span>
          </label>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#991B1B] hover:bg-red-900 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
          >
            {submitting ? 'Submitting Registration...' : 'Submit Reporter Application (రిపోర్టర్ దరఖాస్తు సమర్పించండి)'}
          </button>
        </div>
      </form>
    </div>
  );
};
