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

const SideBar: React.FC<Props> = ({ items }) => {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const handleSignout = () => {
    startTransition(async () => {
      console.log("signout clicked");
      await signout();
      router.replace("/sign-in");
      router.refresh();
    });
  };
  return (
    <aside
      className="fixed hidden md:flex left-0 top-16 w-0 md:w-64 h-[calc(100vh-4rem)] border-r bg-white z-30 flex flex-col"
      aria-label="Admin sidebar"
    >
      <div className="p-2 pl-4 border-b mt-5 flex items-center ">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>

      <ScrollArea className="flex-1 min-h-0 p-2 overflow-auto">
        <nav className="flex flex-col space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="block py-2 px-3 rounded hover:bg-pink-100"
            >
              {item.children}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Logout pinned to bottom */}
      <div className="">
        <ConfirmDialog
          title="Log out?"
          description="You will be signed out of your account."
          confirmLabel="Logout"
          destructive
          onConfirm={handleSignout}
          trigger={<Button className="w-full py-8 px-3 bg-pink-400 text-white text-lg rounded-none hover:bg-pink-600">
            {isPending ? "Logging out..." : "Logout"}
          </Button>}
        />
      </div>
    </aside>
  );
};

export default SideBar;
