"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!user) return <></>;
  return <div>{children}</div>;
}
