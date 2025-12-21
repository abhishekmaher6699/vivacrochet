"use client";

import Link from "next/link";
import React, {useTransition} from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signout } from "@/app/actions/authActions";
import { ConfirmDialog } from "../confirmPopup";

interface NavBarItem {
  href: string;
  children: React.ReactNode;
}

interface Props {
  items: NavBarItem[];
}

const MobileMenu: React.FC<Props> = ({ items }) => {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const handleSignout = () => {
    startTransition(async () => {
      console.log("signout clicked");
      await signout();
      router.replace("/admin/sign-in");
      router.refresh();
    });
  };

  return (
    <aside
      className="fixed border rounded-b-lg flex md:hidden left-0 top-20 w-full md:w-64 bg-white z-30 flex-col"
      aria-label="Admin MobileMenu"
    >
      <div className="p-2 pl-4 border-b mt-1 flex items-center ">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>

      <ScrollArea className="flex-1 min-h-0 p-2 overflow-auto">
        <nav className="flex flex-col space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 px-3 rounded hover:bg-pink-100"
            >
              {item.children}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <div className="rounded-b-lg">
        <ConfirmDialog
          title="Log out?"
          description="You will be signed out of your account."
          confirmLabel="Logout"
          destructive
          onConfirm={handleSignout}
          trigger={<Button className="w-full rounded-b-lg py-8 px-3 bg-pink-400 text-white text-lg hover:bg-pink-600">
               {isPending ? "Logging out..." : "Logout"}
          </Button>}
        />
      </div>
    </aside>
  );
};

export default MobileMenu;
