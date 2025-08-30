"use client";

import { useAuth } from "@/providers/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <></>;

  return <div>{children}</div>;
}
