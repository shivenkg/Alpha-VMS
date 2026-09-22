import React, { useState } from 'react';
import { FileCode, Copy, Check, X, Printer, Terminal } from 'lucide-react';
import { BadgeTemplate, Tenant, Site } from '../../types';

interface ZplCodeStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: BadgeTemplate;
  activeTenant: Tenant;
  activeSite: Site;
}

export const ZplCodeStreamModal: React.FC<ZplCodeStreamModalProps> = ({
  isOpen,
  onClose,
  template,
  activeTenant,
  activeSite,
}) => {
  const [copied, setCopied] = useState(false);
  const [protocol, setProtocol] = useState<'ZPL' | 'ESCP'>('ZPL');

  if (!isOpen) return null;

  const printerBrand = template.thermalSettings?.printerBrand || 'ZEBRA';
  const darkness = template.thermalSettings?.darknessLevel ?? 9;
  const speed = template.thermalSettings?.printSpeedIps ?? 4;
  const dpi = template.thermalSettings?.resolutionDpi || 203;

  // Calculate dots based on DPI
  const dotsPerMm = dpi === 300 ? 11.81 : 8.0;
  const labelWidthDots = Math.round(template.widthMm * dotsPerMm);
  const labelHeightDots = Math.round(template.heightMm * dotsPerMm);

  // Generate realistic ZPL II Code
  const zplCode = `^XA
^PW${labelWidthDots}
^LL${labelHeightDots}
^PR${speed},${speed}
~SD${Math.min(30, darkness * 2)}
^LH0,0

; === VMS ENTERPRISE HEADER BANNER ===
^FO20,20^GB${labelWidthDots - 40},50,50,B,0^FS
^FO35,32^A0N,28,28^FR^FD${activeTenant.name.toUpperCase()}^FS
^FO35,60^A0N,18,18^FR^FD${activeSite.name} | GUEST PASS^FS

; === VISITOR DETAILS BLOCK ===
^FO35,90^A0N,36,36^FDRAJESH KUMAR^FS
^FO35,130^A0N,22,22^FDINFOSYS BPM SOLUTIONS^FS
^FO35,160^A0N,18,18^FDHOST: Vikramaditya Chauhan (SOC)^FS
^FO35,185^A0N,18,18^FDZONE: Zone B - Conference Room 4^FS
^FO35,210^A0N,16,16^FDVALID: TODAY UNTIL 23:59 IST^FS

; === SECURITY QR CODE (HMAC-SHA256 TOKEN) ===
^FO${labelWidthDots - 180},90^BQN,2,5^FDMA,https://vms.tata.in/v/TATA-VIS-4482^FS
^FO${labelWidthDots - 180},205^A0N,14,14^FDTATA-VIS-4482^FS

; === BARCODE / WATERMARK ===
^FO35,${labelHeightDots - 45}^BY2,2,30
^BCN,30,Y,N,N
^FDTATA4482^FS

; === INSTRUCTIONS FOOTER ===
^FO${labelWidthDots - 320},${labelHeightDots - 30}^A0N,14,14^FD${template.instructions.substring(0, 38)}^FS

^XZ`;

  // Generate ESC/P Brother Code
  const escpCode = `[ESC] @              ; Initialize Brother PT/QL Printer
[ESC] i a 01         ; Switch to ESC/P command mode
[ESC] i d 00         ; Margin specification
[ESC] ( C 02 00 ${labelHeightDots & 0xFF} ${(labelHeightDots >> 8) & 0xFF}  ; Page length
[ESC] i z 84 00 00 00 00 00  ; Print media info (Die-cut thermal)
PRINT "${activeTenant.name} - VISITOR PASS"
PRINT "Name: RAJESH KUMAR | Company: INFOSYS BPM"
PRINT "Host: Vikramaditya Chauhan | Zone: B-SOC"
BARCODE QR, "https://vms.tata.in/v/TATA-VIS-4482", 4, M
[FF]                 ; Form Feed / Cut`;

  const activeCode = protocol === 'ZPL' ? zplCode : escpCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#123B5D] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span>Thermal Hardware Stream Inspector</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-400/20 text-teal-200 border border-teal-300/30">
                  {protocol === 'ZPL' ? 'Zebra ZPL II' : 'Brother ESC/P'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Direct printhead command sequence for network edge thermal printers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600">Protocol:</span>
            <button
              onClick={() => setProtocol('ZPL')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                protocol === 'ZPL' ? 'bg-[#123B5D] text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Zebra ZPL II
            </button>
            <button
              onClick={() => setProtocol('ESCP')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                protocol === 'ESCP' ? 'bg-[#123B5D] text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Brother ESC/P
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">
              Target: {printerBrand} • {dpi} DPI • Speed: {speed} ips
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Stream</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Box */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900 text-teal-300 font-mono text-xs leading-relaxed selection:bg-teal-600 selection:text-white">
          <pre className="whitespace-pre-wrap">{activeCode}</pre>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-teal-700" />
            <span>Sends via TCP/IP Raw Port 9100 or Bluetooth L2CAP to turnstile thermal printer</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
