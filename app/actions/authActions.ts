import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { toast } from "sonner";


export const signout = async () => {

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully")
          redirect("/sign-in"); 
        },
      },
    });
}