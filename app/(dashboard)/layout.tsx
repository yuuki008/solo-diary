import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await createClient(cookies());
  const { data: user } = await client.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div>{children}</div>;
}
