import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Upload,
  AlertCircle,
  Check,
  RotateCw,
  Sparkles
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (photoDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashEffect, setFlashEffect] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (mode: 'user' | 'environment') => {
    setIsLoading(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Device Camera API is not supported in this browser environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {
          // auto-play catch
        });
      }
      setIsLoading(false);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setIsLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was blocked by browser permissions. Please allow camera access or use photo upload below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No active video camera device was found on this terminal.');
      } else {
        setCameraError(err.message || 'Unable to connect to video camera hardware. You can upload an image file or choose a preset.');
      }
    }
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;

    // Trigger visual shutter flash
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Center crop square for badge ID photo
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      onPhotoCaptured(dataUrl);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        stopCamera();
        onPhotoCaptured(dataUrl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleAvatar = (url: string) => {
    stopCamera();
    onPhotoCaptured(url);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#123B5D] px-5 py-3.5 flex items-center justify-between text-white border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal-300">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Capture Visitor ID Photo
              </h2>
              <p className="text-[11px] text-slate-300">
                Live security gate camera capture & badge photo attachment
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="p-5 flex flex-col items-center justify-center bg-slate-900 text-white min-h-[340px] relative overflow-hidden">
          {/* Shutter flash effect */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-150 opacity-90"></div>
          )}

          {cameraError ? (
            <div className="max-w-sm text-center p-5 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-white">Camera Hardware Unavailable</h4>
                <p className="text-[11px] text-slate-300 mt-1">{cameraError}</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#0F766E] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0c5e58] flex items-center justify-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo File
                </button>
                <button
                  onClick={() => startCamera(facingMode)}
                  className="bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-600 flex items-center justify-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry Connecting Camera
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-72 h-72 rounded-2xl overflow-hidden border-2 border-teal-500/60 bg-black flex items-center justify-center shadow-lg">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10 space-y-2">
                  <RefreshCw className="w-6 h-6 text-teal-400 animate-spin" />
                  <span className="text-xs text-slate-300">Initializing camera feed...</span>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Security ID Badge Face Frame Oval Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-56 border-2 border-dashed border-teal-400/70 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-teal-400/80 animate-ping"></div>
                </div>
                <span className="absolute bottom-2 text-[10px] font-mono uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded text-teal-300">
                  Align Face in Frame
                </span>
              </div>
            </div>
          )}

          {/* Hidden Canvas for capture processing */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* Camera switch button */}
            <button
              type="button"
              onClick={toggleCameraFacing}
              disabled={!!cameraError || isLoading}
              className="text-xs text-[#123B5D] hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition disabled:opacity-40"
              title="Flip between front and rear camera"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip Camera</span>
            </button>

            {/* Primary Snapshot Button */}
            <button
              type="button"
              onClick={handleCaptureFrame}
              disabled={!!cameraError || isLoading}
              className="bg-[#0F766E] text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#0c5e58] active:scale-95 transition shadow flex items-center gap-2 disabled:opacity-40"
            >
              <Camera className="w-4 h-4" />
              <span>Take Photo</span>
            </button>

            {/* Upload File Alternative */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
              title="Upload photo from disk"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
          </div>

          {/* Preset Headshots for easy testing */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>Quick Test Avatars:</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: 'Avatar 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
                { label: 'Avatar 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
                { label: 'Avatar 3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseSampleAvatar(item.url)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-teal-50 hover:text-[#0F766E] border border-slate-300 text-[10px] font-medium transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
