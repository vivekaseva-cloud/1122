import React, { useEffect, useState } from 'react';
import { Download, Printer, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { ReporterProfile } from '../types';
import { downloadReporterIdCardPdf } from '../utils/idCardPdf';

interface ReporterIdCardViewProps {
  reporter: ReporterProfile;
}

export const ReporterIdCardView: React.FC<ReporterIdCardViewProps> = ({ reporter }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const payload = JSON.stringify({
      portal: 'https://netibhaaratham.com',
      reporter_id: reporter.unique_reporter_id || reporter.registration_number,
      name: reporter.full_name,
      designation: reporter.designation,
      state: reporter.state_name_en || 'Telangana',
      district: reporter.district_name_en || 'Hyderabad',
      mandal: reporter.mandal_name_en || reporter.village_name,
      valid_until: reporter.expiry_date,
    });
    QRCode.toDataURL(payload, { margin: 1, width: 128 })
      .then(setQrUrl)
      .catch(() => setQrUrl(''));
  }, [reporter]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadReporterIdCardPdf(reporter);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const approvalFormatted = reporter.approval_date
    ? new Date(reporter.approval_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Pending';
  const expiryFormatted = reporter.expiry_date
    ? new Date(reporter.expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Pending';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Printable Official Press Identity Card */}
      <div
        id="printable-reporter-id-card"
        className="w-full max-w-[350px] bg-white border border-stone-300 rounded-xl overflow-hidden shadow-sm print:shadow-none"
      >
        {/* Top Crimson Header */}
        <div className="bg-[#991B1B] text-white px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/icon.svg"
              alt="NETI BHARATHAM Logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded bg-white/10 p-0.5"
            />
            <div className="text-left">
              <div className="text-base font-extrabold tracking-wide leading-tight">NETI BHARATHAM</div>
              <div className="text-xs font-bold text-amber-200 leading-tight">నేటి భారతం తెలుగు దినపత్రిక &amp; డిజిటల్ పోర్టల్</div>
            </div>
          </div>
          <div className="text-[11px] text-red-100 mt-1">Hyderabad, Telangana • https://netibhaaratham.com</div>
        </div>

        {/* Dark Blue Accreditation Strip */}
        <div className="bg-[#1E3A8A] text-white text-[11px] font-bold tracking-wider uppercase py-1.5 px-3 text-center">
          Official Press Identity Card • 6-Month Validity
        </div>

        {/* Reporter Photo & Core Details */}
        <div className="p-5 flex flex-col items-center">
          <div className="w-24 h-28 rounded-lg border-2 border-[#991B1B] overflow-hidden bg-stone-100 mb-3 shrink-0">
            <img
              src={reporter.profile_photo_path || '/icon.svg'}
              alt={reporter.full_name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <h3 className="text-base font-bold text-stone-900 text-center leading-snug">{reporter.full_name}</h3>
          <p className="text-xs font-bold text-[#991B1B] uppercase tracking-wide mt-0.5">{reporter.designation}</p>

          <div className="w-full border-t border-stone-200 my-3" />

          <dl className="w-full text-xs space-y-1.5 tabular-nums">
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <dt className="text-stone-500 font-medium">Reporter ID:</dt>
              <dd className="font-mono font-bold text-stone-900">{reporter.unique_reporter_id || reporter.registration_number}</dd>
            </div>
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <dt className="text-stone-500 font-medium">State (రాష్ట్రం):</dt>
              <dd className="font-semibold text-stone-900">{reporter.state_name_te || reporter.state_name_en || 'తెలంగాణ'}</dd>
            </div>
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <dt className="text-stone-500 font-medium">District (జిల్లా):</dt>
              <dd className="font-semibold text-stone-900">{reporter.district_name_te || reporter.district_name_en || 'హైదరాబాద్'}</dd>
            </div>
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <dt className="text-stone-500 font-medium">Mandal (మండలం):</dt>
              <dd className="font-semibold text-stone-900">{reporter.mandal_name_te || reporter.mandal_name_en || reporter.village_name}</dd>
            </div>
            <div className="flex justify-between py-0.5 border-b border-stone-100">
              <dt className="text-stone-500 font-medium">Approval Date:</dt>
              <dd className="font-mono font-semibold text-emerald-700">{approvalFormatted}</dd>
            </div>
            <div className="flex justify-between py-0.5">
              <dt className="text-stone-500 font-medium">Expiry Date (6 Months):</dt>
              <dd className="font-mono font-semibold text-[#991B1B]">{expiryFormatted}</dd>
            </div>
          </dl>

          {/* QR Code & Authorized Seal */}
          <div className="w-full mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
            <div className="text-left">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Press Credential</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-0.5">No Aadhaar / Private ID Exposed</p>
              <p className="text-[10px] font-semibold text-stone-700 mt-1">Editor-in-Chief, NETI BHARATHAM</p>
            </div>
            {qrUrl && (
              <img
                src={qrUrl}
                alt="Press Verification QR"
                className="w-14 h-14 border border-stone-200 rounded p-0.5"
              />
            )}
          </div>
        </div>

        {/* Bottom Dark Footer */}
        <div className="bg-slate-900 text-white px-3 py-2 text-center text-[10px]">
          <div className="font-semibold">https://netibhaaratham.com • netibhaarathamtelugu@gmail.com</div>
          <div className="text-stone-400">Subject to 6-Month Validity &amp; Editorial Code of Conduct</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-[#991B1B] hover:bg-red-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Generating PDF...' : 'Download PDF ID Card'}</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print ID Card</span>
        </button>
      </div>
    </div>
  );
};
