import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { ReporterProfile } from '../types';

/**
 * Generates an official, printable and downloadable PDF Press ID Card for an Approved Reporter.
 * Contains:
 * - NETI BHARATHAM logo & header
 * - Reporter photograph
 * - Reporter full name
 * - Unique Reporter ID
 * - Designation
 * - State, District, Mandal
 * - Approval Date & Expiry Date (6-Month Validity)
 * - Website Address (https://netibhaaratham.com)
 * - Verification QR Code
 *
 * SECURITY RULE: Never includes Aadhaar number or identity document image on the ID card.
 */
export async function downloadReporterIdCardPdf(reporter: ReporterProfile): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [86, 134], // Official Press Media Badge dimensions
  });

  // Card Background
  doc.setFillColor(251, 249, 245);
  doc.rect(0, 0, 86, 134, 'F');

  // Top Header Banner (Deep Crimson #991B1B)
  doc.setFillColor(153, 27, 27);
  doc.rect(0, 0, 86, 24, 'F');

  // Dark Blue Sub-ribbon (#1E3A8A)
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 24, 86, 6, 'F');

  // Header Brand Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('NETI BHARATHAM', 43, 10, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('NATIONAL & STATE TELUGU DIGITAL NEWS PORTAL', 43, 15.5, { align: 'center' });
  doc.text('Hyderabad, Telangana | https://netibhaaratham.com', 43, 20.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OFFICIAL PRESS IDENTITY CARD (6-MONTH VALIDITY)', 43, 28.2, { align: 'center' });

  // Try to embed Reporter Photo if available
  const photoY = 34;
  doc.setDrawColor(153, 27, 27);
  doc.setLineWidth(0.6);
  doc.rect(28, photoY, 30, 32);

  try {
    if (reporter.profile_photo_path) {
      const imgData = await fetchImageAsDataUrl(reporter.profile_photo_path);
      if (imgData) {
        doc.addImage(imgData, 'JPEG', 28.5, photoY + 0.5, 29, 31);
      }
    }
  } catch {
    // Fallback initials
    doc.setTextColor(120, 113, 108);
    doc.setFontSize(10);
    doc.text('PRESS PHOTO', 43, photoY + 17, { align: 'center' });
  }

  // Reporter Name & Designation
  const cleanName = reporter.full_name.replace(/[^\x20-\x7E]/g, '').replace(/[()]/g, '').trim() || reporter.username;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(cleanName.toUpperCase(), 43, 72, { align: 'center' });

  doc.setTextColor(153, 27, 27);
  doc.setFontSize(8.5);
  doc.text(reporter.designation.toUpperCase(), 43, 77, { align: 'center' });

  // Divider line
  doc.setDrawColor(214, 211, 209);
  doc.setLineWidth(0.3);
  doc.line(6, 80, 80, 80);

  // Metadata Rows
  const approvalDateStr = reporter.approval_date ? new Date(reporter.approval_date).toLocaleDateString('en-IN') : 'N/A';
  const expiryDateStr = reporter.expiry_date ? new Date(reporter.expiry_date).toLocaleDateString('en-IN') : 'N/A';

  const details: Array<[string, string]> = [
    ['Reporter ID', reporter.unique_reporter_id || reporter.registration_number],
    ['State', reporter.state_name_en || 'Telangana'],
    ['District', reporter.district_name_en || 'Hyderabad'],
    ['Mandal', reporter.mandal_name_en || reporter.village_name || 'Headquarters'],
    ['Approval Date', approvalDateStr],
    ['Expiry Date', expiryDateStr],
  ];

  let y = 85.5;
  doc.setFontSize(7.5);
  for (const [label, val] of details) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(87, 83, 78);
    doc.text(`${label}:`, 7, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(28, 25, 23);
    doc.text(String(val).slice(0, 28), 31, y);
    y += 5.2;
  }

  // Generate QR Code for instant Press ID Verification
  try {
    const verifyPayload = JSON.stringify({
      portal: 'https://netibhaaratham.com',
      reporter_id: reporter.unique_reporter_id,
      name: cleanName,
      designation: reporter.designation,
      valid_until: expiryDateStr,
    });
    const qrDataUrl = await QRCode.toDataURL(verifyPayload, { margin: 1, width: 120 });
    doc.addImage(qrDataUrl, 'PNG', 63, 98, 17, 17);
  } catch {
    // ignore QR error
  }

  // Bottom Footer Bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 122, 86, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('www.netibhaaratham.com | netibhaarathamtelugu@gmail.com', 43, 127, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('Valid for 6 Months from Approval Date • Press Credential', 43, 131, { align: 'center' });

  doc.save(`Neti_Bharatham_ID_${reporter.unique_reporter_id || reporter.id}.pdf`);
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  if (url.startsWith('data:image/')) return url;
  const res = await fetch(url);
  if (!res.ok) return null;
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}
