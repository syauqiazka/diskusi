"use client";

import * as React from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMb?: number;
}

export function ImageUploader({
  value,
  onChange,
  label = "Unggah Gambar",
  description = "Format JPG, PNG, atau WebP (Maksimal 10 MB)",
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSizeMb = 10,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = React.useState<number | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    setErrorMessage(null);

    // Validasi ukuran client-side
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMessage(`Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal ${maxSizeMb} MB.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setEstimatedSeconds(2);

    try {
      // Simulasikan progres pasti (Rule 11: "SHOW HOW LONG")
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressTimer);
            return 85;
          }
          return prev + 25;
        });
      }, 300);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah berkas ke penyimpanan awan.");
      }

      setUploadProgress(100);
      setEstimatedSeconds(0);
      onChange(data.url);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah.");
      onChange(null);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setEstimatedSeconds(null);
      }, 500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2 font-body select-none">
      {label && (
        <label className="font-display font-semibold text-xs text-text block">
          {label}
        </label>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-2xl border-2 border-red-500/30 bg-red-500/10 text-red-600 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Jika sudah ada gambar terunggah */}
      {value ? (
        <div className="relative rounded-2xl border-2 border-border bg-canvas/40 p-3 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Pratinjau unggahan"
              className="w-14 h-14 rounded-xl object-cover border-2 border-border shrink-0 bg-surface"
            />
            <div className="space-y-0.5 truncate text-xs">
              <span className="font-display font-bold text-text flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                <span>Berkas Tersimpan di Vercel Blob</span>
              </span>
              <p className="text-[11px] text-text-muted truncate font-mono">
                {value}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => onChange(null)}
            className="shrink-0 h-9 px-3 rounded-xl font-display text-xs"
            title="Hapus gambar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        /* Area Unggah Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border hover:border-primary/60 hover:bg-canvas/50 bg-canvas/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            /* Determinate Progress Indicator (Rule 11: "SHOW HOW LONG") */
            <div className="space-y-3 py-2 max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display font-bold text-text flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span>Mengunggah Berkas...</span>
                </span>
                <span className="font-mono text-text-muted text-[11px]">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-border/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {estimatedSeconds !== null && (
                <p className="text-[11px] text-text-muted font-body">
                  {estimatedSeconds > 0
                    ? `Perkiraan waktu sisa ~${estimatedSeconds} detik`
                    : "Menyelesaikan penyimpanan..."}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2 py-1">
              <div className="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center text-text mx-auto">
                <Upload className="w-5 h-5 text-text" />
              </div>
              <div>
                <p className="font-display font-bold text-xs text-text">
                  Klik untuk memilih gambar atau seret ke sini
                </p>
                <p className="font-body text-[11px] text-text-muted mt-0.5">
                  {description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
