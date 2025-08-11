"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, authUser, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && authUser) {
      router.replace("/");
    }
  }, [authUser, loading, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "ログインに失敗しました";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh max-w-sm mx-auto w-[95%] flex flex-col items-center justify-center">
      <form onSubmit={onSubmit} className="space-y-4 w-full">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button disabled={submitting} type="submit">
            {submitting ? "ログイン中..." : "ログイン"}
          </Button>
        </div>
      </form>
      <div className="mt-4 w-full flex items-center">
        <p className="text-sm text-gray-500">アカウントをお持ちでない方は</p>
        <Button
          variant="link"
          type="button"
          className="px-1"
          onClick={() => router.push("/signup")}
        >
          こちら
        </Button>
      </div>
    </div>
  );
}
