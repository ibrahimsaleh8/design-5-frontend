import { Button } from "@/components/ui/button";
import { LogoutAction } from "./LogutAction";

export default function LogoutBtn() {
  return (
    <Button onClick={LogoutAction} variant={"destructive"}>
      تسجيل خروج
    </Button>
  );
}
