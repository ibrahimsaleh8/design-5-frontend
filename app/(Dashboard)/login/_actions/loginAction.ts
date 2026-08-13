"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { APP_URL } from "@/lib/ProjectId";

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "البريد الالكترونى وكلمة المرور مطلوبان" };
  }

  try {
    const res = await fetch(`${APP_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "فشل تسجيل الدخول" };
    }

    if (data.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set("token", data.data?.token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return { error: "حدث خطأ ما. يرجى المحاولة مرة أخرى." };
  }

  redirect("/dashboard");
}
