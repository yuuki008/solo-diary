"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email, password, username);
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "サインアップに失敗しました";
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="your name"
          autoComplete="nickname"
        />
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
          autoComplete="new-password"
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button disabled={submitting} type="submit" className="w-full">
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <Separator className="mt-6 mb-4" />
      <div className="w-full flex items-center justify-center gap-1">
        <p className="text-sm text-gray-500">Already have an account?</p>
        <Link href="/login" className="text-sm text-blue-500 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
