import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./_components/LoginForm";

export default async function LoginPage() {
  const token = (await cookies()).get("token");

  if (token) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
