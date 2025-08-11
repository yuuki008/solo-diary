"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SignupPage() {
  const router = useRouter();
  const { signUp, authUser, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && authUser) {
      router.replace("/");
    }
  }, [authUser, loading, router]);

  const onSelectFile = (file: File | null) => {
    setProfileImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePreview(url);
    } else {
      setProfilePreview(null);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp(email, password, username, profileImageFile);
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
    <div className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>サインアップ</CardTitle>
          <CardDescription>
            プロフィール画像・名前・メール・パスワードを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {profilePreview ? (
                  <AvatarImage src={profilePreview} alt="preview" />
                ) : (
                  <AvatarFallback>PF</AvatarFallback>
                )}
              </Avatar>
              <label className="text-sm font-medium" htmlFor="profile">
                プロフィール画像
              </label>
              <Input
                id="profile"
                type="file"
                accept="image/*"
                onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                名前
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="あなたの名前"
                autoComplete="nickname"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "作成中..." : "アカウント作成"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            variant="link"
            type="button"
            className="px-0"
            onClick={() => router.push("/login")}
          >
            すでにアカウントをお持ちの方はこちら
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
