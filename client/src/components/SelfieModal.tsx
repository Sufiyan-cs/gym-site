"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelfieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelected: (dataUrl: string) => void;
  currentAvatar?: string;
}

export default function SelfieModal({
  isOpen,
  onClose,
  onPhotoSelected,
  currentAvatar,
}: SelfieModalProps) {
  const [mode, setMode] = useState<"idle" | "camera" | "preview">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setMode("idle");
      setPreviewUrl(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setErrorMsg(null);
    setIsStartingCamera(true);
    setMode("camera");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device/browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setErrorMsg(
        err?.message || "Could not access camera. Please allow camera permissions or upload an image."
      );
      setMode("idle");
      stopCamera();
    } finally {
      setIsStartingCamera(false);
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight) || 400;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Crop centered square
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    stopCamera();
    setPreviewUrl(dataUrl);
    setMode("preview");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 512;
        let w = img.width;
        let h = img.height;

        // Crop to square
        const minDim = Math.min(w, h);
        const startX = (w - minDim) / 2;
        const startY = (h - minDim) / 2;

        canvas.width = Math.min(minDim, maxDim);
        canvas.height = Math.min(minDim, maxDim);

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            canvas.width,
            canvas.height
          );
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          setPreviewUrl(compressed);
          setMode("preview");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const confirmPhoto = () => {
    if (previewUrl) {
      onPhotoSelected(previewUrl);
      onClose();
    }
  };

  const selectPreset = (url: string) => {
    setPreviewUrl(url);
    setMode("preview");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface-card rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-surface-card">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                photo_camera
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Athlete Profile Photo
              </h3>
              <p className="text-[10px] text-outline">
                Live Selfie or Gallery Upload
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-surface-elevated text-outline hover:text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                warning
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Camera Viewfinder */}
          {mode === "camera" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary/60 shadow-[0_0_30px_rgba(255,154,46,0.3)] bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: "scaleX(-1)" }}
                />
                {isStartingCamera && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-xs gap-2">
                    <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Opening front camera...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="px-6 py-3 rounded-full bg-primary text-black font-extrabold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all amber-glow"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    camera
                  </span>
                  <span>Snap Selfie</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setMode("idle");
                  }}
                  className="px-4 py-3 rounded-full bg-surface-elevated border border-white/10 text-outline hover:text-white text-xs font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Preview of Captured / Selected Image */}
          {mode === "preview" && previewUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary shadow-[0_0_24px_rgba(255,154,46,0.4)] bg-surface-container">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-white">Looking sharp!</p>
                <p className="text-[10px] text-outline mt-0.5">
                  Confirm to set as your AM-Tippu profile picture
                </p>
              </div>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={confirmPhoto}
                  className="flex-1 py-3.5 rounded-full bg-primary text-black font-extrabold text-xs shadow-lg active:scale-95 transition-all amber-glow flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                  <span>Set as Profile Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setMode("idle");
                  }}
                  className="px-4 py-3.5 rounded-full bg-surface-elevated border border-white/10 text-outline hover:text-white text-xs font-bold active:scale-95 transition-all"
                >
                  Retake
                </button>
              </div>
            </div>
          )}

          {/* Idle Mode: Choose options */}
          {mode === "idle" && (
            <div className="space-y-4">
              {/* Current Avatar preview */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="w-28 h-28 rounded-full p-[2.5px] bg-gradient-to-b from-primary to-surface-card shadow-[0_0_20px_rgba(255,154,46,0.25)]">
                  <img
                    src={
                      currentAvatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                    }
                    alt="Current Avatar"
                    className="w-full h-full rounded-full object-cover bg-surface-card"
                  />
                </div>
                <p className="text-[11px] text-outline mt-2">
                  Take a fresh selfie or select from your gallery
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-elevated border border-white/10 flex flex-col items-center justify-center text-center gap-2 group active:scale-95 transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">
                      photo_camera
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Live Selfie
                    </span>
                    <span className="text-[10px] text-outline">
                      Use front camera
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-elevated border border-white/10 flex flex-col items-center justify-center text-center gap-2 group active:scale-95 transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-secondary/15 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">
                      add_photo_alternate
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      From Gallery
                    </span>
                    <span className="text-[10px] text-outline">
                      Choose file
                    </span>
                  </div>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Athletic Presets */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-2">
                  Or pick an athletic avatar:
                </span>
                <div className="flex gap-2 justify-center">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
                    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=256",
                    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=256",
                  ].map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectPreset(url)}
                      className="w-11 h-11 rounded-full border border-white/10 overflow-hidden hover:border-primary active:scale-95 transition-all"
                    >
                      <img
                        src={url}
                        alt="Preset"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
