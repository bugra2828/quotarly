"use server";

import { createClient } from "@/lib/supabase/server";
import { validatePassword } from "@/lib/auth/password";
import { track } from "@vercel/analytics/server";
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

  await track("Signup completed");
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

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/forgot-password?error=missing_email");
  }

  const supabase = await createClient();
  // Don't leak whether the email exists either way — always show the same
  // "check your email" screen regardless of the result.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/reset-password`,
  });

  redirect("/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  const passwordError = validatePassword(password);
  if (passwordError) {
    redirect(`/reset-password?error=${encodeURIComponent(passwordError)}`);
  }

  if (password !== confirmPassword) {
    redirect(`/reset-password?error=${encodeURIComponent("Passwords don't match.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app?password_updated=1");
}
