"use client";

import { useActionState } from "react";
import { loginAction } from "../_actions/loginAction";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          تسجيل الدخول ادمين
        </h1>

        <form action={formAction} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              البريد الالكترونى
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="البريد الالكترونى"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="كلمة المرور"
            />
          </div>

          {/* Error */}
          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full cursor-pointer bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
            {isPending ? "جارى تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
