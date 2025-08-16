import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const code = url.searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(new URL("/login", url.origin));
    }

    const supabase = await createClient(cookies());
    await supabase.auth.exchangeCodeForSession(code);

    return NextResponse.redirect(new URL("/", url.origin));
  } catch (e) {
    console.error(e);
    const url = new URL(request.url);
    return NextResponse.redirect(new URL("/login", url.origin));
  }
}
