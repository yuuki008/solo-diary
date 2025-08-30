"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

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
      <h1 className="mb-8 text-center text-4xl font-bold">Solo Diary</h1>
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

        <Button disabled={submitting} type="submit" className="w-full">
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <Separator className="mt-6 mb-4" />
      <div className="w-full flex items-center justify-center gap-1">
        <p className="text-sm text-gray-500">Don&apos;t have an account?</p>
        <Link href="/signup" className="text-sm text-blue-500 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
