"use server";

import { createClient } from "@/lib/supabase/server";
import { validatePassword } from "@/lib/auth/password";
import { redirect } from "next/navigation";

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const backTo = `/login?mode=signup&email=${encodeURIComponent(email)}`;

  if (!email) {
    redirect("/login?mode=signup&error=missing_email");
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    redirect(`${backTo}&error=${encodeURIComponent(passwordError)}`);
  }

  if (password !== confirmPassword) {
    redirect(`${backTo}&error=${encodeURIComponent("Passwords don't match.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/app`,
    },
  });

  if (error) {
    redirect(`${backTo}&error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?confirm=1");
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing_credentials");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/app`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "google_unavailable")}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
