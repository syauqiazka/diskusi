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
      <span className="inline-flex items-center space-x-1.5 text-ok font-mono text-xs border border-ok/40 bg-ok/10 px-2.5 py-1">
        <Check className="w-3.5 h-3.5 text-ok" />
        <span>TERDAFTAR DI KELAS</span>
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
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            <span>MENGHUBUNGKAN...</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5 mr-1.5 text-caution" />
            <span>{label || `GABUNG ${classCode}`}</span>
          </>
        )}
      </Button>
      {errorMsg && (
        <span className="font-mono text-[10px] text-alert">{errorMsg}</span>
      )}
    </div>
  );
}
