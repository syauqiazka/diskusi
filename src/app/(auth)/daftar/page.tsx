"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth/auth-client";

export default function DaftarPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
    <Card className="border-fluor/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-hud tracking-widest text-caution">
            DAFTAR SISWA BARU
          </CardTitle>
          <span className="font-mono text-xs px-2 py-0.5 border border-fluor/30 text-fluor/70">
            REGISTRASI
          </span>
        </div>
        <CardDescription>
          Buat akun untuk bergabung ke kawasan pembelajaran SMK TI BAZMA.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {serverError && (
            <div className="p-3 border border-alert/60 bg-alert/10 text-alert text-xs font-mono flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 border border-ok/60 bg-ok/10 text-ok text-xs font-mono flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Pendaftaran berhasil! Mengalihkan ke halaman gerbang...</span>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ahmad Rizky"
              disabled={isLoading || isSuccess}
            />
            {errors.name && (
              <p className="text-xs text-alert font-mono mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="username">Username (Opsional)</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ahmad_sija"
              disabled={isLoading || isSuccess}
            />
            {errors.username && (
              <p className="text-xs text-alert font-mono mt-1">{errors.username}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Alamat Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmad@sekolah.id"
              disabled={isLoading || isSuccess}
            />
            {errors.email && (
              <p className="text-xs text-alert font-mono mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Kata Sandi (Minimal 8 Karakter)</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading || isSuccess}
            />
            {errors.password && (
              <p className="text-xs text-alert font-mono mt-1">{errors.password}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full flex items-center justify-center space-x-2"
            disabled={isLoading || isSuccess}
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? "MENYIMPAN DATA..." : "DAFTAR SEKARANG"}</span>
          </Button>

          <div className="text-xs font-mono text-fluor/60 text-center">
            Sudah memiliki akun?{" "}
            <Link
              href="/masuk"
              className="text-caution hover:underline uppercase tracking-wider"
            >
              Masuk di sini
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
