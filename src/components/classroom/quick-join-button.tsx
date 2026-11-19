"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2 } from "lucide-react";
import { joinClassByCode } from "@/lib/classroom/actions";
import { Button } from "@/components/ui/button";

interface QuickJoinButtonProps {
  classCode: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function QuickJoinButton({
  classCode,
  label,
  variant = "outline",
  size = "sm",
  className,
}: QuickJoinButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [joined, setJoined] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleJoin = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await joinClassByCode(classCode);
      if (res.success) {
        setJoined(true);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal bergabung ke kelas");
      }
    });
  };

  if (joined) {
    return (
      <span className="inline-flex items-center space-x-1.5 text-ok font-display font-semibold text-xs border border-ok/30 bg-ok/10 px-3 py-1 rounded-full">
        <Check className="w-3.5 h-3.5 text-ok" />
        <span>Terdaftar di Kelas</span>
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleJoin}
        disabled={isPending}
        className={className}
      >
        {isPending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-accent" />
            <span>Menghubungkan...</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5 mr-1.5 text-text" />
            <span>{label || `Gabung ${classCode}`}</span>
          </>
        )}
      </Button>
      {errorMsg && (
        <span className="font-body text-xs text-alert">{errorMsg}</span>
      )}
    </div>
  );
}
