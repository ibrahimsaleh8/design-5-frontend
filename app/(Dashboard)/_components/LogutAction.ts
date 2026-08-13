"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const LogoutAction = async () => {
  "use server";

  const cookieStore = await cookies();
  // Delete your token cookie
  cookieStore.delete("token");

  // Optional: redirect to login page
  redirect("/login");
};
