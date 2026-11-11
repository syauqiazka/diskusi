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
    <Card className="border-fluor/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-hud tracking-widest text-caution">
            MASUK KE KELAS
          </CardTitle>
          <span className="font-mono text-xs px-2 py-0.5 border border-fluor/30 text-fluor/70">
            AUTENTIKASI
          </span>
        </div>
        <CardDescription>
          Gunakan akun SMK TI BAZMA Anda untuk mengakses forum dan materi.
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

          <div className="space-y-1">
            <Label htmlFor="email">Alamat Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@sekolah.id"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-alert font-mono mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
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
            disabled={isLoading}
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? "MEMERIKSA KREDENSIAL..." : "MASUK KE SEKOLAH"}</span>
          </Button>

          <div className="text-xs font-mono text-fluor/60 text-center">
            Belum memiliki akun?{" "}
            <Link
              href="/daftar"
              className="text-caution hover:underline uppercase tracking-wider"
            >
              Daftar Siswa Baru
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
