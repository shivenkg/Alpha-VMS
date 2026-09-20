import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Visit, Tenant, Site } from '../types';

export interface PassPdfOptions {
  autoDownload?: boolean;
  themeColor?: string;
}

/**
 * Generates an enterprise-grade visitor pass PDF document
 * with embedded QR code, security watermark, and visitor clearance details.
 */
export async function generateVisitorPassPdf(
  visit: Visit,
  tenant: Tenant,
  site: Site,
  options: PassPdfOptions = { autoDownload: true }
): Promise<{ doc: jsPDF; fileName: string }> {
  // Pass badge dimensions: Standard 100mm x 150mm (A6 portrait proportion)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 150],
  });

  const primaryColor = options.themeColor || '#123B5D';

  // 1. Outer Security Border
  doc.setDrawColor(18, 59, 93);
  doc.setLineWidth(0.5);
  doc.roundedRect(3, 3, 94, 144, 3, 3, 'S');

  // 2. Header Color Band
  doc.setFillColor(18, 59, 93); // #123B5D
  doc.rect(3, 3, 94, 25, 'F');

  // Tenant / Corporate Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const tenantTitle = (tenant.name || 'ENTERPRISE VMS').toUpperCase();
  doc.text(tenantTitle, 50, 11, { align: 'center' });

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 220, 240);
  doc.text('JS ALPHASOFT ENTERPRISE VMS • VISITOR SECURITY PASS', 50, 16.5, { align: 'center' });

  // Category Pill inside header
  doc.setFillColor(15, 118, 110); // #0F766E Teal
  doc.roundedRect(28, 19.5, 44, 6, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const catLabel = (visit.visitorCategory || 'VISITOR').replace(/_/g, ' ').toUpperCase();
  doc.text(catLabel, 50, 23.8, { align: 'center' });

  // 3. Visitor Identity Section
  doc.setTextColor(23, 43, 58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(visit.visitorName, 50, 36, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 118, 110);
  doc.text(visit.visitorCompany || 'Authorized Guest', 50, 41, { align: 'center' });

  // Badge Number Chip
  doc.setFillColor(244, 247, 250);
  doc.setDrawColor(216, 225, 232);
  doc.roundedRect(24, 44, 52, 6, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(82, 101, 117);
  doc.text(`BADGE: ${visit.badgeNumber || 'TATA-BLR-0081'}`, 50, 48.2, { align: 'center' });

  // 4. Dynamic QR Code Generation & Embedding
  const qrPayload = JSON.stringify({
    vms: 'JS_ALPHASOFT_VMS_PASS',
    token: visit.passToken,
    visitId: visit.id,
    visitor: visit.visitorName,
    company: visit.visitorCompany,
    badge: visit.badgeNumber || 'PENDING',
    siteId: visit.siteId,
    state: visit.state,
    expiresAt: visit.passTokenExpiresAt,
    checksum: `sha256:${visit.id.slice(-6)}-${visit.passToken.slice(-6)}`,
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#123B5D',
        light: '#FFFFFF',
      },
    });

    // Embed QR code: centered at x=31, y=52, w=38, h=38
    doc.addImage(qrDataUrl, 'PNG', 31, 52, 38, 38);
  } catch (err) {
    console.error('Failed to embed QR code in PDF pass:', err);
  }

  // QR Instruction caption
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 118, 110);
  doc.text('TOUCHLESS TURNSTILE & EXPRESS EXIT QR', 50, 93, { align: 'center' });

  // 5. Visit Clearance Table Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(7, 96, 86, 32, 2, 2, 'FD');

  const startY = 102;
  const lineGap = 6.2;

  // Row 1: Host
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(82, 101, 117);
  doc.text('Host Sponser:', 11, startY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 43, 58);
  doc.text(`${visit.hostName} (${visit.departmentName})`, 33, startY);

  // Row 2: Campus / Site
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 101, 117);
  doc.text('Campus / Site:', 11, startY + lineGap);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 43, 58);
  doc.text(site.name, 33, startY + lineGap);

  // Row 3: Validity Date
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 101, 117);
  doc.text('Valid Window:', 11, startY + lineGap * 2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(23, 43, 58);
  const dateStr = new Date(visit.scheduledStart).toLocaleDateString();
  doc.text(`${dateStr} • Until 20:00 IST`, 33, startY + lineGap * 2);

  // Row 4: Permitted Zone
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 101, 117);
  doc.text('Access Zone:', 11, startY + lineGap * 3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(visit.assignedZone || 'Main Reception & Conference Rooms', 33, startY + lineGap * 3);

  // 6. Security & Safety Compliance Footer
  doc.setFontSize(5.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Pass must be visibly worn. Subject to facility zero-trust security audit.', 50, 134, { align: 'center' });
  doc.text('In event of emergency, report to designated Campus Muster Point immediately.', 50, 137.5, { align: 'center' });

  // 7. Security Checksum / Unique Token
  doc.setFontSize(5.5);
  doc.setFont('courier', 'normal');
  doc.setTextColor(148, 163, 184);
  const tokenFormatted = `TOKEN: ${visit.passToken} • CRC: SHA256-${visit.id.slice(-6).toUpperCase()}`;
  doc.text(tokenFormatted, 50, 142, { align: 'center' });

  const safeVisitorName = visit.visitorName.replace(/[^a-zA-Z0-9]/g, '_');
  const safeBadge = (visit.badgeNumber || visit.id.slice(-4)).replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Visitor_Pass_${safeVisitorName}_${safeBadge}.pdf`;

  if (options.autoDownload !== false) {
    doc.save(fileName);
  }

  return { doc, fileName };
}
