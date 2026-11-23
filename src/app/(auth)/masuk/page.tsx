"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth/auth-client";

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (res.error) {
        setServerError(
          res.error.message || "Email atau kata sandi tidak cocok. Periksa kembali."
        );
        setIsLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setServerError("Gagal menghubungi server autentikasi. Coba sesaat lagi.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-2 border-border shadow-xl bg-surface/95 backdrop-blur-md">
      <CardHeader className="space-y-2 pb-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl sm:text-3xl font-display font-bold text-text">
            Masuk ke Kelas
          </CardTitle>
          <span className="font-display font-medium text-xs px-3 py-1 rounded-full bg-primary/20 text-text border border-primary/40">
            Akun Sekolah
          </span>
        </div>
        <CardDescription className="text-text-muted text-sm font-body">
          Gunakan akun sekolah Anda untuk mengakses kelas, forum, materi, dan dunia 3D.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-6">
          {serverError && (
            <div className="p-3.5 rounded-2xl border-2 border-alert/30 bg-alert/10 text-alert text-xs font-body font-medium flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-alert" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Grup Email (Kaidah UX: Law of Proximity, Jarak Label-Input 6px, Jarak Antar Grup 20px) */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-display font-semibold text-xs text-text">
              Alamat Email Sekolah
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: nama@sekolah.id"
              disabled={isLoading}
              className="rounded-2xl border-2 border-border bg-canvas/40 focus:bg-surface text-sm"
            />
            {errors.email && (
              <p className="text-xs text-alert font-body font-medium mt-1">{errors.email}</p>
            )}
          </div>

          {/* Grup Kata Sandi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-display font-semibold text-xs text-text">
                Kata Sandi
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              disabled={isLoading}
              className="rounded-2xl border-2 border-border bg-canvas/40 focus:bg-surface text-sm"
            />
            {errors.password && (
              <p className="text-xs text-alert font-body font-medium mt-1">{errors.password}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-5 border-t border-border/50">
          <Button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 rounded-2xl font-display font-bold py-3 text-sm"
            disabled={isLoading}
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? "Memeriksa Akun..." : "Masuk Sekarang"}</span>
          </Button>

          <div className="text-xs font-body text-text-muted text-center">
            Belum memiliki akun?{" "}
            <Link
              href="/daftar"
              className="font-bold text-accent hover:underline ml-1"
            >
              Daftar Siswa Baru
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

