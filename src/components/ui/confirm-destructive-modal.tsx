"use client";

import * as React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmDestructiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmDestructiveModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  isLoading = false,
}: ConfirmDestructiveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-surface w-full max-w-sm p-6 sm:p-7 rounded-3xl border-2 border-border shadow-2xl text-center space-y-5 animate-in zoom-in-95">
        {/* Lingkaran Ikon Merah Danger (Psychology of Colors) */}
        <div className="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-600 mx-auto">
          <Trash2 className="w-7 h-7" />
        </div>

        {/* Teks Judul & Deskripsi */}
        <div className="space-y-2">
          <h3 className="font-display font-bold text-xl text-text leading-tight">
            {title}
          </h3>
          <p className="font-body text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {/* Tombol Aksi (Merah untuk Destructive, Netral untuk Batal) */}
        <div className="space-y-2.5 pt-2">
          <Button
            type="button"
            variant="danger"
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full h-11 rounded-2xl font-display font-bold text-sm bg-red-600 hover:bg-red-700 text-white border-b-4 border-red-900 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={onClose}
            className="w-full h-10 rounded-2xl font-display font-semibold text-xs border border-border"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
}
