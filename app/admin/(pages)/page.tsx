import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requireAdminAuth, requireAuth } from "@/lib/auth-utils";

export default async function AdminHome() {
  await requireAdminAuth()
  return (
    <div className="flex flex-col gap-4">

    </div>
  );
}
