"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth/auth-client";

export default function DaftarPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Nama lengkap minimal 2 karakter";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const validation = registerSchema.safeParse({
      name,
      username: username || undefined,
      email,
      password,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      // Jika error terjadi pada step 1, otomatis kembalikan ke step 1
      if (fieldErrors.name || fieldErrors.username) {
        setStep(1);
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await (authClient.signUp.email as unknown as (params: {
        name: string;
        email: string;
        password: string;
        username?: string;
      }) => Promise<{ error?: { message?: string } }> )({
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
        username: validation.data.username,
      });

      if (res.error) {
        setServerError(
          res.error.message || "Gagal mendaftarkan akun. Periksa data Anda."
        );
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch {
      setServerError("Gagal menghubungi server pendaftaran. Coba sesaat lagi.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-2 border-border shadow-xl bg-surface/95 backdrop-blur-md">
      <CardHeader className="space-y-3 pb-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl sm:text-3xl font-display font-bold text-text">
            Daftar Siswa Baru
          </CardTitle>
          <span className="font-display font-medium text-xs px-3 py-1 rounded-full bg-secondary/30 text-text border border-secondary/50">
            Registrasi
          </span>
        </div>
        <CardDescription className="text-text-muted text-sm font-body">
          Buat akun untuk bergabung ke lingkungan pembelajaran sekolah SMK TI BAZMA.
        </CardDescription>

        {/* Progress Stepper (Kaidah UX: "Split Long Forms Into Steps & Showcase The Progress") */}
        <div className="flex items-center justify-center space-x-3 pt-3">
          {/* Step 1 Pill */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-display text-xs font-bold transition-all ${
                step === 1
                  ? "bg-primary text-text border-2 border-emerald-600 shadow-xs"
                  : "bg-emerald-500 text-white"
              }`}
            >
              {step === 2 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </div>
            <span
              className={`font-display text-xs font-semibold ${
                step === 1 ? "text-text" : "text-emerald-700"
              }`}
            >
              Identitas
            </span>
          </div>

          <div
            className={`w-12 h-0.5 rounded-full transition-all ${
              step === 2 ? "bg-emerald-500" : "bg-border"
            }`}
          />

          {/* Step 2 Pill */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-display text-xs font-bold transition-all ${
                step === 2
                  ? "bg-primary text-text border-2 border-emerald-600 shadow-xs"
                  : "bg-canvas text-text-muted border-2 border-border"
              }`}
            >
              2
            </div>
            <span
              className={`font-display text-xs font-semibold ${
                step === 2 ? "text-text" : "text-text-muted"
              }`}
            >
              Keamanan
            </span>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5 pt-6">
          {serverError && (
            <div className="p-3.5 rounded-2xl border-2 border-alert/30 bg-alert/10 text-alert text-xs font-body font-medium flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-alert" />
              <span>{serverError}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-2xl border-2 border-ok/30 bg-ok/10 text-ok text-xs font-body font-semibold flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-ok" />
              <span>Pendaftaran berhasil! Mengalihkan ke beranda...</span>
            </div>
          )}

          {/* LANGKAH 1: PROFIL & IDENTITAS SISWA */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-display font-semibold text-xs text-text">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Rizky"
                  disabled={isLoading || isSuccess}
                  className="rounded-2xl border-2 border-border bg-canvas/40 focus:bg-surface text-sm"
                />
                {errors.name && (
                  <p className="text-xs text-alert font-body font-medium mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="username" className="font-display font-semibold text-xs text-text">
                    Username
                  </Label>
                  <span className="text-[11px] font-body text-text-muted">Opsional</span>
                </div>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: ahmad_sija"
                  disabled={isLoading || isSuccess}
                  className="rounded-2xl border-2 border-border bg-canvas/40 focus:bg-surface text-sm"
                />
                <p className="text-[11px] font-body text-text-muted">
                  Digunakan untuk panggilan di ruang kelas dan forum mading.
                </p>
                {errors.username && (
                  <p className="text-xs text-alert font-body font-medium mt-1">{errors.username}</p>
                )}
              </div>
            </div>
          )}

          {/* LANGKAH 2: KREDENSIAL AKUN & KEAMANAN */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-display font-semibold text-xs text-text">
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: nama@email.com"
                  disabled={isLoading || isSuccess}
                  className="rounded-2xl border-2 border-border bg-canvas/40 focus:bg-surface text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-alert font-body font-medium mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-display font-semibold text-xs text-text">
                  Kata Sandi
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  disabled={isLoading || isSuccess}
                  className="rounded-2xl border-2 border-border bg-canvas/40 focus:bg-surface text-sm"
                />
                <p className="text-[11px] font-body text-text-muted">
                  Gunakan kombinasi huruf dan angka untuk keamanan akun.
                </p>
                {errors.password && (
                  <p className="text-xs text-alert font-body font-medium mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-border/50">
          {step === 1 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="w-full flex items-center justify-center space-x-2 rounded-2xl font-display font-bold py-3 text-sm"
            >
              <span>Lanjut ke Keamanan</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isLoading || isSuccess}
                className="w-1/3 flex items-center justify-center space-x-1.5 rounded-2xl font-display font-semibold text-xs h-11"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </Button>
              <Button
                type="submit"
                className="w-2/3 flex items-center justify-center space-x-2 rounded-2xl font-display font-bold py-3 text-sm h-11"
                disabled={isLoading || isSuccess}
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? "Menyimpan Data..." : "Daftar Sekarang"}</span>
              </Button>
            </div>
          )}

          <div className="text-center font-body text-xs text-text-muted">
            Sudah memiliki akun?{" "}
            <Link href="/masuk" className="text-accent hover:underline font-semibold font-display">
              Masuk di sini
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
