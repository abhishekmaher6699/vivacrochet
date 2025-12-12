import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";


export const signout = async () => {

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          redirect("/sign-in"); 
        },
      },
    });
}